# task-016 — Drag-and-drop for boards (split from task-009)

## Size
S

## Goal
Implement board reordering on the overview page (FR9) via native HTML5 drag-and-drop, reusing the DnD pattern established in task-008/task-009.

## Files to create/change
- `04-build/src/public/js/store.js` — `reorderBoards` store function already exists from task-003; this task is UI wiring only.
- `04-build/src/public/js/events.js` — drag handlers on board tiles in the overview (reorder boards).
- `04-build/src/public/js/render.js` — ensure board tiles have `draggable="true"` and identifying data attributes.

## Acceptance criteria
- Dragging a board tile on the overview reorders boards; persists across reload.
- No console errors.

## Status
TODO
