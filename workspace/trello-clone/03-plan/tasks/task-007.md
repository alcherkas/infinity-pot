# task-007 — Card detail modal

## Size
M

## Goal
Let users open a card to view/edit its title and free-text description, per FR8.

## Files to create/change
- `04-build/src/public/js/store.js` — add `updateCardDescription(cardId, description)`.
- `04-build/src/public/index.html` — add modal markup/container for card detail (title input, description textarea, save/close buttons).
- `04-build/src/public/js/render.js` — `renderCardModal(card)` to populate/show the modal; hide it when closed.
- `04-build/src/public/js/events.js` — click card → open modal populated with its data; save → calls `renameCard`/`updateCardDescription`; close/cancel → hide modal without saving unsaved edits (or save-on-close, developer's call, document choice in code comments).
- `04-build/src/public/app.css` — basic modal overlay styling.

## Acceptance criteria
- Clicking a card opens a modal showing its current title and description.
- Editing the description and saving persists it; reopening the card shows the updated description.
- Editing the title via the modal also updates the card's displayed title in the board view.
- Closing the modal (e.g. via an X button or overlay click) returns to the board view without errors.
- No console errors.

## Status
DONE

## Notes
- Save/close semantics: Cancel and the X/overlay close discard unsaved edits (no auto-persist); only the explicit Save button calls `renameCard`/`updateCardDescription`. Documented inline in `events.js`.
- Clicking a card title now opens the modal (`data-action="open-card"`) instead of the old `window.prompt` rename flow; title editing moved into the modal's title input.
- Added `description` field (default `''`) to `createCard` in `store.js` to match `02-design/data-model.md`.
