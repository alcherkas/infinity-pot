# task-002 — Persistence layer (storage.js)

## Size
S

## Goal
Implement localStorage persistence so state survives reloads, per FR7 and `02-design/api.md`'s `storage.js` spec.

## Files to create/change
- `04-build/src/public/js/storage.js` — `load()` and `save(state)` per api.md: versioned key `trello-clone:v1`, `{version, boards, lists, cards}` shape; `load()` returns fresh empty structure `{boards:[], lists:[], cards:[]}` if absent/corrupt/wrong version; `save()` catches quota/availability errors and logs, never throws.
- `04-build/src/public/js/app.js` — update `init()` to call `storage.load()` and pass result forward (still just re-rendering empty state or the loaded boards count for now).

## Acceptance criteria
- `storage.load()` returns `{boards:[], lists:[], cards:[]}` when localStorage is empty.
- `storage.save(state)` writes valid JSON to `localStorage["trello-clone:v1"]` including a `version` field.
- `storage.load()` after a `storage.save()` round-trips the same data.
- Corrupt JSON in the key (manually set to `"not json"`) causes `load()` to return the fresh empty structure without throwing.
- No dependency added; plain browser `localStorage` API only.

## Status
DONE
