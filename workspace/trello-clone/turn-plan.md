# Turn Plan — trello-clone (Turn 5)

## State

- `idea.md`: "analog of trello boards" — one line, unchanged since turn 1.
- `01-understand/requirements.md`: FR1-FR14 + NFR1-NFR7. `review.md` — VERDICT: APPROVED (turn 1, no bounce). Stable across all turns.
- `02-design/architecture.md`, `api.md`, `data-model.md`: plain HTML/CSS/JS, no framework, Node `http` static server, native HTML5 DnD, Playwright for QA. `review.md` — VERDICT: APPROVED (turn 1, no bounce). The stale "no dependencies" line (contradicted by the now-shipped Playwright devDependency) has been flagged for three consecutive turns and is still uncorrected — smallest possible fix, still not done.
- `03-plan/backlog.md`: 16 tasks, well-ordered with Reordering notes and a Risks section. All 16 task files exist in `03-plan/tasks/`.
- `04-build/`: 5 of 16 tasks DONE, all reviewed APPROVED first-pass, zero bugs found across any of them:
  - task-001 skeleton server + empty-state boot
  - task-002 `storage.js` versioned localStorage load/save
  - task-003 `store.js` board CRUD + reorder
  - task-004 boards overview UI (create/rename/delete/navigate)
  - task-015 Playwright harness (`05-qa/playwright.config.js`, `05-qa/tests/smoke.spec.js`, `@playwright/test` devDependency)
  - 11 tasks remain, in backlog order: lists (005), cards (006), card detail modal (007), delete-confirm (011), card DnD (008), move-fallback (010), list DnD (009), board DnD (016), labels (012), due dates (013), search (014).
- `05-qa/`: contains the Playwright harness as *code only*. **It has never been run.** No `test-report.md`, no `ui-test-report.md`, no `05-qa/walkthrough/` directory, no bugs filed. Five build tasks and the harness itself have all been approved via static code review alone — zero dynamic execution evidence exists anywhere in this project after 5 turns.
- `06-ship/`: does not exist yet — correctly premature.
- No bugs filed. No gate overrides any turn (every review APPROVED first pass). `reflections.md` empty for all 4 completed turns — no `CHANGES_REQUESTED` cycles have occurred, and no `[PROBATION]` entries pending in `evolution/ledger.md`.
- `state.json`: turn 4, last_action `code-reviewer:task-015`, next `developer:task-005` — consistent with backlog and log.

## Learnings

- Turn 4 executed exactly what turn-3's plan recommended (`developer:task-015` + gate), closing the top-priority gap of "the test harness doesn't exist yet." Good — the loop keeps converging on real progress.
- But closing that gap only got the project to "a harness exists in code." The actual verification gap it was meant to solve — zero executed test runs against the app — is **still open** after 5 turns. Building and reviewing a Playwright config/spec by reading it is not the same as running `npm test` and reading a pass/fail report. This distinction needs to be made explicit going forward: `code-reviewer` approving test *code* is not evidence the tests pass. A future turn (once lists/cards give the smoke test more surface, or even right now against the boards-only flow) must actually execute the suite and produce `05-qa/test-report.md` — otherwise this project risks reaching "feature complete" with a fully-reviewed-but-never-executed codebase.
- The "no dependencies" line in `architecture.md` has now been flagged for three straight turns without anyone fixing it. This is a repeating pattern worth naming plainly: non-blocking review notes that aren't attached to a task number reliably don't get fixed. Recommend any agent touching `architecture.md` next (or a dedicated one-line task) close this rather than re-flagging it a fourth time.
- Five consecutive tasks approved first-pass with zero bugs, across genuinely different risk profiles (server skeleton, storage, store logic, UI/events, test infra) is still a mild yellow flag on reviewer thoroughness, not a red one — nothing here contradicts requirements/design, the code just hasn't been exercised yet to find what static review can't catch.

## Gaps (prioritized)

1. **The Playwright smoke test has never actually been executed.** This is the single most important unresolved gap — task-015 was built specifically to close the "nothing has ever run" risk, and it hasn't been used yet. Recommend an execution + `05-qa/test-report.md` before too many more build tasks stack on top of unverified assumptions.
2. **Lists (task-005)** — next TODO in backlog order; blocks cards, modal, DnD, and any meaningful test coverage beyond the boards-only smoke test. Highest-value forward-progress action available.
3. **Cards (task-006)** — follows lists; needed for card detail modal, DnD, labels/dates/search.
4. **Unresolved risk items flagged in `backlog.md`'s Risks section** needing product-owner input before their tasks start: DnD browser/device support (unspecified, affects 008/009/016), silent localStorage-save-failure UX (NFR7, no UI-visible warning), modal save/close semantics (punted to developer ahead of task-007).
5. **Remaining 8 build tasks** after lists/cards: modal (007), delete-confirm (011), DnD ×3 (008/009/016), move-fallback (010), labels (012), due dates (013), search (014).
6. **Minor doc debt**: `architecture.md`'s stale "no dependencies" line — three turns flagged, still open, trivial fix.
7. `06-ship/` (docs, security review, release) — correctly not due yet.

## Next

**developer:task-005** — build `store.js` list operations (`createList`, `renameList`, `deleteList` with card cascade, `reorderLists`) and the board-view UI to render/create/rename/delete lists.

Rationale: this is the next TODO item in `backlog.md`'s dependency-ordered sequence and unblocks the largest number of downstream tasks (cards, modal, DnD, and meaningfully wider test coverage). There's no bug backlog or gate override forcing rework elsewhere, so continuing forward build progress is the highest-value action this turn. Follow with `code-reviewer:task-005` per the standard gate. Separately (not this turn's primary action, but flagged for whoever next touches `05-qa/` or `architecture.md`): actually run the existing Playwright smoke test and produce a `test-report.md`, and fix the stale "no dependencies" line — both are cheap, both have been sitting unresolved for multiple turns.
