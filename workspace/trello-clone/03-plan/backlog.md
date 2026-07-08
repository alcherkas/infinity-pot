# Backlog — trello-clone

Ordered so the app is startable and runnable end-to-end as early as possible, then by value first / risk second within what dependencies allow. Each task is one developer run.

| # | Task | Size | Goal | Status |
|---|---|---|---|---|
| 1 | task-001 | S | Skeleton: `package.json`, static `server.js`, `index.html`/`app.css` shell, `app.js` boot that renders "No boards yet" — `npm start` serves a working empty-state page | DONE |
| 2 | task-002 | S | `storage.js`: load/save versioned localStorage blob, empty-state fallback, corrupt-data handling | DONE |
| 3 | task-003 | M | `store.js` boards: `getState`, `createBoard`, `renameBoard`, `deleteBoard`, `reorderBoards`; wired to storage write-through | DONE |
| 4 | task-004 | M | Boards overview UI: `render.js`/`events.js` for create/rename/delete board, empty state, list of boards, click to open a board (board view can be a stub) | DONE |
| 5 | task-015 | M | Playwright test harness setup: `05-qa/` config, `webServer` pointing at `server.js`, one smoke test (load page, create board) — moved earlier to catch regressions from the first real UI onward | DONE |
| 6 | task-005 | M | `store.js` lists: `createList`, `renameList`, `deleteList` (cascades cards), `reorderLists`; board view UI renders lists with create/rename/delete | DONE |
| 7 | task-006 | M | `store.js` cards: `createCard`, `renameCard`, `deleteCard`; board view UI renders cards within lists with create/rename/delete | DONE |
| 8 | task-007 | M | Card detail modal: open on click, edit title + `description` via `updateCardDescription`, save/close (FR8) | DONE |
| 9 | task-011 | S | FR11 confirm-before-delete dialogs for board/list/card deletion — cheap, high value (prevents accidental data loss), do right after delete paths exist | DONE |
| 10 | task-008 | M | Drag-and-drop: `reorderCard` (within list + across lists, FR4/FR5) wired to native HTML5 DnD handlers in `events.js` | DONE |
| 11 | task-010 | S | FR6a click-based "Move to..." fallback menu on cards (uses `reorderCard`), independent of DnD — cheap safety net for DnD risk in task-008 | TODO |
| 12 | task-009 | S | Drag-and-drop: `reorderLists` (FR6) wired to DnD on list headers (split from the old task-009; board-tile reordering moved to task-016) | TODO |
| 13 | task-016 | S | Drag-and-drop: `reorderBoards` (FR9) wired to DnD on the boards overview (split from the old task-009 — independent UI surface from list DnD) | TODO |
| 14 | task-012 | S | Could-have: card label/color tag (`setCardLabel`) — field + badge + simple picker | TODO |
| 15 | task-013 | S | Could-have: card due date (`setCardDueDate`) — field + display + date picker | TODO |
| 16 | task-014 | S | Could-have: keyword search/filter across cards on a board (`filterCards`) | TODO |

## Sizing legend
- **S** — one focused function/behavior, low integration surface, low ambiguity.
- **M** — multiple functions or store+UI wiring together, moderate integration surface.
- **L** — none remaining; the only L candidate (task-009, combined list+board DnD) was split into task-009 (lists) + task-016 (boards), each now S.

## Reordering notes
- Task-015 (Playwright harness) moved from last to right after task-004 (was position 15, now position 5): it only needs a running server and boards overview, and standing it up early lets every subsequent task's manual acceptance criteria also get an automated regression check instead of waiting until the whole feature set is built.
- Task-011 (confirm-before-delete) moved up to directly follow the point where all three delete paths (board/list/card) exist, ahead of drag-and-drop: it is S-sized, high value (prevents accidental destructive data loss), and has no dependency on DnD.
- Task-010 (click-based move fallback) moved to immediately follow task-008 (DnD): it mitigates DnD's integration risk (see Risks) by giving users/testers a working move path even if DnD has issues, and it is cheap to build right after `reorderCard` exists.
- Task-009 was split into task-009 (list DnD) and task-016 (board DnD) — two independent UI surfaces bundled under one task name; splitting lets them be reviewed/QA'd independently and keeps each task S-sized.
- Could-have tasks (012-014) stay last and in their original relative order — labels and due dates add more visible user value per effort than free-text keyword search, so search stays lowest priority among the three.

## Risks
- **Drag-and-drop reliability (task-008, task-009, task-016):** native HTML5 DnD has known cross-browser quirks (Safari drag image, touch devices have no DnD at all). Acceptance criteria don't specify which browsers/devices must be supported — flag this gap to product-owner/requirement-refiner if not already answered in `01-understand/`. Task-010's click-based fallback partially mitigates this for the "no working move path" failure mode, but doesn't cover list/board reordering.
- **Cascading delete correctness (task-003/005/006):** board/list delete cascades are built incrementally (stubbed, then completed as dependent entities appear). Risk that an earlier stub is never revisited or leaves orphaned cards/lists in storage — code-reviewer should explicitly check cascade completeness once task-006 lands.
- **localStorage quota/availability (task-002):** `save()` is specified to "catch and log" errors without throwing, but there's no acceptance criterion for what the user sees when a save silently fails (e.g., private browsing mode with storage disabled). Silent data loss risk — worth a UX decision before task-007+ pile more state on top.
- **Playwright test harness as external dependency (task-015):** introduces `@playwright/test` as the project's first devDependency and first departure from the "no dependencies" constraint in `02-design/architecture.md`. Confirm this exception is intentional/documented, and that CI/local environments can actually install browser binaries (network access, disk space) before relying on it as a gate.
- **Modal save/close semantics (task-007):** the task description explicitly punts the "save-on-close vs. discard-on-close" decision to the developer with only a comment to document it. Unclear acceptance criteria — likely to produce a UX inconsistency or a reviewer back-and-forth; worth pinning down before task-007 starts rather than after.
- **Re-render-on-every-mutation strategy (task-004 onward):** simple but risk of visible flicker/lag by the time boards have many lists/cards + drag-and-drop + search filtering all re-rendering the same tree. NFR2 (no visible lag) is an acceptance criterion in task-008 specifically — worth a perf smoke check once tasks 008/009/016/014 are all combined.
