# task-014 — Keyword search/filter (Could)

## Size
S

## Goal
Let users filter cards on a board by a keyword, per FR14.

## Files to create/change
- `04-build/src/public/js/store.js` — add `filterCards(boardId, keyword)` (case-insensitive substring match on title/description, non-mutating).
- `04-build/src/public/index.html` — add a search input to the board view.
- `04-build/src/public/js/render.js` — support rendering a filtered view (dim/hide non-matching cards) when a keyword is active.
- `04-build/src/public/js/events.js` — wire search input's `input` event to re-render with the filter applied.

## Acceptance criteria
- Typing a keyword in the search box hides/dims cards whose title and description don't match (case-insensitive).
- Clearing the search box restores the full view.
- Filtering does not mutate underlying state (store data unaffected, only display).
- No console errors.

## Status
TODO
