# task-009 — Drag-and-drop for lists

## Size
S

## Goal
Implement list reordering within a board (FR6) via native HTML5 drag-and-drop. (Board-overview reordering was split out to task-016 — independent surface, no shared code path beyond the DnD pattern already established in task-008.)

## Files to create/change
- `04-build/src/public/js/store.js` — add `reorderLists(boardId, listId, toIndex)` (if not already added in task-005; if it was added there as a stub, complete it here).
- `04-build/src/public/js/events.js` — drag handlers on list headers (reorder within board).
- `04-build/src/public/js/render.js` — ensure list headers have `draggable="true"` and identifying data attributes.

## Acceptance criteria
- Dragging a list header reorders lists within the board; persists across reload.
- No interference with card drag-and-drop from task-008 (dragging a card doesn't accidentally trigger list reorder, and vice versa).
- No console errors.

## Status
DONE

## Implementation notes
- `store.reorderLists(boardId, listId, toIndex)` already existed (added in task-005); no changes needed there.
- `render.js`: list headers now have `draggable="true"` and `data-list-id`.
- `events.js`: added `wireListDragAndDrop` using a separate `draggedListId` variable
  from card DnD's `draggedCardId`. Drag starts are disambiguated by DOM structure:
  list drags start on `.list-header`, card drags start on `.card-row` (a sibling of
  the header, not a descendant), so the two `closest()` checks never both match the
  same drag gesture, and each handler bails out early when its own dragged-id is null.
- Verified: `node --check` on all three touched files, manual server start + curl,
  and the full existing Playwright suite (05-qa) — 7/7 passed, no regressions.
