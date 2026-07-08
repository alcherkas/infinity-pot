# trello-clone — build

Client-only Trello clone. No backend, no build step, no dependencies.

## Run it

```
cd 04-build
npm start
```

Then open http://localhost:3000 (override with `PORT=<n> npm start`).

Equivalent direct command: `node 04-build/src/server.js`.

## Automated tests

```
cd 05-qa
npm install
npx playwright install chromium   # first run only
npm test
```

This starts the app's own server automatically (via Playwright's `webServer`
config) and runs the smoke test in `05-qa/tests/` against it.
