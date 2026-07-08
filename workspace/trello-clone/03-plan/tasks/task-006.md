# task-006 — Cards (store + UI)

## Size
M

## Goal
Implement card CRUD in the store and render cards within lists, per FR3.

## Files to create/change
- `04-build/src/public/js/store.js` — add `createCard(listId, title)`, `renameCard(cardId, title)`, `deleteCard(cardId)`. Complete `deleteList`'s cascade to actually remove its cards now that cards exist.
- `04-build/src/public/js/render.js` — extend `renderBoardView` to render each list's cards (title only for now; description/label/dueDate come in later tasks), FR10 empty state when a list has no cards.
- `04-build/src/public/js/events.js` — create/rename/delete card handlers wired to store functions; re-render on change.

## Acceptance criteria
- A list with no cards shows an empty state with a "create card" affordance.
- Creating a card shows it under the correct list; persists across reload.
- Renaming/deleting a card works and persists.
- Deleting a list also removes its cards from state.
- No console errors.

## Status
DONE
