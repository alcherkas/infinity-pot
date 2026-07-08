# Turn Plan — trello-clone (Turn 6)

## State

- `idea.md`: "analog of trello boards" — one line, unchanged since turn 1.
- `01-understand/requirements.md`: FR1-FR14 + NFRs. `review.md` — VERDICT: APPROVED (turn 1, no bounce). Stable across all turns.
- `02-design/architecture.md`, `api.md`, `data-model.md`: plain HTML/CSS/JS, no framework, Node `http` static server, native HTML5 DnD, Playwright for QA. `review.md` — VERDICT: APPROVED (turn 1, no bounce). The stale "no dependencies" line (contradicted by the shipped Playwright devDependency) has now been flagged for **four** consecutive turns and is still uncorrected.
- `03-plan/backlog.md`: 16 tasks, well-ordered with Reordering notes and a Risks section. 6 of 16 DONE as of this turn (task-005 lists landed).
- `04-build/`: 6 of 16 tasks DONE, all reviewed APPROVED first-pass, zero bugs found across any of them:
  - task-001 skeleton server + empty-state boot
  - task-002 `storage.js` versioned localStorage load/save
  - task-003 `store.js` board CRUD + reorder
  - task-004 boards overview UI
  - task-015 Playwright harness (config + smoke.spec.js)
  - task-005 `store.js` list CRUD/cascade + board-view UI
  - 10 tasks remain, in backlog order: cards (006), card detail modal (007), delete-confirm (011), card DnD (008), move-fallback (010), list DnD (009), board DnD (016), labels (012), due dates (013), search (014).
- `05-qa/`: contains the Playwright harness as *code only*. **It has never been run**, for the second turn running (built turn 4, still not executed turn 6). No `test-report.md`, no `ui-test-report.md`, no `05-qa/walkthrough/` directory, no bugs filed. All 6 build tasks have been approved via static code review alone — zero dynamic execution evidence exists anywhere in this project after 6 turns.
- `06-ship/`: does not exist yet — correctly premature; the app has no cards yet, so it isn't a usable Trello clone.
- No bugs filed. No gate overrides any turn (every review APPROVED first pass, 6 for 6). `reflections.md` still empty across all 6 turns — no `CHANGES_REQUESTED` cycles have occurred, no `[PROBATION]` entries pending in `evolution/ledger.md`.
- `state.json`: turn 5, last_action `code-reviewer:task-005`, next `developer:task-006` — consistent with backlog and log.

## Learnings

- **Six consecutive first-pass APPROVED reviews with zero dynamic execution is no longer a mild yellow flag — it's a compounding risk.** The Playwright harness built in turn 4 to close exactly this gap has now sat unused for two full turns while store/UI logic for boards and lists both landed on top of it unverified. Static code review cannot catch a wrong DOM selector, a broken cascade, or a storage race — only running the app can. This project should not add a third layer of untested UI (cards, task-006) before running the one test that already exists against boards+lists.
- **The stale "no dependencies" line in `architecture.md` has been flagged four turns running and never fixed.** This confirms last turn's hypothesis: non-blocking review notes without an assigned task number reliably rot. Concrete recommendation for this turn or next: fold the one-line fix into whichever agent next touches `architecture.md`, or explicitly assign it as a trivial standalone task rather than re-flagging a fifth time.
- **The backlog's own Risks section correctly anticipated the cascade-delete risk** — task-005's review confirmed board-delete now cascades through lists to cards — but that cascade path has still never been exercised against *real* card data, because cards don't exist yet. This will only be truly verifiable once task-006 lands and should be an explicit code-reviewer check item for task-006, not an afterthought.
- **The project is 6 turns and 6 tasks in without a single card existing.** For a "Trello clone," cards are the load-bearing entity — boards and lists are just containers. This is worth naming plainly: velocity looks good (6/16 tasks, zero rework) but user-facing value is still effectively zero until task-006 lands.

## Gaps (prioritized)

1. **Cards (task-006) not built.** The single largest missing piece of core product value — without cards this is not yet a usable Trello clone at all.
2. **The Playwright smoke test has still never been executed**, two turns after being built. Cheapest possible high-value action once cards exist (or even right now against the current boards+lists flow) — should not be deferred a third turn.
3. **9 remaining build tasks after cards**: card detail modal (007), delete-confirm (011), card DnD (008), move-fallback (010), list DnD (009), board DnD (016), labels (012), due dates (013), search (014).
4. **Unresolved risk items in `backlog.md`'s Risks section** still awaiting product-owner input: DnD browser/device support scope (008/009/016), silent localStorage-save-failure UX, modal save/close semantics (007) — the last one is about to become live as task-007 is now only one task away.
5. **No `ui-tester` run has ever occurred** — zero manual/exploratory verification alongside the never-run automated suite.
6. **Minor doc debt**: `architecture.md`'s stale "no dependencies" line — four turns flagged, still open, still a five-minute fix.
7. `06-ship/` (docs, security review, release) — correctly not due yet; premature until cards + core interactions exist.

## Next

**`developer:task-006`** — build `store.js` card operations (`createCard`, `renameCard`, `deleteCard`) and extend the board-view UI to render cards within lists with create/rename/delete.

Rationale: this is the next TODO item in `backlog.md`'s dependency-ordered sequence, it is the single highest-value action available (cards are the core entity that makes the product a Trello clone rather than a board/list organizer), and it has no blocking dependency — lists (task-005) are done. Follow with `code-reviewer:task-006` per the standard gate, with an explicit instruction to verify the board→list→card cascade-delete path end-to-end now that all three levels exist. Immediately after, the top-priority action for the *following* turn should be to actually run the Playwright smoke test (via `qa-engineer`) and produce `05-qa/test-report.md` — this project cannot keep adding untested UI surface on top of a harness that has been built but never executed for two turns running.
