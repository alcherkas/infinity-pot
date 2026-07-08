# task-005 — Lists (store + UI)

## Size
M

## Goal
Implement list CRUD in the store and render lists within the board view, per FR2.

## Files to create/change
- `04-build/src/public/js/store.js` — add `createList(boardId, title)`, `renameList(listId, title)`, `deleteList(listId)` (cascades: deletes cards belonging to the list), `reorderLists(boardId, listId, toIndex)`. Also complete `deleteBoard`'s cascade (delete its lists, which cascades cards) now that lists exist.
- `04-build/src/public/js/render.js` — `renderBoardView(state, boardId)`: replaces the board-view stub from task-004 with real rendering of the board's lists (title + container for cards, cards rendering stubbed/empty until task-006), FR10 empty state when a board has no lists.
- `04-build/src/public/js/events.js` — create/rename/delete list handlers wired to the new store functions; re-render board view on change.

## Acceptance criteria
- Opening a board with no lists shows an empty state with a "create list" affordance.
- Creating a list shows it as a column in the board view; persists across reload.
- Renaming/deleting a list works and persists.
- Deleting a board also removes its lists (and any cards, once task-006 exists) from state.
- No console errors.

## Status
DONE
