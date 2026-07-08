// Playwright config for trello-clone.
// Starts the app's own static server (04-build/src/server.js) and runs tests
// against it — no test-only server, no mocking, the same code users run.
const path = require('path');
const { defineConfig, devices } = require('@playwright/test');

const PORT = process.env.PORT || 4173;
const BASE_URL = `http://localhost:${PORT}`;

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: false,
  retries: 1,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  reporter: [['list']],
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: `node ${JSON.stringify(path.join(__dirname, '..', '04-build', 'src', 'server.js'))}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 15_000,
    env: { PORT: String(PORT) },
  },
});
