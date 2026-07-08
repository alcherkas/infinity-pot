# Assumptions — trello-clone

This is an append-only audit trail of product decisions made to resolve open questions. Never delete entries; only append.

- 2026-07-08: Purely client-side app with localStorage persistence, no backend/server. Rationale: no multi-user or auth requirement exists, so a server adds cost with zero user benefit for v1.
- 2026-07-08: Frontend stack is plain React SPA built with Vite; no backend framework. Rationale: minimal, standard tooling keeps the build loop small and avoids bikeshedding on infra.
- 2026-07-08: No accounts or login in this version; the browser's local storage is treated as the user's "account." Rationale: single-user solo use case per requirements, login only justified by multi-device/sync needs which are out of scope.
- 2026-07-08: App supports multiple boards from v1 (boards list -> open a board), not just a single board. Rationale: a boards list is core to "Trello-like" identity and is cheap to add alongside single-board logic.
- 2026-07-08: Drag-and-drop is the primary interaction (FR4-FR6), with a click-based fallback ("Move to..." menu, FR6a) as a safety net if DnD proves costly to implement first. Rationale: DnD is central to the Trello experience but must not block shipping a usable first version.
- 2026-07-08: Card detail modal (FR8) autosaves on change/blur with no separate Save button; closing the modal never discards edits. Rationale: removes "did I save?" ambiguity and matches users' existing mental model from real Trello, at no added implementation cost.
- 2026-07-08: Drag-and-drop (FR4-FR6/NFR6) is only required to work with mouse input on latest desktop Chrome, Firefox, and Safari; touch/tablet devices use the FR6a click-based fallback instead of native DnD. Rationale: this is a single-user desktop-first tool for v1 — full touch DnD support is real effort for a device class outside the stated scope.
- 2026-07-08: If localStorage persistence fails (NFR7), the app shows a visible, non-blocking warning and keeps in-memory state usable for the session; no data export feature is added. Rationale: prevents silent data loss with minimal added scope — a toast is the cheapest fix that respects the user's trust without inventing a new export feature nobody asked for.
