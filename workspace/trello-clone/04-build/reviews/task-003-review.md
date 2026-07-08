VERDICT: APPROVED

# Review: task-003 — Board store (store.js: boards)

1. `04-build/src/public/js/store.js:36-47` — `createBoard(title)` throws `Error('title required')` via `requireTitle` (line 26), creates `{id, title, order, createdAt}` (lines 38-43), pushes to state, persists. Matches api.md `createBoard` and data-model.md `Board` shape. Acceptance criterion met.
2. `store.js:49-55` — `renameBoard` uses `findBoard` (throws `Error('board not found')`, line 32) then `requireTitle` (throws `Error('title required')`), updates title, persists. Matches api.md.
3. `store.js:57-66` — `deleteBoard` throws `Error('board not found')` via `findBoard`, removes the board, and cascades to `lists`/`cards` correctly (not actually a no-op — it's fully functional even though lists/cards are empty until task-005/006, satisfying the task note "cascade logic can be a no-op stub ... but function signature and board removal must work now"). Persists.
4. `store.js:68-79` — `reorderBoards` throws on unknown board, clamps `toIndex` to `[0, length-1]` (line 72), reassigns `order` 0-based and consistently via sort/splice, persists. Matches api.md and acceptance criteria.
5. `store.js:16-18` — `getState()` returns `{boards, lists, cards}` matching data-model.md's flat-array shape.
6. `04-build/src/public/js/app.js:13` — `store.init(storage.load())` correctly seeds store from persisted state at boot, per task's file-change requirement.
7. `04-build/src/public/js/storage.js` (task-002, unchanged) — `save`/`load` write-through semantics used correctly by `store.js`'s `persist()` (line 20-22), called after every mutation.
8. No leftover debug code (no `console.log`, no commented-out blocks beyond the explanatory cascade comment which is accurate, not stale).
9. Minor observation (non-blocking): `store.js` exposes an `init(initialState)` function not documented in `02-design/api.md`, but this is a reasonable, minimal addition needed to wire persisted state into the module-level `state` variable, consistent with the task's explicit instruction for `app.js` to initialize the store from `storage.load()`'s result. Not a contract violation since api.md only documents the mutation/read functions, not internal bootstrapping.

All acceptance criteria in `03-plan/tasks/task-003.md` are satisfied, and the implementation is consistent with `02-design/api.md` and `02-design/data-model.md`. No bugs found.
