# task-004 — Boards overview UI

## Size
M

## Goal
Wire up the boards overview page: rendering, create/rename/delete actions, empty state, and navigation into a board (board view can be a stub heading for now).

## Files to create/change
- `04-build/src/public/js/render.js` — `renderBoardsView(state)`: lists boards (title, click-to-open), shows FR10 empty state ("No boards yet — create one") when `state.boards` is empty.
- `04-build/src/public/js/events.js` — click handlers: "create board" form/button → `store.createBoard`, inline rename → `store.renameBoard`, delete button → `store.deleteBoard` (no confirm dialog yet — that's task-011), click board → switch to board view (can just show board id/title as a stub, full list/card rendering comes in task-005/006).
- `04-build/src/public/js/app.js` — `init()` wires `events.js` listeners and calls `render.js`'s `renderBoardsView` after load and after every mutation (simple re-render-on-every-change strategy).
- `04-build/src/public/index.html` — add real containers/templates needed for the boards view (create-board form, boards list container).

## Acceptance criteria
- Loading the app with no data shows the empty state with a way to create a board.
- Creating a board via the UI adds it to the visible list and persists (reload shows it still there).
- Renaming a board updates the displayed title.
- Deleting a board removes it from the list.
- Clicking a board navigates to a (stub) board view showing at least the board's title.
- No console errors during any of the above interactions.

## Status
DONE
