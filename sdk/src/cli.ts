import { newContext, type ProjectContext } from "./context.js";
import { runTurn } from "./orchestrator.js";
import { activeProject, loadState, saveState } from "./persist.js";

function slugify(idea: string): string {
  return (
    idea
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .split("-")
      .slice(0, 4)
      .join("-") || "project"
  );
}

async function status(ctx: ProjectContext): Promise<void> {
  const p = ctx.turnPlan;
  console.log(`\n--- Status (${ctx.project}, turn ${ctx.turn}, ${ctx.status}) ---`);
  if (p) {
    console.log(`Learned: ${p.learnings}`);
    console.log(`Did: ${ctx.lastAction}`);
    console.log(`Next: ${p.next}`);
  }
  if (ctx.release) console.log(`Release: ${ctx.release.decision}`);
}

async function main(): Promise<void> {
  const arg = process.argv.slice(2).join(" ").trim();

  // Empty -> unlimited turns on the active project (until released). A number N -> N turns. Else -> new idea.
  let ctx: ProjectContext | null;
  let turns = 1;

  if (arg === "") {
    turns = Infinity;
    ctx = await activeProject();
    if (!ctx) {
      console.error('No active project. Start one with: npm run pot -- "<your idea>"');
      process.exit(1);
    }
  } else if (/^\d+$/.test(arg)) {
    turns = Number(arg);
    ctx = await activeProject();
    if (!ctx) {
      console.error('No active project. Start one with: npm run pot -- "<your idea>"');
      process.exit(1);
    }
  } else {
    const slug = slugify(arg);
    ctx = (await loadState(slug)) ?? newContext(slug, arg);
    if (ctx.idea !== arg) ctx.idea = arg; // idea changed -> reopen below
    console.log(`Seeded project '${slug}' from idea.`);
  }

  if (ctx.status === "released") {
    console.log(`Project '${ctx.project}' is released — nothing to do.`);
    return;
  }

  for (let i = 0; i < turns; i++) {
    if (ctx.status === "released") {
      console.log("Converged (released) — stopping.");
      break;
    }
    ctx = await runTurn(ctx);
    await saveState(ctx);
    await status(ctx);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
