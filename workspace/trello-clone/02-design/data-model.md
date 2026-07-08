# Data Model — trello-clone

## Storage

Single `localStorage` key holding one JSON blob (versioned for future migrations):

```
localStorage["trello-clone:v1"] = {
  "version": 1,
  "boards": [ Board, ... ],
  "lists": [ List, ... ],
  "cards": [ Card, ... ]
}
```

Flat arrays (not nested) so `store.js` can look up/update any entity by `id` without walking a tree; relations are via foreign-key-style id fields. `storage.js` reads/writes the whole blob on every mutation (write-through, per architecture.md).

## Entities

### Board

| Field | Type | Default | Notes |
|---|---|---|---|
| id | string (uuid) | generated | Primary key |
| title | string | — | required, user-provided (FR1) |
| order | number | next integer | position on boards overview (FR9) |
| createdAt | string (ISO 8601) | now | for stable sort fallback |

Relations: has many `List` (via `List.boardId`).

Example:
```json
{ "id": "b1", "title": "Personal Projects", "order": 0, "createdAt": "2026-07-01T10:00:00.000Z" }
```

### List

| Field | Type | Default | Notes |
|---|---|---|---|
| id | string (uuid) | generated | Primary key |
| boardId | string (uuid) | — | FK → Board.id (FR2) |
| title | string | — | required, e.g. "To Do" |
| order | number | next integer within board | position within board (FR6) |

Relations: belongs to one `Board`; has many `Card` (via `Card.listId`).

Example:
```json
{ "id": "l1", "boardId": "b1", "title": "To Do", "order": 0 }
```

### Card

| Field | Type | Default | Notes |
|---|---|---|---|
| id | string (uuid) | generated | Primary key |
| listId | string (uuid) | — | FK → List.id (FR3); reordering/moving updates this + `order` (FR4/FR5) |
| title | string | — | required |
| description | string | `""` | free text (FR8) |
| order | number | next integer within list | position within list (FR4) |
| label | string \| null | `null` | simple color tag, e.g. `"green"` (FR12, Could) |
| dueDate | string (ISO date) \| null | `null` | e.g. `"2026-07-15"` (FR13, Could) |
| createdAt | string (ISO 8601) | now | stable sort fallback |

Relations: belongs to one `List` (transitively one `Board`).

Example:
```json
{
  "id": "c1",
  "listId": "l1",
  "title": "Write project proposal",
  "description": "Draft outline and share with team for feedback.",
  "order": 0,
  "label": "yellow",
  "dueDate": "2026-07-15",
  "createdAt": "2026-07-01T10:05:00.000Z"
}
```

## Notes on scope

- No `User` entity — single-user, no auth (out of scope per requirements).
- FR14 (keyword search/filter) is a pure client-side filter over existing `Card.title`/`description` fields at render time — no new field or entity needed.
- FR6a (click-based "Move to..." fallback) reuses `Card.listId`/`order` — same fields DnD mutates, no schema impact.
- No separate `label`/`tag` entity: FR12 explicitly asks for "simple tag, no configurable taxonomy," so a plain string field on `Card` is sufficient — normalizing into a `Label` table would be premature.
- `order` fields are plain floats/integers reassigned by `store.js` on reorder (simplest approach for this data scale; no fractional-indexing library needed).
