# task-011 — Confirm before destructive actions

## Size
S

## Goal
Guard board/list/card deletion with a confirmation step, per FR11.

## Files to create/change
- `04-build/src/public/js/events.js` — wrap delete handlers for boards (task-004), lists (task-005), cards (task-006) with a `confirm()` (or a lightweight custom confirm dialog) before calling the corresponding `store.delete*` function.

## Acceptance criteria
- Clicking delete on a board/list/card prompts for confirmation before anything is removed.
- Cancelling the confirmation leaves data untouched.
- Confirming proceeds with the existing delete behavior (including cascades) from earlier tasks.
- No console errors.

## Status
DONE
