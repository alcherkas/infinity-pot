# task-003 — Board store (store.js: boards)

## Size
M

## Goal
Implement the in-memory store's board-level state and mutations, write-through persisted via `storage.js`, per `02-design/api.md`.

## Files to create/change
- `04-build/src/public/js/store.js` — `getState()`, `createBoard(title)`, `renameBoard(boardId, title)`, `deleteBoard(boardId)` (cascades lists/cards — cascade logic can be a no-op stub until task-005/006 add lists/cards, but the function signature and board removal must work now), `reorderBoards(boardId, toIndex)`. Each mutation persists via `storage.save()` after updating in-memory state. Validation/errors as specified in api.md (`Error('title required')`, `Error('board not found')`).
- `04-build/src/public/js/app.js` — `init()` now initializes `store` with `storage.load()`'s result as the starting state.

## Acceptance criteria
- `store.createBoard('Test')` adds a board with `id`, `title`, `order`, `createdAt`, and calling `storage.load()` afterward reflects it (persisted).
- `store.createBoard('')` throws `Error('title required')`.
- `store.renameBoard(id, 'New')` updates title; unknown id throws `Error('board not found')`.
- `store.deleteBoard(id)` removes the board from state and persists.
- `store.reorderBoards(id, toIndex)` updates `order` fields consistently (0-based, clamped to valid range) and persists.
- `store.getState()` returns the current `{boards, lists, cards}` object matching data-model.md shapes.

## Status
TODO
