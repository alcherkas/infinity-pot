VERDICT: APPROVED

# UI Test Report — Turn 11 (bug-001 re-verification)

## Summary

- Re-verified bug-001: FR6 (list reorder DnD, task-009), FR9 (board reorder
  DnD, task-016), and FR6a (click-based "Move to..." fallback, task-010) are
  now all wired up in the UI and work correctly.
- Extended the Playwright e2e suite from 7 to 10 specs, adding coverage for
  these three previously-missing journeys. All 10 pass.
- Performed an exploratory walkthrough of the running app, adding 7 new
  screenshots (17-23) to the existing turn-011 walkthrough, specifically
  exercising board reorder, list reorder, and the click-based move fallback.
- `05-qa/bugs/bug-001.md` is now marked RESOLVED.

**Environment note:** the Playwright MCP browser tool in this sandbox
requires a system-installed Google Chrome (`/Applications/Google
Chrome.app`), which is not present and cannot be installed without root
access (confirmed again this turn: `npx playwright install chrome` prompts
for a `sudo` password that isn't available in this environment). As in the
prior turn-11 report, the exploratory walkthrough below was instead driven
by the project's own installed Playwright Chromium (the same engine, same
real app, same real user interactions — clicks, typing, native HTML5
drag-and-drop, dropdown selection), with a screenshot taken at every step
against the running `04-build/src/server.js` app. This is a tooling
substitution, not a scope reduction.

**Test-authoring note:** the initial list-reorder test used Playwright's
`locator.dragTo()` helper (as the existing card-DnD tests do) and it did not
reliably trigger the app's native HTML5 `dragover`/`drop` handlers for the
narrow list-header case, even though the app's list-DnD implementation
itself is correct — a manual `page.mouse.move()`-driven drag confirmed the
feature works. The test was rewritten to drive the drag with explicit
intermediate `mouse.move()` steps, which is a test-tooling fix, not an
application fix.

## Automated test run

```
cd 05-qa
npm install
npx playwright install chromium
npm test
```

```
Running 10 tests using 2 workers

  ✓ tests/smoke.spec.js › boards overview loads, shows empty state, and creating a board persists across reload
  ✓ tests/journeys.spec.js › Boards journey › create, rename, and delete a board
  ✓ tests/journeys.spec.js › Boards journey › delete cancel keeps the board
  ✓ tests/journeys.spec.js › Lists and cards journey › open a board, create lists and cards, edit a card, delete a card/list
  ✓ tests/journeys.spec.js › Lists and cards journey › data persists across reload (board, list, card)
  ✓ tests/journeys.spec.js › Card drag-and-drop journey › reorder a card within a list via drag-and-drop
  ✓ tests/journeys.spec.js › Card drag-and-drop journey › move a card between lists via drag-and-drop
  ✓ tests/journeys.spec.js › Card drag-and-drop journey › reorder lists within a board via drag-and-drop (FR6)
  ✓ tests/journeys.spec.js › Card drag-and-drop journey › reorder boards on the overview page via drag-and-drop (FR9)
  ✓ tests/journeys.spec.js › Card drag-and-drop journey › FR6a: click-based "Move to..." fallback moves a card without drag-and-drop

  10 passed (3.1s)
```

## Journey results

| # | Journey (from requirements.md) | Result | Notes |
|---|---|---|---|
| 1 | Open app, see boards list / empty state | PASS | Screenshot 01 (from prior run, app unchanged). |
| 2 | Create a new board | PASS | Screenshot 02, 17. |
| 3 | Open a board, see its lists | PASS | Screenshots 03, 04, 19. |
| 4 | Create a new list on a board | PASS | Screenshot 19. |
| 5 | Create a card within a list | PASS | Screenshots 05, 21. |
| 6 | Drag a card to reorder within a list / move to another list | PASS | Screenshots 09, 10; automated. |
| 6b (FR6) | Reorder lists within a board via drag-and-drop | **PASS (fixed)** | Screenshot 20 shows "Done" dragged to the front (from Done/To Do/Doing → reordered); automated test passes. Previously FAIL in bug-001. |
| 6c (FR9) | Reorder boards on the overview page via drag-and-drop | **PASS (fixed)** | Screenshot 18 shows "Third Board" dragged above "Bug 001 Reverify"; automated test passes. Previously FAIL in bug-001. |
| 6d (FR6a) | Click-based "Move to..." fallback for moving/reordering cards | **PASS (fixed)** | Screenshots 22-23 show the dropdown open and the card moved from "Doing" to "To Do" via the select; automated test passes. Previously FAIL in bug-001. |
| 7 | Click a card, edit title/description, Save persists, Cancel/X/overlay discard | PASS | Screenshots 06-08; automated. |
| 8 | Delete a card, a list, a board (with confirm) | PASS | Screenshots 12, 16; automated. |
| 9 | Data persists across browser sessions/reload | PASS | Screenshots 14-15; automated. |

Journeys passed: 10/10. bug-001's three sub-journeys (FR6, FR9, FR6a) all
now pass, both via automated test and manual visual confirmation. No
regressions found in previously-passing journeys.

## Exploratory walkthrough screenshots

Board creation and boards overview (from prior run, unaffected by this fix):

![Boards empty state](walkthrough/turn-011/01-boards-empty-state.png)
![Board created](walkthrough/turn-011/02-board-created.png)

Opening a board, creating lists and cards (from prior run):

![Board view, no lists yet](walkthrough/turn-011/03-board-view-empty-lists.png)
![Lists created](walkthrough/turn-011/04-lists-created.png)
![Cards created](walkthrough/turn-011/05-cards-created.png)

Card detail modal (open, edit, save) (from prior run):

![Card modal open](walkthrough/turn-011/06-card-modal-open.png)
![Card modal description typed](walkthrough/turn-011/07-card-modal-description-typed.png)
![Card modal saved and closed](walkthrough/turn-011/08-card-modal-saved-closed.png)

Card drag-and-drop (reorder within list, move across lists) (from prior run):

![Card reordered within list](walkthrough/turn-011/09-card-reordered-within-list.png)
![Card moved to Doing](walkthrough/turn-011/10-card-moved-to-doing.png)

List rename, card delete (from prior run):

![List renamed](walkthrough/turn-011/11-list-renamed.png)
![Card deleted](walkthrough/turn-011/12-card-deleted.png)

Navigation and persistence across reload (from prior run):

![Back to boards overview](walkthrough/turn-011/13-back-to-boards-overview.png)
![Reload persists boards](walkthrough/turn-011/14-reload-persistence-boards.png)
![Reload persists board detail](walkthrough/turn-011/15-reload-persistence-board-detail.png)

Board deletion (cleanup, back to empty state) (from prior run):

![Board deleted, empty state](walkthrough/turn-011/16-board-deleted-empty-state.png)

**New this turn — bug-001 re-verification:**

Three boards created, then reordered via drag-and-drop (FR9):

![Three boards created](walkthrough/turn-011/17-three-boards-created.png)
![Boards reordered](walkthrough/turn-011/18-boards-reordered.png)

Three lists created on a board, then reordered via drag-and-drop (FR6),
"Done" dragged to the front:

![Three lists created](walkthrough/turn-011/19-three-lists-created.png)
![Lists reordered, Done first](walkthrough/turn-011/20-lists-reordered-done-first.png)

Click-based "Move to..." fallback (FR6a) — card created in "Doing", then
moved to "To Do" via the dropdown, not drag-and-drop:

![Card created in Doing](walkthrough/turn-011/21-card-created-in-doing.png)
![Move to dropdown open](walkthrough/turn-011/22-move-to-dropdown-open.png)
![Card moved via fallback](walkthrough/turn-011/23-card-moved-via-fallback.png)

## Bugs

- `05-qa/bugs/bug-001.md` — RESOLVED this turn. FR6 (list reorder, Must), FR9
  (board reorder, Should), and FR6a (click-based fallback, Must) are now all
  implemented and verified.

## Recommendation

VERDICT: APPROVED — bug-001 is fixed and re-verified; all 10 Must/Should
journeys from requirements.md now pass both automated Playwright tests and
manual exploratory walkthrough with no regressions.
