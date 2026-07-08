# Turn Plan — trello-clone (assessed turn 7)

## State

- `idea.md`: "analog of trello boards" — one line, unchanged since turn 1.
- **Requirements** (`01-understand/requirements.md`): FR1-FR14 + NFR1-NFR5, `review.md` — VERDICT: APPROVED (turn 1, no bounce). Stable across all turns.
- **Design** (`02-design/architecture.md`, `api.md`, `data-model.md`): plain HTML/CSS/JS, no framework, Node `http` static server, native HTML5 DnD, Playwright for QA. `review.md` — VERDICT: APPROVED (turn 1, no bounce). Deliberately amends the requirements doc's React/Vite sketch — a documented, reasoned deviation, not drift. The stale "no dependencies" line (contradicted by the shipped `@playwright/test` devDependency) has now been flagged for **five** consecutive turns and is still uncorrected.
- **Plan** (`03-plan/backlog.md`): 16 tasks. 7 of 16 DONE as of this turn: task-001 (skeleton), 002 (storage), 003 (board CRUD), 004 (boards UI), 015 (Playwright harness), 005 (list CRUD/cascade + UI), 006 (card CRUD/cascade + UI, landed this turn). 9 remain: task-007 (card modal), 011 (confirm dialogs), 008/009/016 (drag-and-drop), 010 (move fallback), 012/013/014 (could-haves).
- **Build** (`04-build/src/`): boards+lists+cards CRUD with cascading delete all the way down (board→list→card), all 7 tasks reviewed **APPROVED first-pass, zero bounces, zero bugs found** across the entire project so far.
- **QA** (`05-qa/`): Playwright harness (`playwright.config.js`, `tests/smoke.spec.js`) built at turn 4 by task-015, reviewed and approved — **but never once executed**. Zero pass/fail evidence exists for any of the 7 completed tasks, across 3 consecutive turns of this exact gap being flagged and deferred. No `test-report.md`, no `ui-test-report.md`, no `05-qa/walkthrough/` directory, no `ui-tester` run ever, no bugs filed.
- **Ship** (`06-ship/`): empty. Correctly premature — no `tech-writer`/`security-reviewer`/`release-manager` output expected yet given the missing core interactions (DnD, confirm dialogs) below.
- **Reflections/evolution**: `reflections.md` empty across all 6 turns — no `CHANGES_REQUESTED` cycle has ever occurred, so no agent has had citable evidence to self-edit. `evolution/ledger.md` has no pending `[PROBATION]` entries for this project's agents to resolve.
- `state.json`: turn 6, last_action `code-reviewer:task-006`, next `qa-engineer` — consistent with backlog and log; this turn's assessment confirms `qa-engineer` is correctly the next action.

## Learnings

- **"Zero bugs found across 7 tasks, 6 turns" is not evidence of quality — it's evidence that nothing has been dynamically tested.** Every one of those verdicts comes from static code review alone. The Playwright harness that exists specifically to close this gap (built turn 4) has now been deferred through three consecutive turns of feature work (lists, cards) stacked on top of it. This is the clearest discrepancy between reported project health ("all green") and actual verified health (unknown) — worth calling out plainly rather than re-flagging politely again.
- **The backlog's own stated rationale for moving task-015 early — "so every subsequent task's manual acceptance criteria also get an automated regression check" (`backlog.md` line 30) — has been ignored in execution for three turns running.** The plan correctly anticipated this need; the loop simply hasn't acted on it. This is a process learning: a built-but-unexecuted test asset should trigger `qa-engineer` immediately, not after N more `developer` tasks land on top of it.
- **The stale "no dependencies" architecture line has been flagged 5 turns straight with no fix**, despite being a one-line, zero-risk edit. This confirms the turn-5 hypothesis that non-blocking review notes without an assigned task number reliably rot. Low urgency on its own, but the pattern (flag, defer, repeat) is itself worth naming: cheap fixes need an owner/task, not repeated mentions in `turn-plan.md`.
- **Core Trello interactions are still entirely missing**: no card detail/description editing (FR8), no drag-and-drop at all (FR4/FR5/FR6/FR9 — arguably the single most identifiable "Trello" interaction), no confirm-before-delete (FR11 — every delete today is silent and irreversible, already flagged as a real data-loss risk in `backlog.md`'s Risks section). The project has built CRUD depth (3 levels, full cascade) before building the interactions that make it feel like Trello.

## Gaps (prioritized)

1. **Never-executed test suite (highest priority, now carried 3 consecutive turns since the harness landed).** `05-qa/tests/smoke.spec.js` exists, is reviewed, has never been run. This blocks real confidence in all 7 "DONE" tasks and is exactly the job `qa-engineer` exists to do — not another `developer` task.
2. **Core feature set still incomplete relative to a "Trello clone."** No card detail modal (task-007), no drag-and-drop (task-008/009/016), no confirm-before-delete (task-011, real irreversible-data-loss risk today).
3. **Stale architecture doc line** re: "no dependencies" — cheap one-line fix, low priority, flagged 5 turns running.
4. **Unresolved risk items in `backlog.md`'s Risks section awaiting product-owner input**: DnD browser/device support scope, silent localStorage-save-failure UX, task-007's save-on-close vs. discard-on-close semantics — the last becomes live the moment task-007 starts.
5. **No `06-ship/` artifacts** — correctly not due yet.

## Next

**qa-engineer.**

Rationale: this is the single highest-value action available this turn, and the second turn in a row this report recommends it. Seven tasks and six turns of "approved on first pass" static review have never once been checked against a running app. The Playwright smoke test built specifically for this purpose (turn 4) has sat unexecuted through three turns of new feature work (lists, then cards) stacked on top of it. Run the existing suite, do a real exploratory walkthrough of boards→lists→cards CRUD and cascade-delete, and produce `05-qa/test-report.md` (plus `05-qa/bugs/bug-NNN.md` for anything broken). This gives the next `developer:task-007` (card modal) and `code-reviewer` runs empirical ground truth instead of code-reading alone, and de-risks continuing to add feature surface (DnD, modals) on top of a foundation that has never actually been run.
