VERDICT: APPROVED

# Review — task-010: Click-based "Move to..." fallback

## Findings

1. `04-build/src/public/js/render.js:85-87` — every card row renders a `<select class="move-card-select" data-action="move-card-select" aria-label="Move card">` with a visible "Move to..." placeholder, unconditionally (not gated on DnD support), satisfying "every card has a visible Move to... control independent of drag-and-drop."
2. `04-build/src/public/js/render.js:44-61` (`renderMoveToOptions`) and `:65-71` (`computeBoardLists`) build target list/position options correctly: same-list positions cap at `cardCount` (skips the card's own current slot via the `isCurrent` check at line 52-53), other-list positions include one extra trailing slot (`cardCount + 1`) for appending. Matches `02-design/api.md`'s `reorderCard(cardId, toListId, toIndex)` contract (line 98-103 of api.md).
3. `04-build/src/public/js/events.js:369-383` — options are populated lazily on first focus (capture-phase listener, needed since `focus` doesn't bubble), avoiding leaking other lists' titles into every card row's text content up front; a `dataset.populated` guard prevents duplicate option insertion. This is a reasonable, documented design choice (comment at events.js:364-368).
4. `04-build/src/public/js/events.js:385-400` — the `change` handler parses `toListId::toIndex` from the select value and calls `store.reorderCard(cardId, toListId, toIndex)` — the exact same function used by the DnD drop handler at events.js:112, satisfying "reusing the same store.reorderCard function as DnD" and "matching the same behavior/persistence as dragging." Errors are caught and logged via `console.warn`, not surfaced as uncaught exceptions — consistent with the rest of the codebase's error-handling style, satisfying "no console errors" under normal operation.
5. This handler is wired independently of the drag/drop listeners (`wireCardDragAndDrop`, separate `dragstart`/`dragover`/`drop` set at events.js:73-119) — the select/change listeners have no dependency on `draggedCardId` or any DnD state, so the click path functions even if DnD is absent/broken, satisfying the manual-test acceptance criterion.
6. `04-build/src/public/app.css:140-144` (`.move-card-select`) provides minor styling per the task's file list, and comments at app.css:82-131 document deliberate layout/drag-handle considerations so the select doesn't interfere with the existing card drag handle.
7. Note (non-blocking): `05-qa/bugs/bug-001.md` is still `Status: OPEN` and predates this task; it also cites FR6a as missing. That bug's FR6a complaint is now resolved by this task's work, but closing/updating that bug file is QA's/bug-fixer's responsibility, not part of task-010's file list — flagging for the next QA pass, not a reason to request changes here.

## Conclusion

All four acceptance criteria are met: a visible, DnD-independent "Move to..." control exists on every card; selecting a target invokes the identical `store.reorderCard` used by drag-and-drop; the control functions independently of the DnD wiring; and no unhandled errors are introduced. No leftover debug code found. Approved.
