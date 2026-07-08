# Open Questions — trello-clone

1. Should this be a purely client-side app (data in browser storage, e.g. localStorage) or does it need a backend/server with a real database?
   ANSWERED: Purely client-side with localStorage persistence. No multi-user/auth is required, so a server adds cost with no user benefit for v1.

2. What frontend stack should be used (framework, build tooling)?
   ANSWERED: Plain React SPA with a lightweight build (Vite), no backend framework. Keeps the build loop small and avoids unnecessary infra decisions.

3. Is single-user (no accounts) acceptable, or is any form of login expected eventually?
   ANSWERED: No accounts/login in this version. The browser's local storage is the user's "account"; login can be revisited only if multi-device sync is ever requested.

4. Should the app support multiple boards from the start, or is a single board sufficient for v1?
   ANSWERED: Support multiple boards (boards list → open a board), since a boards list is core to "Trello-like" identity and is cheap to build alongside single-board logic.

5. Is drag-and-drop a hard requirement for the first buildable version, or can click-based move (e.g., "move to list" dropdown) serve as a first pass before implementing full DnD?
   ANSWERED: Drag-and-drop is the primary interaction (FR4-FR6) but ship with a click-based fallback (e.g. "Move to..." menu) if DnD implementation risks stalling the first buildable release. Fallback control can be dropped once DnD is verified working.

6. Card detail modal (FR8): should edits save on close (with an explicit Save action), or autosave as the user types/blurs fields, so closing never discards in-progress edits?
   ANSWERED: Confirmed — autosave on change/blur, no separate Save button; closing the modal never discards data. This is simplest for the user (no extra click, no "did I save?" anxiety) and matches Trello's own behavior, so the suggested default stands as final. (Already reflected in requirements.md FR8.)

7. What is the required browser/device support matrix for drag-and-drop (FR4-FR6), given known DnD quirks (e.g., Safari drag-image rendering, no native HTML5 DnD on touch devices)?
   ANSWERED: Confirmed — mouse-based DnD on latest desktop Chrome, Firefox, and Safari only; touch/mobile relies on the FR6a click-based fallback. This is a single-user desktop tool for v1; chasing full touch DnD now would burn build-loop budget on a device class not in scope. (Already reflected in requirements.md NFR6.)

8. What should happen when localStorage persistence fails (quota exceeded, private-browsing mode with storage disabled, etc.)? Silent failure risks invisible data loss.
   ANSWERED: Confirmed — show a visible, non-blocking warning that changes may not be saved; keep in-memory state usable for the current session. No export feature is required in this version; a toast is the minimum viable protection against silent data loss without adding new scope. (Already reflected in requirements.md NFR7.)
