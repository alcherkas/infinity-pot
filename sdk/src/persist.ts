import { promises as fs } from "node:fs";
import path from "node:path";
import type { ProjectContext } from "./context.js";

export function runsRoot(): string {
  // sdk/runs — relative to this compiled/tsx module location (sdk/src -> sdk)
  return path.resolve(new URL("..", import.meta.url).pathname, "runs");
}

export function runDir(slug: string): string {
  return path.join(runsRoot(), slug);
}

export async function saveState(ctx: ProjectContext): Promise<void> {
  const dir = runDir(ctx.project);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, "state.json"), JSON.stringify(ctx, null, 2));
}

export async function loadState(slug: string): Promise<ProjectContext | null> {
  try {
    const raw = await fs.readFile(path.join(runDir(slug), "state.json"), "utf8");
    return JSON.parse(raw) as ProjectContext;
  } catch {
    return null;
  }
}

/** Find the most-recently-modified in-progress project, mirroring the /pot dispatch. */
export async function activeProject(): Promise<ProjectContext | null> {
  let entries: string[];
  try {
    entries = await fs.readdir(runsRoot());
  } catch {
    return null;
  }
  const candidates: { ctx: ProjectContext; mtime: number }[] = [];
  for (const slug of entries) {
    const ctx = await loadState(slug);
    if (!ctx) continue;
    try {
      const st = await fs.stat(path.join(runDir(slug), "state.json"));
      candidates.push({ ctx, mtime: st.mtimeMs });
    } catch {
      /* ignore */
    }
  }
  if (candidates.length === 0) return null;
  candidates.sort((a, b) => b.mtime - a.mtime);
  const inProgress = candidates.filter((c) => c.ctx.status === "in-progress");
  return (inProgress[0] ?? candidates[0]).ctx;
}

export async function writeTurnSnapshot(ctx: ProjectContext): Promise<void> {
  const dir = runDir(ctx.project);
  await fs.mkdir(dir, { recursive: true });
  const nnn = String(ctx.turn).padStart(3, "0");
  await fs.writeFile(
    path.join(dir, `turn-${nnn}.json`),
    JSON.stringify(ctx, null, 2),
  );
}

/** Persist the current build's files to runs/<slug>/build/ for inspection. */
export async function writeBuildFiles(ctx: ProjectContext): Promise<void> {
  const buildRoot = path.join(runDir(ctx.project), "build");
  const files = new Map<string, string>();
  for (const impl of ctx.build) {
    for (const f of impl.files) files.set(f.path, f.contents);
  }
  if (ctx.testPlan) for (const f of ctx.testPlan.files) files.set(f.path, f.contents);
  for (const [rel, contents] of files) {
    const safe = path.normalize(rel).replace(/^(\.\.(\/|\\|$))+/, "");
    const dest = path.join(buildRoot, safe);
    await fs.mkdir(path.dirname(dest), { recursive: true });
    await fs.writeFile(dest, contents);
  }
}
