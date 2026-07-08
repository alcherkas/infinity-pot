import { AGENTS } from "./agents.js";
import type { ProjectContext } from "./context.js";
import { runGate } from "./gate.js";
import { runAgent } from "./runner.js";
import { writeBuildFiles, writeTurnSnapshot } from "./persist.js";
import type { Bug, Review, TestReport } from "./schemas.js";

function log(step: string, msg: string): void {
  console.log(`  [${step}] ${msg}`);
}

function mergeBugs(ctx: ProjectContext, incoming: Bug[]): void {
  for (const b of incoming) {
    const existing = ctx.bugs.find((x) => x.id === b.id);
    if (existing) Object.assign(existing, b);
    else ctx.bugs.push(b);
  }
}

/** Requirement-shaped view handed to design/plan/build agents. */
function designInput(ctx: ProjectContext) {
  return {
    idea: ctx.idea,
    requirements: ctx.requirements,
    architecture: ctx.architecture,
    api: ctx.api,
    dataModel: ctx.dataModel,
    designReview: ctx.designReview,
  };
}

async function refine(ctx: ProjectContext): Promise<void> {
  const refined = await runAgent(AGENTS["requirement-refiner"], {
    idea: ctx.idea,
    turnPlan: ctx.turnPlan,
    requirements: ctx.requirements,
    assumptions: ctx.assumptions,
    understandReview: ctx.understandReview,
  });
  ctx.requirements = refined;

  const po = await runAgent(AGENTS["product-owner"], {
    idea: ctx.idea,
    requirements: ctx.requirements,
    turnPlan: ctx.turnPlan,
  });
  ctx.requirements.openQuestions = po.openQuestions;
  ctx.assumptions = po.assumptions;

  const materiallyChanged =
    (refined.changeNote && refined.changeNote.toLowerCase() !== "no change") ||
    po.requirementsChanged;

  if (materiallyChanged) {
    const gate = await runGate<typeof ctx.requirements>(
      async (review) => {
        if (!review) return ctx.requirements!;
        const re = await runAgent(
          AGENTS["requirement-refiner"],
          { idea: ctx.idea, requirements: ctx.requirements, understandReview: review },
          "Address every finding in understandReview.",
        );
        ctx.requirements = re;
        return re;
      },
      (reqs) => runAgent(AGENTS["requirements-critic"], { idea: ctx.idea, requirements: reqs }),
      ctx.maxGateIterations,
    );
    ctx.understandReview = gate.review;
    if (gate.overridden) ctx.gateOverrides.push("requirements-critic: proceeded after max iterations");
    log("refine", `requirements ${gate.review.verdict} (${gate.iterations} cycle(s))`);
  } else {
    log("refine", "requirements unchanged");
  }
}

async function runDesignShelf(ctx: ProjectContext): Promise<void> {
  const gate = await runGate<void>(
    async (review) => {
      ctx.architecture = await runAgent(AGENTS.architect, {
        ...designInput(ctx),
        designReview: review ?? ctx.designReview,
      });
      const [api, data] = await Promise.all([
        runAgent(AGENTS["api-designer"], { ...designInput(ctx), designReview: review }),
        runAgent(AGENTS["data-modeler"], { ...designInput(ctx), designReview: review }),
      ]);
      ctx.api = api;
      ctx.dataModel = data;
    },
    () => runAgent(AGENTS["design-critic"], designInput(ctx)),
    ctx.maxGateIterations,
  );
  ctx.designReview = gate.review;
  if (gate.overridden) ctx.gateOverrides.push("design-critic: proceeded after max iterations");
  log("act", `design ${gate.review.verdict} (${gate.iterations} cycle(s), api ∥ data-modeler)`);
}

async function developTask(ctx: ProjectContext, taskId: string): Promise<void> {
  const gate = await runGate(
    async (review) => {
      const impl = await runAgent(
        AGENTS.developer,
        {
          taskId,
          task: ctx.backlog?.tasks.find((t) => t.id === taskId),
          architecture: ctx.architecture,
          api: ctx.api,
          dataModel: ctx.dataModel,
          build: ctx.build,
          review,
        },
        `Implement task ${taskId}.`,
      );
      const idx = ctx.build.findIndex((b) => b.taskId === taskId);
      if (idx >= 0) ctx.build[idx] = impl;
      else ctx.build.push(impl);
      return impl;
    },
    () =>
      runAgent(AGENTS["code-reviewer"], {
        taskId,
        task: ctx.backlog?.tasks.find((t) => t.id === taskId),
        api: ctx.api,
        dataModel: ctx.dataModel,
        build: ctx.build.find((b) => b.taskId === taskId),
      }),
    ctx.maxGateIterations,
  );
  ctx.codeReviews[taskId] = gate.review;
  const task = ctx.backlog?.tasks.find((t) => t.id === taskId);
  if (task) task.status = gate.review.verdict === "APPROVED" ? "DONE" : "IN_REVIEW";
  if (gate.overridden) ctx.gateOverrides.push(`code-reviewer:${taskId}: proceeded after max iterations`);
  log("act", `${taskId} ${gate.review.verdict} (${gate.iterations} cycle(s))`);
}

async function act(ctx: ProjectContext, next: string): Promise<void> {
  const [base, arg] = next.split(":");
  ctx.lastAction = next;

  switch (base) {
    case "architect":
    case "api-designer":
    case "data-modeler":
    case "design-critic":
      await runDesignShelf(ctx);
      break;

    case "planner": {
      ctx.backlog = await runAgent(AGENTS.planner, {
        ...designInput(ctx),
        backlog: ctx.backlog,
        turnPlan: ctx.turnPlan,
      });
      log("act", `planner: ${ctx.backlog.tasks.length} task(s)`);
      break;
    }
    case "estimator": {
      ctx.backlog = await runAgent(AGENTS.estimator, { backlog: ctx.backlog });
      log("act", `estimator: ${ctx.backlog.tasks.length} task(s) sized`);
      break;
    }

    case "developer":
    case "code-reviewer": {
      const taskId = arg ?? ctx.backlog?.tasks.find((t) => t.status !== "DONE")?.id;
      if (!taskId) {
        log("act", "no task to develop");
        break;
      }
      await developTask(ctx, taskId);
      break;
    }

    case "test-writer": {
      ctx.testPlan = await runAgent(AGENTS["test-writer"], {
        backlog: ctx.backlog,
        api: ctx.api,
        dataModel: ctx.dataModel,
        build: ctx.build,
      });
      log("act", `test-writer: ${ctx.testPlan.testCount} test(s)`);
      break;
    }

    case "qa-engineer": {
      const report: TestReport = await runAgent(AGENTS["qa-engineer"], {
        build: ctx.build,
        testPlan: ctx.testPlan,
        bugs: ctx.bugs,
      });
      ctx.testReport = report;
      mergeBugs(ctx, report.bugs);
      log("act", `qa-engineer ${report.verdict} (${report.passed}/${report.passed + report.failed} pass)`);
      break;
    }
    case "ui-tester": {
      const report: TestReport = await runAgent(AGENTS["ui-tester"], {
        requirements: ctx.requirements,
        build: ctx.build,
        bugs: ctx.bugs,
      });
      ctx.uiReport = report;
      mergeBugs(ctx, report.bugs);
      log("act", `ui-tester ${report.verdict} (${report.passed} passed / ${report.failed} failed)`);
      break;
    }

    case "bug-fixer": {
      const bugId = arg ?? ctx.bugs.find((b) => b.status === "OPEN")?.id;
      const bug = ctx.bugs.find((b) => b.id === bugId);
      if (!bug) {
        log("act", "no open bug to fix");
        break;
      }
      const fix = await runAgent(AGENTS["bug-fixer"], { bug, build: ctx.build }, `Fix bug ${bug.id}.`);
      Object.assign(bug, fix.bug);
      if (fix.files.length) {
        ctx.build.push({
          taskId: `fix-${bug.id}`,
          files: fix.files,
          status: "DONE",
          startCommand: ctx.architecture?.startCommand ?? "",
          notes: [],
        });
      }
      log("act", `${bug.id} -> ${bug.status}`);
      break;
    }

    case "tech-writer":
    case "security-reviewer": {
      // tech-writer ∥ security-reviewer
      const [docs, sec] = await Promise.all([
        runAgent(AGENTS["tech-writer"], {
          requirements: ctx.requirements,
          build: ctx.build,
          testReport: ctx.testReport,
        }),
        runAgent(AGENTS["security-reviewer"], { build: ctx.build, api: ctx.api }),
      ]);
      ctx.userDocs = docs;
      ctx.securityReview = sec;
      if (sec.verdict === "CHANGES_REQUESTED")
        ctx.gateOverrides.push("security-reviewer: findings recorded for next turn");
      log("act", `tech-writer done ∥ security-reviewer ${sec.verdict}`);
      break;
    }

    case "release-manager": {
      const rel = await runAgent(AGENTS["release-manager"], {
        turnPlan: ctx.turnPlan,
        understandReview: ctx.understandReview,
        designReview: ctx.designReview,
        codeReviews: ctx.codeReviews,
        testReport: ctx.testReport,
        uiReport: ctx.uiReport,
        securityReview: ctx.securityReview,
        backlog: ctx.backlog,
        bugs: ctx.bugs,
      });
      ctx.release = rel;
      if (rel.decision === "GO") ctx.status = "released";
      log("act", `release-manager ${rel.decision} (${rel.blockers.length} blocker(s))`);
      break;
    }

    default:
      log("act", `unknown action '${next}' — skipped`);
  }
}

/** Run one full turn: assess -> refine -> act -> record. */
export async function runTurn(ctx: ProjectContext): Promise<ProjectContext> {
  ctx.turn += 1;
  ctx.gateOverrides = []; // overrides are noted per turn
  console.log(`\n=== Turn ${ctx.turn} — ${ctx.project} ===`);

  // 1. Assess
  ctx.turnPlan = await runAgent(AGENTS["gap-analyst"], stripForAssess(ctx));
  log("assess", `NEXT: ${ctx.turnPlan.next}`);

  // 2. Refine
  await refine(ctx);

  // 3. Act
  await act(ctx, ctx.turnPlan.next);

  // 4. Record — scribe writes the turn's log entry, then persist
  ctx.next = ctx.turnPlan.next;
  const entry = await runAgent(AGENTS.scribe, {
    turn: ctx.turn,
    lastAction: ctx.lastAction,
    turnPlan: ctx.turnPlan,
    designReview: ctx.designReview,
    codeReviews: ctx.codeReviews,
    testReport: ctx.testReport,
    uiReport: ctx.uiReport,
    securityReview: ctx.securityReview,
    release: ctx.release,
    gateOverrides: ctx.gateOverrides,
  });
  ctx.log.push(entry);
  await writeBuildFiles(ctx);
  await writeTurnSnapshot(ctx);
  log("record", `scribe: "${entry.commitSummary}"; status=${ctx.status}`);

  return ctx;
}

/** gap-analyst sees the whole workspace but not its own prior plan verbatim. */
function stripForAssess(ctx: ProjectContext) {
  const { turnPlan, gateOverrides, ...rest } = ctx;
  return rest;
}
