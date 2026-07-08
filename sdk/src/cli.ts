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
  // A trailing integer is the turn count; the rest (if any) is the idea.
  //   pot                       -> active project, run until released
  //   pot <N>                   -> active project, N turns
  //   pot "<idea>"              -> seed/load idea, 1 turn
  //   pot "<idea>" <N>          -> seed/load idea, N turns
  const argv = process.argv.slice(2);
  const last = argv[argv.length - 1];
  let explicitTurns: number | undefined;
  let idea: string;
  if (last !== undefined && /^\d+$/.test(last)) {
    explicitTurns = Number(last);
    idea = argv.slice(0, -1).join(" ").trim();
  } else {
    idea = argv.join(" ").trim();
  }

  let ctx: ProjectContext | null;
  let turns: number;

  if (idea === "") {
    turns = explicitTurns ?? Infinity;
    ctx = await activeProject();
    if (!ctx) {
      console.error('No active project. Start one with: npm run pot -- "<your idea>"');
      process.exit(1);
    }
  } else {
    const slug = slugify(idea);
    ctx = (await loadState(slug)) ?? newContext(slug, idea);
    if (ctx.idea !== idea) ctx.idea = idea; // idea changed -> reopen below
    turns = explicitTurns ?? 1;
    console.log(`Seeded project '${slug}' from idea (${turns} turn${turns === 1 ? "" : "s"}).`);
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
