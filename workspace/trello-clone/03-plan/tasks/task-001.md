# task-001 — Skeleton dev server

## Size
S

## Goal
Produce a startable app skeleton: one command runs a static file server serving a minimal page, so every later task has a running base to build on.

## Files to create
- `04-build/src/server.js` — Node built-in `http` module static file server, no dependencies, serves `04-build/src/public/`, default port (e.g. 3000), configurable via `PORT` env var.
- `04-build/src/public/index.html` — page shell with placeholders for boards view / board view / card-detail modal (containers only, can be empty divs with ids), loads `js/app.js` as `<script type="module">`.
- `04-build/src/public/app.css` — minimal baseline layout/reset styles.
- `04-build/src/public/js/app.js` — `init()` that, for now, just renders a static "No boards yet" empty-state message into the boards container (no store/storage yet — those come in task-002/003).
- `package.json` (repo root of `04-build/`, or wherever build root is) — `name`, `"scripts": {"start": "node src/server.js"}`, no dependencies.

## Acceptance criteria
- `npm start` (or `node 04-build/src/server.js`) starts a server with no errors and no npm install required.
- Visiting `http://localhost:3000` in a browser (or via curl) returns the HTML page with status 200.
- Page displays an empty-state message (e.g. "No boards yet") — confirms `app.js` is loaded and executing.
- No console errors in browser dev tools on load.
- No framework/build-step dependencies added, per `02-design/architecture.md`.

## Status
DONE
