# task-017 — Persistence save-failure warning (NFR7)

## Size
S

## Goal
Per NFR7: if `storage.save()` fails (quota exceeded, private-browsing storage disabled, etc.), show a visible, non-blocking warning banner to the user instead of silently losing data. The app must keep working in-memory for the rest of the session.

## Files to create/change
- `04-build/src/public/js/storage.js` — `save(state)` returns `true`/`false` instead of `void`, so callers can detect failure. Errors are still caught internally and logged (unchanged).
- `04-build/src/public/js/store.js` — every mutation already calls an internal `persist()` after mutating; `persist()` now checks `storage.save()`'s return value and, on failure, invokes a registered `onSaveError` callback (new `store.onSaveError(callback)` setter) instead of throwing or blocking the mutation.
- `04-build/src/public/js/render.js` — new `render.showSaveWarning()` / `render.hideSaveWarning()` to show/hide a dismissible warning banner in a new `#save-warning-banner` element.
- `04-build/src/public/index.html` — add `<div id="save-warning-banner" hidden>...</div>` (with a dismiss button) near the top of `<body>`.
- `04-build/src/public/app.css` — minimal styling for the banner (non-blocking, e.g. fixed/sticky top bar, warning color).
- `04-build/src/public/js/app.js` — at boot, call `store.onSaveError(render.showSaveWarning)` to wire the two together.

## Acceptance criteria
- When `storage.save()` throws/fails, a visible warning banner appears (e.g. "Changes may not be saved — your browser's storage is unavailable or full.") without blocking any UI interaction — the user can keep creating/editing boards/lists/cards.
- The banner is dismissible (a close button hides it) but reappears if another save failure occurs later.
- When `storage.save()` succeeds, no banner appears and any previously-shown banner is not force-hidden on every successful save (dismiss state persists until the next failure, per non-blocking intent) — simplest correct behavior: only show/manage the banner in response to actual failures, never auto-hide on success.
- No exception is thrown out of any mutation function when persistence fails; the in-memory state and UI remain fully usable for the rest of the session.
- Existing test suite (`05-qa/`) still passes; no console errors on the happy path.

## Status
DONE
