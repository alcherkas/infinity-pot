# task-010 — Click-based "Move to..." fallback

## Size
S

## Goal
Provide a non-drag-and-drop way to move/reorder cards (FR6a), as a fallback in case DnD isn't fully reliable, reusing the same `store.reorderCard` function as DnD.

## Files to create/change
- `04-build/src/public/js/render.js` — add a "Move to..." control (button/menu) on each card, listing target lists and position options.
- `04-build/src/public/js/events.js` — handler for the menu selection that calls `store.reorderCard(cardId, toListId, toIndex)` — identical function to the DnD path from task-008.
- `04-build/src/public/index.html` / `app.css` — minor markup/styling for the dropdown/menu.

## Acceptance criteria
- Every card has a visible "Move to..." control independent of drag-and-drop.
- Selecting a target list/position moves the card there, matching the same behavior/persistence as dragging.
- Works even if DnD handlers are absent/broken (manual test: verify the click path alone moves a card).
- No console errors.

## Status
TODO
