# task-012 — Card label/color tag (Could)

## Size
S

## Goal
Let users tag a card with a simple color/label, per FR12.

## Files to create/change
- `04-build/src/public/js/store.js` — add `setCardLabel(cardId, label)`.
- `04-build/src/public/js/render.js` — render a color badge on cards that have a label; add a simple picker (e.g. a small set of preset color swatches) in the card detail modal.
- `04-build/src/public/js/events.js` — wire picker selection to `store.setCardLabel`.
- `04-build/src/public/app.css` — badge/swatch styling.

## Acceptance criteria
- Setting a label on a card in the modal shows a colored badge on the card in the board view.
- Clearing a label (`setCardLabel(cardId, null)`) removes the badge.
- Label persists across reload.
- No console errors.

## Status
TODO
