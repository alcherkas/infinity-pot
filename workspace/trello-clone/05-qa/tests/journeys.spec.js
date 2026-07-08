// End-to-end journeys covering the core Trello-clone flows from
// 01-understand/requirements.md: board CRUD, list CRUD, card CRUD,
// card detail modal (save/cancel discard), and card drag-and-drop
// (reorder within a list, move across lists).
const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
});

async function createBoard(page, title) {
  await page.locator('#create-board-input').fill(title);
  await page.locator('#create-board-form button[type="submit"]').click();
}

async function openBoard(page, title) {
  await page.locator('.board-row', { hasText: title }).locator('.board-title').click();
}

async function createList(page, title) {
  await page.locator('#create-list-input').fill(title);
  await page.locator('#create-list-form button[type="submit"]').click();
}

async function createCard(page, listTitle, cardTitle) {
  const listColumn = page.locator('.list-column', { hasText: listTitle });
  await listColumn.locator('input[name="card-title"]').fill(cardTitle);
  await listColumn.locator('.create-card-form button[type="submit"]').click();
}

test.describe('Boards journey', () => {
  test('create, rename, and delete a board', async ({ page }) => {
    const title = `Board ${Date.now()}`;
    await createBoard(page, title);
    const row = page.locator('.board-row', { hasText: title });
    await expect(row).toBeVisible();

    // Rename
    page.once('dialog', (dialog) => dialog.accept(`${title} Renamed`));
    await row.locator('[data-action="rename-board"]').click();
    await expect(page.locator('.board-row', { hasText: `${title} Renamed` })).toBeVisible();

    // Delete (confirm)
    const renamedRow = page.locator('.board-row', { hasText: `${title} Renamed` });
    page.once('dialog', (dialog) => dialog.accept());
    await renamedRow.locator('[data-action="delete-board"]').click();
    await expect(page.locator('#boards-list')).toContainText('No boards yet');
  });

  test('delete cancel keeps the board', async ({ page }) => {
    const title = `Keep Me ${Date.now()}`;
    await createBoard(page, title);
    const row = page.locator('.board-row', { hasText: title });
    page.once('dialog', (dialog) => dialog.dismiss());
    await row.locator('[data-action="delete-board"]').click();
    await expect(row).toBeVisible();
  });
});

test.describe('Lists and cards journey', () => {
  test('open a board, create lists and cards, edit a card, delete a card/list', async ({ page }) => {
    const boardTitle = `Project ${Date.now()}`;
    await createBoard(page, boardTitle);
    await openBoard(page, boardTitle);

    await expect(page.locator('#board-view')).toBeVisible();
    await expect(page.locator('#lists-container')).toContainText('No lists yet');

    await createList(page, 'To Do');
    await createList(page, 'Doing');
    await expect(page.locator('.list-column', { hasText: 'To Do' })).toBeVisible();
    await expect(page.locator('.list-column', { hasText: 'Doing' })).toBeVisible();

    await createCard(page, 'To Do', 'Write requirements');
    await createCard(page, 'To Do', 'Design schema');
    const todoColumn = page.locator('.list-column', { hasText: 'To Do' });
    await expect(todoColumn.locator('.card-row', { hasText: 'Write requirements' })).toBeVisible();
    await expect(todoColumn.locator('.card-row', { hasText: 'Design schema' })).toBeVisible();

    // Open card detail, edit description, Save persists it.
    await todoColumn.locator('.card-title', { hasText: 'Write requirements' }).click();
    await expect(page.locator('#card-modal')).toBeVisible();
    await page.locator('#card-modal-description').fill('Gather all functional requirements.');
    await page.locator('[data-action="save-card-modal"]').click();
    await expect(page.locator('#card-modal')).toBeHidden();
    await todoColumn.locator('.card-title', { hasText: 'Write requirements' }).click();
    await expect(page.locator('#card-modal-description')).toHaveValue('Gather all functional requirements.');

    // Cancel discards unsaved edits.
    await page.locator('#card-modal-description').fill('This should not be saved');
    await page.locator('[data-action="close-card-modal"]').filter({ hasText: 'Cancel' }).click();
    await todoColumn.locator('.card-title', { hasText: 'Write requirements' }).click();
    await expect(page.locator('#card-modal-description')).toHaveValue('Gather all functional requirements.');
    await page.locator('.card-modal-close').click();

    // Delete a card (confirm).
    page.once('dialog', (dialog) => dialog.accept());
    await todoColumn.locator('.card-row', { hasText: 'Design schema' }).locator('[data-action="delete-card"]').click();
    await expect(todoColumn.locator('.card-row', { hasText: 'Design schema' })).toHaveCount(0);

    // Delete a list (confirm), cascades its remaining card.
    page.once('dialog', (dialog) => dialog.accept());
    await page.locator('.list-column', { hasText: 'To Do' }).locator('[data-action="delete-list"]').click();
    await expect(page.locator('.list-column', { hasText: 'To Do' })).toHaveCount(0);
    await expect(page.locator('.list-column', { hasText: 'Doing' })).toBeVisible();
  });

  test('data persists across reload (board, list, card)', async ({ page }) => {
    const boardTitle = `Persisted ${Date.now()}`;
    await createBoard(page, boardTitle);
    await openBoard(page, boardTitle);
    await createList(page, 'Backlog');
    await createCard(page, 'Backlog', 'Persisted card');

    await page.reload();
    await expect(page.locator('#boards-view')).toBeVisible();
    await openBoard(page, boardTitle);
    await expect(page.locator('.list-column', { hasText: 'Backlog' })).toBeVisible();
    await expect(page.locator('.card-row', { hasText: 'Persisted card' })).toBeVisible();
  });
});

test.describe('Card drag-and-drop journey', () => {
  test('reorder a card within a list via drag-and-drop', async ({ page }) => {
    const boardTitle = `DnD Reorder ${Date.now()}`;
    await createBoard(page, boardTitle);
    await openBoard(page, boardTitle);
    await createList(page, 'To Do');
    await createCard(page, 'To Do', 'First');
    await createCard(page, 'To Do', 'Second');

    const list = page.locator('.list-column', { hasText: 'To Do' });
    const first = list.locator('.card-row', { hasText: 'First' });
    const second = list.locator('.card-row', { hasText: 'Second' });

    // Drag "Second" above "First".
    await second.dragTo(first);

    const titles = await list.locator('.card-title').allTextContents();
    expect(titles[0]).toBe('Second');
    expect(titles[1]).toBe('First');
  });

  test('move a card between lists via drag-and-drop', async ({ page }) => {
    const boardTitle = `DnD Move ${Date.now()}`;
    await createBoard(page, boardTitle);
    await openBoard(page, boardTitle);
    await createList(page, 'To Do');
    await createList(page, 'Done');
    await createCard(page, 'To Do', 'Task to move');

    const todo = page.locator('.list-column', { hasText: 'To Do' });
    const done = page.locator('.list-column', { hasText: 'Done' });
    const card = todo.locator('.card-row', { hasText: 'Task to move' });

    await card.dragTo(done.locator('.cards-list'));

    await expect(todo.locator('.card-row', { hasText: 'Task to move' })).toHaveCount(0);
    await expect(done.locator('.card-row', { hasText: 'Task to move' })).toBeVisible();
  });

  test('reorder lists within a board via drag-and-drop (FR6)', async ({ page }) => {
    const boardTitle = `DnD List Reorder ${Date.now()}`;
    await createBoard(page, boardTitle);
    await openBoard(page, boardTitle);
    await createList(page, 'To Do');
    await createList(page, 'Doing');
    await createList(page, 'Done');

    const container = page.locator('#lists-container');
    const doing = container.locator('.list-header', { hasText: 'Doing' });
    const todo = container.locator('.list-header', { hasText: 'To Do' });

    // Drag "Doing" before "To Do". Native HTML5 DnD needs real intermediate
    // mousemoves to fire dragover on the target (locator.dragTo()'s single
    // jump is unreliable for this narrow-column case), so drive it manually.
    const doingBox = await doing.boundingBox();
    const todoBox = await todo.boundingBox();
    await page.mouse.move(doingBox.x + doingBox.width / 2, doingBox.y + doingBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(doingBox.x + doingBox.width / 2 - 20, doingBox.y, { steps: 5 });
    await page.mouse.move(todoBox.x + 10, todoBox.y + todoBox.height / 2, { steps: 10 });
    await page.mouse.move(todoBox.x + 5, todoBox.y + todoBox.height / 2, { steps: 5 });
    await page.mouse.up();

    const titles = await container.locator('.list-column .list-title').allTextContents();
    expect(titles[0]).toBe('Doing');
    expect(titles[1]).toBe('To Do');
    expect(titles[2]).toBe('Done');
  });

  test('reorder boards on the overview page via drag-and-drop (FR9)', async ({ page }) => {
    const t = Date.now();
    await createBoard(page, `A ${t}`);
    await createBoard(page, `B ${t}`);
    await createBoard(page, `C ${t}`);

    const boardsList = page.locator('#boards-list');
    const rowB = boardsList.locator('.board-row', { hasText: `B ${t}` });
    const rowA = boardsList.locator('.board-row', { hasText: `A ${t}` });

    await rowB.dragTo(rowA);

    const titles = await boardsList.locator('.board-title').allTextContents();
    expect(titles[0]).toContain(`B ${t}`);
    expect(titles[1]).toContain(`A ${t}`);
  });

  test('FR6a: click-based "Move to..." fallback moves a card without drag-and-drop', async ({ page }) => {
    const boardTitle = `Move Fallback ${Date.now()}`;
    await createBoard(page, boardTitle);
    await openBoard(page, boardTitle);
    await createList(page, 'To Do');
    await createList(page, 'Done');
    await createCard(page, 'To Do', 'Move me via select');

    const todo = page.locator('.list-column', { hasText: 'To Do' });
    const done = page.locator('.list-column', { hasText: 'Done' });
    const card = todo.locator('.card-row', { hasText: 'Move me via select' });

    const select = card.locator('[data-action="move-card-select"]');
    await select.focus();
    const doneOptionText = await select.locator('option', { hasText: 'Done' }).first().textContent();
    await select.selectOption({ label: doneOptionText });

    await expect(todo.locator('.card-row', { hasText: 'Move me via select' })).toHaveCount(0);
    await expect(done.locator('.card-row', { hasText: 'Move me via select' })).toBeVisible();
  });
});
