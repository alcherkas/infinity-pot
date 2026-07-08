# task-015 — Playwright test harness

## Size
M

## Goal
Set up automated QA harness so `test-writer`/`qa-engineer`/`ui-tester` can drive the app via a real browser.

## Files to create/change
- `05-qa/playwright.config.js` — `webServer` config that runs `node 04-build/src/server.js` (or `npm start` from `04-build/`), `baseURL` pointing at the same port, reasonable timeout/retry defaults.
- `05-qa/tests/smoke.spec.js` — one smoke test: load the app, verify empty state or existing boards render, create a board via the UI, verify it appears and survives a reload.
- `package.json` (repo/qa root, wherever tests run from) — add `@playwright/test` devDependency and a `test` script (`playwright test`).

## Acceptance criteria
- `npx playwright test` (from the appropriate directory) starts the dev server automatically and runs the smoke test against it.
- The smoke test passes against the current build (tasks 001-004 must be done first for this to be meaningful).
- Test output clearly reports pass/fail; no leftover server process after the run.

## Status
DONE

## Notes
- Implemented under `05-qa/`: `playwright.config.js` (webServer runs `node 04-build/src/server.js` on port 4173, `reuseExistingServer` outside CI), `tests/smoke.spec.js` (empty state -> create board -> visible -> reload -> still visible, clears localStorage before each run), `package.json` with `@playwright/test` devDependency and `test` script.
- Verified locally: `npm install` + `npx playwright install chromium` + `npx playwright test` -> 1 passed, no leftover server process after the run.
- Repo root `.gitignore` already excludes `node_modules/`, `playwright-report/`, `test-results/`.
- Run instructions added to `04-build/src/README.md`.
