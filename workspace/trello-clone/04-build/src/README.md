# trello-clone — build

Client-only Trello clone. No backend, no build step, no dependencies.
Static frontend (`public/`) served by a tiny Node `http` server
(`server.js`); data is persisted in the browser's localStorage.

## Setup

No install step is required to run the app itself (zero dependencies).
From the repo root:

```
cd 04-build
```

## Start

```
npm start
```

Then open http://localhost:3000 in a browser.

Override the port:

```
PORT=4000 npm start
```

Equivalent direct command (from the repo root, no `npm` needed):

```
node 04-build/src/server.js
```

## Test

The automated test suite lives in `05-qa/` (a separate package, since
Playwright is a devDependency there, not in the app itself). From the repo
root:

```
cd 05-qa
npm install
npx playwright install chromium   # first run only
npm test
```

This starts the app's own server automatically (via Playwright's
`webServer` config in `playwright.config.js`) and runs the specs in
`05-qa/tests/` (`smoke.spec.js`, `journeys.spec.js`) against it — 10 tests
covering boards/lists/cards CRUD, drag-and-drop reordering, the
click-based "Move to..." fallback, and reload persistence.
