# task-013 — Card due date (Could)

## Size
S

## Goal
Let users set an optional due date on a card, per FR13.

## Files to create/change
- `04-build/src/public/js/store.js` — add `setCardDueDate(cardId, dueDate)` with ISO date validation (`Error('invalid date')`).
- `04-build/src/public/index.html` / `render.js` — add a date input in the card detail modal; display the due date on the card face in the board view when set.
- `04-build/src/public/js/events.js` — wire the date input's change to `store.setCardDueDate`.

## Acceptance criteria
- Setting a due date in the modal shows it on the card in the board view.
- Clearing the due date (empty input → `null`) removes it from the card display.
- Invalid date input is rejected without corrupting state (surfaced as a user-visible error, not a silent failure or crash).
- Due date persists across reload.
- No console errors.

## Status
TODO
