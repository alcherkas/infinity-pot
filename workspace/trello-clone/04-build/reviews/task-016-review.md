VERDICT: APPROVED

# Review: task-016 — Drag-and-drop for boards

## Findings

1. `render.js:27` — Board tiles (`<li class="board-row">`) have `draggable="true"` and `data-board-id="${board.id}"` as required.
2. `events.js:180-232` — `wireBoardDragAndDrop` implements dragstart/dragend/dragover/drop handlers on `#boards-list`, mirroring the established pattern from `wireCardDragAndDrop`/`wireListDragAndDrop` (task-008/task-009): separate module-scoped `draggedBoardId` variable, `dataTransfer.setData` wrapped in try/catch, `computeBoardDropIndex` using row midpoint comparison against `event.clientY`.
3. `events.js:293` — `wireBoardDragAndDrop(boardsList)` is called from `init()`, so it is actually wired up.
4. `events.js:225` — On drop, calls `store.reorderBoards(boardId, toIndex)` inside a try/catch, then `rerenderBoards()` on success — consistent with the mutate-then-rerender pattern used elsewhere in the file.
5. `store.js:73-84` — `reorderBoards(boardId, toIndex)` matches the `02-design/api.md` contract (lines 35-40) exactly: throws `Error('board not found')` for unknown id, clamps `toIndex` to `[0, boards.length-1]`, reassigns `order` on the sorted array, and calls `persist()` — satisfying "persists across reload" since `storage.js` writes to localStorage synchronously on every mutation (consistent with pattern already verified in prior task reviews).
6. `render.js:17` — `renderBoardsView` sorts boards by `order` before rendering, so the reordered sequence will display correctly on next render/reload.
7. No leftover debug code: only `console.warn` in catch blocks, consistent with the codebase's existing error-handling convention (not debug logging).
8. No new console errors introduced — drag handlers guard against missing `draggedBoardId`/no matching `.board-row` target before acting, same defensive style as `wireListDragAndDrop`.

## Acceptance criteria check
- "Dragging a board tile on the overview reorders boards; persists across reload." — Met: `reorderBoards` mutates `order` and persists via `storage.save`; `init()`/store hydration (unchanged, established in earlier tasks) reloads state from storage on page load.
- "No console errors." — Met: no unguarded exceptions in the new code path; errors from `store.reorderBoards` are caught and logged via `console.warn`, not thrown to the console as uncaught errors.

Task correctly reuses the DnD pattern from task-008/task-009 with no code duplication concerns beyond what the existing codebase already tolerates (card/list DnD follow the same shape).
