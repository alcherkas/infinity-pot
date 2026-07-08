# Turn Plan — trello-clone (Turn 2)

## State
- `idea.md`: "analog of trello boards" (unchanged, one line).
- `01-understand/`: `requirements.md` (FR1-FR14, NFR1-NFR5), `open-questions.md`, `assumptions.md` — all open questions answered by `product-owner` (single-user SPA, localStorage persistence, no backend/auth/collaboration). `review.md` — VERDICT: APPROVED (first pass).
- `02-design/`: `architecture.md`, `api.md`, `data-model.md` — every FR/NFR mapped to a component. `review.md` — VERDICT: APPROVED (first pass).
- `03-plan/`: `backlog.md` with 16 ordered tasks (task-001 through task-016, reordered/split with documented rationale and risk notes), individual `tasks/task-NNN.md` files for all 16.
- `04-build/`: task-001 (skeleton dev server, static shell, empty-state boot) — DONE, `code-reviewer:task-001` VERDICT: APPROVED (first pass). task-002 (`storage.js` — versioned localStorage load/save, corrupt-data/empty-state handling) — DONE, `code-reviewer:task-002` VERDICT: APPROVED (first pass). Tasks 003-016 — TODO, not started.
- `05-qa/`, `06-ship/`: do not exist yet — no tests, no QA, no docs, no release artifacts. Expected at this stage; test harness (task-015) and first real UI (task-004) haven't landed yet, so there's nothing testable beyond the empty-state boot screen.
- No gate overrides so far — every review has passed on the first cycle. No `reflections.md` entries yet (no agent has made a self-edit).
- Overall verdict: on track, all built artifacts green, moving at a normal pace (2 of 16 build tasks done).

## Learnings
- Backlog reordering was itself a learning captured proactively by `planner`: task-015 (Playwright harness) was moved from last to right after task-004, and task-011 (confirm-before-delete) was moved up to directly follow the point where all three delete paths exist. Both are good calls that should hold as later tasks land — no contradiction with requirements, just risk-aware sequencing.
- `backlog.md`'s Risks section flags real ambiguities that requirements didn't fully pin down even after the refiner/product-owner pass: (1) no browser/device support matrix for drag-and-drop (Safari drag-image quirks, no native DnD on touch) — this should have been an explicit NFR or assumption, not left to surface at planning time; (2) no UX spec for what happens when `storage.save()` silently fails (e.g., private-browsing mode with storage disabled) — a silent-data-loss risk that requirements should address before task-007 piles more state on top; (3) task-007's card-modal save/close semantics (save-on-close vs. discard-on-close) was left for the developer to decide — this is a product decision, not an implementation detail, and belongs in requirements or a product-owner ruling, not a code comment.
- `architecture.md` commits to "no dependencies" for the app itself, but `backlog.md` flags that task-015 introduces `@playwright/test` as the first devDependency. This is a reasonable, scoped exception (test tooling vs. runtime dependency) but it isn't yet reconciled in writing anywhere in `02-design/` — worth a one-line amendment to `architecture.md` when task-015 lands, so the "no dependencies" claim doesn't read as contradicted by the repo.
- No divergence yet between what was designed and what was built for tasks 001-002 — both reviews confirm the implementation matches `api.md` precisely. This is good early signal that the design is concrete enough to build against without rework.

## Gaps
1. (Highest priority, in-progress, not a defect) Tasks 003-016 not yet built — 14 of 16 backlog items remain, including the store logic (003), the first real interactive UI (004), and the test harness (015). Nothing to fix here, just the natural next work.
2. Three unresolved product decisions surfaced by planning but not yet answered by product-owner: DnD browser/device support scope, save-failure UX, and modal save/close semantics. These should be settled before task-008 (DnD) and task-007 (modal) start, ideally via a lightweight product-owner ruling logged as new assumptions rather than left to individual developers to invent inconsistently.
3. No tests exist yet (expected — task-015 hasn't run). No QA, no security review, no docs, no release readiness — all expected at this stage, not a red flag yet.
4. `architecture.md`'s "no dependencies" statement will need a one-line amendment once task-015 (Playwright) is built, to keep design docs consistent with reality.

## Next
**Recommended action: developer:task-003**

Rationale: Requirements and design are both approved (green), the backlog is ordered and unambiguous, and task-003 (board store: `getState`/`createBoard`/`renameBoard`/`deleteBoard`/`reorderBoards` in `store.js`, write-through to `storage.js`) is the next unstarted task with no unmet dependencies — task-001 (shell) and task-002 (storage) it depends on are both DONE and approved. This is squarely the highest-value action: it's the first piece of real application logic and unblocks task-004 (boards overview UI), which is the first user-visible interactive feature. The three open product-decision gaps (DnD scope, save-failure UX, modal semantics) don't block task-003 and can be resolved via a quick product-owner note before tasks 007/008 rather than stalling current progress. After `developer:task-003`, gate with `code-reviewer:task-003` per the standard verdict-gate protocol.
