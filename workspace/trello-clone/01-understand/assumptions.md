# Assumptions — trello-clone

This is an append-only audit trail of product decisions made to resolve open questions. Never delete entries; only append.

- 2026-07-08: Purely client-side app with localStorage persistence, no backend/server. Rationale: no multi-user or auth requirement exists, so a server adds cost with zero user benefit for v1.
- 2026-07-08: Frontend stack is plain React SPA built with Vite; no backend framework. Rationale: minimal, standard tooling keeps the build loop small and avoids bikeshedding on infra.
- 2026-07-08: No accounts or login in this version; the browser's local storage is treated as the user's "account." Rationale: single-user solo use case per requirements, login only justified by multi-device/sync needs which are out of scope.
- 2026-07-08: App supports multiple boards from v1 (boards list -> open a board), not just a single board. Rationale: a boards list is core to "Trello-like" identity and is cheap to add alongside single-board logic.
- 2026-07-08: Drag-and-drop is the primary interaction (FR4-FR6), with a click-based fallback ("Move to..." menu, FR6a) as a safety net if DnD proves costly to implement first. Rationale: DnD is central to the Trello experience but must not block shipping a usable first version.
