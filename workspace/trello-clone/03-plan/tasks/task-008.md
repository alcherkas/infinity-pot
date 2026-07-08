# task-008 — Drag-and-drop for cards

## Size
M

## Goal
Implement card reordering within a list and moving cards between lists via native HTML5 drag-and-drop, per FR4/FR5.

## Files to create/change
- `04-build/src/public/js/store.js` — add `reorderCard(cardId, toListId, toIndex)` per api.md (mutates `listId`/`order`, clamps `toIndex`).
- `04-build/src/public/js/events.js` — add `dragstart`/`dragover`/`drop` handlers on card elements and list drop zones; on drop, compute target list/index and call `store.reorderCard`.
- `04-build/src/public/js/render.js` — ensure cards/lists have stable `draggable="true"` attributes and data attributes (e.g. `data-card-id`) needed for drag handlers to identify elements.
- `04-build/src/public/app.css` — minor visual feedback for drag-over state (optional but recommended).

## Acceptance criteria
- Dragging a card within the same list reorders it; new order persists across reload.
- Dragging a card into a different list moves it (updates `listId`) and persists.
- UI updates immediately on drop (NFR2) — no visible lag or flicker.
- Dropping outside a valid target is a no-op (no crash, no data loss).
- No console errors during drag operations.

## Status
TODO
