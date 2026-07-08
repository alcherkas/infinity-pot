GO

# Release Notes — trello-clone (turn 13)

## What the product does

A single-user, browser-based Trello-style task board app: create boards, each containing lists (columns), each containing cards. Reorder cards within/across lists, reorder lists within a board, and reorder boards on the overview page, all via native drag-and-drop with click-based fallbacks where specified. Click a card to open a detail modal and edit its title/description with explicit Save/Cancel. All destructive actions (delete board/list/card) require confirmation. Data persists locally via `localStorage` and survives page reloads; no login, no backend, no multi-user features — this is a solo-use, client-only SPA served by a minimal Node static file server.

## What shipped this cycle (turn 13)

- **task-017 (NFR7)**: persistence-save-failure warning. `storage.js.save()` now returns a boolean instead of silently swallowing failures; `store.js` exposes an `onSaveError` hook invoked whenever a write fails; the UI shows a dismissible, non-blocking warning banner (`role="alert"`) that reappears on any subsequent failure and is never force-hidden on success. Reviewed and **APPROVED** by code-reviewer (all 5 acceptance criteria met, no regression to the happy-path save/load contract).
- This closes the last open functional/spec gap carried since turn 1; the backlog's Must and Should scope (FR1-FR11, NFR1-NFR7) is now fully built and verified.
- `06-ship/release-notes.md` (this file) written to complete `06-ship/`.

## Full feature set (all prior turns, still in place and verified)

- Boards: create/rename/delete, drag-and-drop reorder (FR1, FR9).
- Lists: create/rename/delete within a board, cascading delete of contained cards, drag-and-drop reorder (FR2, FR6).
- Cards: create/rename/delete within a list, drag-and-drop reorder within/across lists, click-based "Move to..." fallback (FR3, FR4, FR5, FR6a).
- Card detail modal: edit title/description with explicit Save/Cancel/X/overlay-discard semantics (FR8).
- Confirm-before-delete on all destructive actions (FR11).
- Empty states with clear calls-to-action (FR10).
- Persistence across reloads via versioned localStorage blob, corrupt-data fallback (FR7).
- Persistence-failure warning banner (NFR7, this turn).

## Verification

- All 8 Must and 3 Should functional requirements built, code-reviewed (`04-build/reviews/`, 14 task reviews, all APPROVED), and independently UI-verified.
- Automated Playwright suite: 10 specs, all passing (`05-qa/ui-test-report.md`, turn 11).
- Zero open bugs: `bug-001` (list/board reorder and click-fallback not wired up) was found, fixed, and re-verified RESOLVED in turn 11.
- Security review (`06-ship/security-review.md`): **APPROVED** — no exploitable XSS, path-traversal, or secret-leak findings for this local single-user client-only app.
- Requirements review and design review: both **APPROVED**, no open inconsistencies.

## Known limitations (intentionally out of scope for this release)

- **Could-have features not built**: card labels/color tags (FR12), due dates (FR13), keyword search/filter (FR14) — tasks 012-014 remain TODO by deliberate MoSCoW prioritization, not a defect. `02-design/api.md` documents `setCardLabel`/`setCardDueDate`/`filterCards` as designed-but-unimplemented; flagged in the security review as a documentation/build drift worth resolving (build them, or mark them "planned, not yet implemented" in `api.md`) whenever they're prioritized or formally descoped.
- No accounts, login, multi-device sync, or real-time collaboration — single browser/localStorage is the only persistence boundary by design (Won't-list, `01-understand/requirements.md`).
- Touch/tablet drag-and-drop is not supported; touch devices should use the click-based fallback where available (list/board reorder has no click fallback — DnD-only, per `assumptions.md`).
- Test coverage, while covering all 10 core user journeys, has no dedicated automated test for the NFR7 failure path itself (the save-error banner) — code-reviewer confirmed no regression to the happy path, but there's no automated simulation of a `localStorage` quota/write failure.

## Highlights from assumptions.md worth double-checking

- **Tech stack changed from the original plan**: requirements originally sketched a React + Vite SPA; the actual, shipped, reviewed app is plain HTML/CSS/JS with no framework/build step and a minimal Node `http` static server (superseded turn 3). If the user expected a React codebase, this is a deliberate, documented simplification — not what was originally described.
- **FR8 (card detail modal) behavior was reversed from the original spec**: initially planned as autosave-on-blur, the shipped and approved implementation (task-007) instead uses an explicit Save button with Cancel/X/overlay-close all discarding edits. Reconciled into requirements.md at turn 10 to match reality. Worth confirming this matches user expectations, since it changes the "did my edit save?" interaction model.
- **FR9 (board reorder) has no click-based fallback**, unlike cards (FR6a) — this was a deliberate turn-3 decision on the assumption that board counts stay small, so drag-and-drop alone was judged low-risk. If a user expects to reorder many boards without a mouse/trackpad, this is a gap.
- **Drag-and-drop browser/device scope is narrower than "the app works everywhere"**: DnD is only required (and tested) on latest desktop Chrome/Firefox/Safari with mouse input; touch/tablet devices are explicitly out of scope for native DnD and rely on the click-fallback where one exists.
- **NFR7's fix (this turn) surfaces failures but does not add any data-recovery/export feature.** If localStorage is unavailable or full, the user gets a warning and can keep working in-memory for the session, but there is still no way to export/back up that in-memory data if the tab is closed — this was an explicit scope decision (assumptions.md, turn 1) to keep the fix minimal.

## Gate summary

| Gate | Verdict |
|---|---|
| `01-understand/review.md` (requirements) | APPROVED |
| `02-design/review.md` (architecture/api/data-model) | APPROVED |
| `04-build/reviews/*` (14 task reviews) | All APPROVED |
| `05-qa/ui-test-report.md` (turn 11, 10/10 journeys) | APPROVED |
| `06-ship/security-review.md` | APPROVED |
| Open bugs | 0 (bug-001 RESOLVED) |
| Backlog | 14/17 DONE — all Must/Should scope complete; 3 remaining rows (task-012/013/014) are Could-have, deliberately deferred per MoSCoW, not blocking |

**Decision: GO.** All release gates are APPROVED, every Must/Should requirement is built and verified, the last outstanding gap (NFR7) closed this turn, and no open bugs remain. The three Could-have tasks are correctly out of scope for this release per the requirements' own prioritization.
