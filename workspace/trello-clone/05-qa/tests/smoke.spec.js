// Smoke test: load the app, verify empty state, create a board via the UI,
// verify it appears and survives a reload (real localStorage persistence).
const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  // Start each test from a clean localStorage so runs don't interfere.
  await page.goto('/');
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
});

test('boards overview loads, shows empty state, and creating a board persists across reload', async ({ page }) => {
  const boardsList = page.locator('#boards-list');

  // Empty state renders first.
  await expect(boardsList).toContainText('No boards yet');

  // Create a board via the UI.
  const boardTitle = `Smoke Test Board ${Date.now()}`;
  await page.locator('#create-board-input').fill(boardTitle);
  await page.locator('#create-board-form button[type="submit"]').click();

  // It appears immediately.
  const boardRow = boardsList.locator('.board-row', { hasText: boardTitle });
  await expect(boardRow).toBeVisible();
  await expect(boardsList).not.toContainText('No boards yet');

  // It survives a reload (localStorage persistence).
  await page.reload();
  await expect(boardsList.locator('.board-row', { hasText: boardTitle })).toBeVisible();
});
