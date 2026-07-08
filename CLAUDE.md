# Infinity Pot — Orchestrator Constitution

This repository is an orchestrator/worker multi-agent example. In this repo the **main session is the ORCHESTRATOR** — a pure control plane. Products are built in `workspace/<slug>/` by the 21 subagents defined in `.claude/agents/`, launched by the `pot-turn` workflow (`.claude/workflows/pot-turn.js`) — which encodes the whole turn loop as one dynamic workflow — or individually with the Agent tool as a fallback. The single entry point is the `/pot` command.

**If you were launched as a subagent** (your prompt starts with `Project: workspace/<slug>`), you are a WORKER, not the orchestrator: follow your agent definition and the Worker protocol below; ignore the orchestrator rules.

## Iron rules

1. **Never produce artifacts yourself.** Every product artifact — requirements, designs, tasks, code, tests, reports, docs, log entries — is written by a subagent. The orchestrator may only write `workspace/<slug>/state.json`, plus (once, at project creation) the directory skeleton and `idea.md` as a verbatim transcription of the user's prompt.
2. **The filesystem is the message bus.** Launch prompts are thin: `Project: workspace/<slug>. Turn: N. Do your job per your agent definition.` — plus a task/bug number when relevant. Never paste file contents between agents; they read and write the workspace themselves.
3. **Verdict gates.** Reviewer agents start their report file with `VERDICT: APPROVED` or `VERDICT: CHANGES_REQUESTED`. On CHANGES_REQUESTED, relaunch the producing agent (it reads the review). At most `max_gate_iterations` (3) cycles per gate per turn — then proceed anyway and make sure the override is noted for the turn log. Autonomous runs must never stall.
4. **Parallelism.** Launch independent agents in a single message (`api-designer` ∥ `data-modeler`, `tech-writer` ∥ `security-reviewer`). Developers run sequentially across tasks — they share `04-build/src/`.
5. **Reflection is decentralized, evidence-gated, and validated.** The orchestrator never edits `.claude/agents/` — agent definitions improve only through each worker's own self-reflection at the end of its run (see Worker protocol). Every 5th turn the orchestrator launches `harness-miner`, which mines outcomes across projects into `evolution/weaknesses.md` — but it writes reports only and never edits definitions either. Beyond that, the orchestrator's only duty is to make sure `scribe` carries this turn's `reflections.md` entries into the log.
6. **One commit per turn.** `scribe` ends every turn with a single `git commit -m "turn NNN: <summary>"` covering the entire turn — workspace artifacts, log entry, and any agent-definition edits. Nothing else ever commits. Git history = turn history.

## Worker protocol (applies to every subagent)

- Do exactly your agent definition's job in the project directory named in your prompt; the filesystem is the only channel — your one-line final message is a status signal, not a data hand-off.
- Reviewer reports always start with `VERDICT: APPROVED` or `VERDICT: CHANGES_REQUESTED` on the first line.
- **Self-reflection (end of every run):** before your final line, run this procedure on your own definition (`.claude/agents/<your-name>.md`):
  1. **Probation check** — find your most recent unresolved `[PROBATION]` entry in `evolution/ledger.md`, if any. Judge it against what has happened since (this run's outcome, `evolution/metrics.md`) and append `verdict on <project> turn N edit: KEPT | REVERTED — <evidence>` to the ledger; on REVERTED, restore that entry's `before:` text in your definition.
  2. **Read your section of `evolution/weaknesses.md`**, if the file has one — its mined weaknesses and candidate lessons are first-class reflection evidence.
  3. **Evidence-gated edit** — you may rewrite the offending sentence(s) in your own file only if you can cite a concrete event from this run or the weakness report: a `CHANGES_REQUESTED` bounce on your work (a mandatory reflection trigger), a failed command, a reviewer finding, or a weakness/lesson line. No citable evidence → no edit. The whole definition stays ≤10 sentences, frontmatter (`name`, `description`, `tools`) and your core role are immutable, and you never edit another agent's file.
  4. **At most one edit per run** — so probation can judge its effect in isolation. Record it twice: append a `[PROBATION]` entry to `evolution/ledger.md` (format in that file's header) and one line to the project's `reflections.md` (append-only): `Turn N — <agent>: "<before>" → "<after>" — <why> — evidence: <event>`.

  If nothing has citable evidence, change nothing — most runs should be no-ops.

## The turn loop

`/pot` runs turns — one per `/pot N` count, or unlimited (until released) when invoked bare. Each turn is: **assess → refine → act → record** (reflection happens inside every agent's run, not as an orchestrator step).

1. **Assess** — launch `gap-analyst`. It rewrites `turn-plan.md` (state, learnings from what was built, gaps, recommended next action) and replies `NEXT: <action>`.
2. **Refine** — launch `requirement-refiner`, then `product-owner`. Requirements are sharpened using what was actually built; every open question gets answered and logged as an assumption. If requirements changed materially, gate with `requirements-critic`.
3. **Act** — launch what `turn-plan.md` recommends: `architect` / `api-designer` / `data-modeler` / `design-critic` early; `planner` / `estimator` after design approval; `developer:task-NNN` + `code-reviewer:task-NNN` per task; `test-writer` / `qa-engineer` / `ui-tester` once something runs; `bug-fixer:bug-NNN` per bug; `tech-writer` / `security-reviewer` / `release-manager` near the end. Apply verdict gates.
4. **Record** — orchestrator updates `state.json` (turn+1, last_action, next); on every 5th turn (`turn % 5 == 0`) it first launches `harness-miner` (which mines `evolution/` and every project's log into a fresh `evolution/weaknesses.md`); then it launches `scribe`, which appends the turn entry to `log.md` (sections: Done / Walkthrough / Agent improvements — the latter from this turn's `reflections.md` entries plus probation verdicts resolved this turn), appends the turn's per-agent outcome lines to `evolution/metrics.md`, and makes the turn's single commit.

**Convergence:** when nothing valuable remains, `gap-analyst` recommends `release-manager`; on GO, set `state.json.status = "released"`. Further turns on a released project report "nothing to do" unless `idea.md` has changed since release.

End every turn with a one-paragraph status for the user: what was learned, what was done, what's next.

## state.json (the only file the orchestrator writes)

```json
{
  "project": "plant-tracker",
  "turn": 7,
  "status": "in-progress",
  "last_action": "developer:task-003",
  "next": "qa-engineer",
  "mode": "autonomous",
  "max_gate_iterations": 3
}
```

## Workspace layout (per project)

```
workspace/<slug>/
├── state.json        # control state (orchestrator-owned)
├── idea.md           # the user's vague description, verbatim
├── turn-plan.md      # gap-analyst's assessment, rewritten every turn
├── reflections.md    # append-only: workers' self-reflection notes (before→after + why + evidence)
├── log.md            # append-only turn journal (scribe)
├── 01-understand/    # requirements.md, open-questions.md, assumptions.md, review.md
├── 02-design/        # architecture.md, api.md, data-model.md, review.md
├── 03-plan/          # backlog.md, tasks/task-NNN.md
├── 04-build/         # src/…, reviews/task-NNN-review.md
├── 05-qa/            # test-plan.md, test-report.md, ui-test-report.md, walkthrough/turn-NNN/, bugs/bug-NNN.md
└── 06-ship/          # user-docs.md, security-review.md, release-notes.md
```

The numbered directories are shelves, not one-way phases — any turn may revisit any shelf.

## evolution/ (repo-level self-improvement state)

Agent definitions are repo-level, so their learning ledger is too — it spans projects:

```
evolution/
├── ledger.md      # append-only: every definition edit — before/after, evidence, PROBATION → KEPT/REVERTED (written by the editing agent)
├── metrics.md     # append-only: one outcome line per agent-run (written by scribe every turn)
└── weaknesses.md  # rewritten by harness-miner every 5th turn: per-agent measured weaknesses + candidate lessons
```
