# Requirements — trello-clone

## Goal
Build a simple, single-user web app that mimics core Trello functionality: boards containing lists containing cards, with drag-and-drop reordering and basic card details. Scope is deliberately small — this is a "tiny build loop" project, not a full multi-tenant SaaS clone.

## Users
- **Solo user** — one person organizing their own tasks/projects via boards. No teams, sharing, or permissions in this version.

## User Journeys
1. User opens the app and sees a list of their boards (or an empty state prompting to create one).
2. User creates a new board, giving it a title.
3. User opens a board and sees its lists (columns), e.g. "To Do", "Doing", "Done".
4. User creates a new list on a board.
5. User creates a card within a list, giving it a title.
6. User drags a card to reorder it within a list or move it to another list.
7. User clicks a card to open details and edit title/description.
8. User deletes a card, a list, or a board.
9. User's data persists across browser sessions (reload keeps boards/lists/cards).

## Functional Requirements (MoSCoW)

### Must
- FR1: Create, view, rename, and delete boards.
- FR2: Create, rename, and delete lists within a board.
- FR3: Create, rename, and delete cards within a list.
- FR4: Reorder cards within a list via drag-and-drop.
- FR5: Move cards between lists via drag-and-drop.
- FR6: Reorder lists within a board via drag-and-drop.
- FR6a: Provide a click-based fallback control (e.g. a "Move to..." menu on a card) for moving/reordering cards, to be used if drag-and-drop is not yet implemented/working; may be removed once FR4-FR6 are verified.
- FR7: Persist all data (boards, lists, cards, order) across page reloads.
- FR8: Card detail view supporting a free-text description field. Fields autosave on change/blur (no separate "Save" button); closing the modal never discards edits already made. (See open question 6.)

### Should
- FR9: Reorder boards on the boards overview page via drag-and-drop (consistent with FR4-FR6), with no separate click-based fallback required since board count is expected to be small.
- FR10: Basic empty states (no boards yet, no lists yet, no cards yet) with clear call-to-action.
- FR11: Confirm before destructive actions (delete board/list/card).

### Could
- FR12: Card labels/colors (simple tag, no configurable taxonomy).
- FR13: Card due dates.
- FR14: Simple keyword search/filter across cards on a board.

### Won't (this version)
- Multi-user accounts, authentication, or sharing/collaboration.
- Real-time sync between multiple clients/tabs.
- Comments, attachments, checklists, activity log.
- Mobile native apps (web-responsive only, if at all).

## Tech Stack Decision
- Frontend: plain HTML/CSS/JavaScript (no framework, no build step), served by a minimal Node `http` static server. Native HTML5 drag-and-drop. Superseded the original React + Vite sketch once the architecture and first three build tasks confirmed a framework-free build is sufficient and keeps the loop smaller — see `02-design/architecture.md` (turn 1, APPROVED).
- Testing: Playwright (the app's only devDependency), introduced at task-015.
- Persistence: browser localStorage only.

## Non-Functional Requirements
- NFR1: Single-page web app, usable in a modern desktop browser (Chrome/Firefox/Safari latest).
- NFR2: Drag-and-drop interactions must feel responsive (local state updates immediately; persistence happens in the background).
- NFR3: No login required — app works immediately on first load.
- NFR4: Data persists locally (e.g., browser storage) unless a backend is explicitly built; no requirement for cloud sync in this version.
- NFR5: Codebase small enough to be built and reviewed incrementally by the tiny build loop (prefer a single frontend app over a distributed system).
- NFR6: Drag-and-drop is required to work correctly on latest desktop Chrome, Firefox, and Safari using mouse input. Touch-based drag-and-drop on mobile/tablet is not required for this version (FR6a's click-based fallback covers non-mouse input instead). (See open question 7.)
- NFR7: If persisting to localStorage fails (e.g., quota exceeded, private-browsing storage disabled), the app must show a visible, non-blocking warning to the user rather than silently losing data or crashing; in-memory state should remain usable for the current session even if persistence fails. (See open question 8.)

## Out of Scope
- Authentication, authorization, multi-tenancy.
- Real-time collaboration / websockets.
- Notifications, emails.
- Mobile native clients.
- Import/export from real Trello.
