// DOM rendering: pure "state in, DOM out". No business logic.
// See 02-design/api.md and 02-design/architecture.md.

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// FR1, FR9, FR10: render the boards overview list (or empty state).
export function renderBoardsView(state) {
  const list = document.getElementById('boards-list');
  if (!list) return;

  const boards = [...state.boards].sort((a, b) => a.order - b.order);

  if (boards.length === 0) {
    list.innerHTML = '<li class="empty-state">No boards yet — create one</li>';
    return;
  }

  list.innerHTML = boards
    .map(
      (board) => `
      <li class="board-row" data-board-id="${board.id}">
        <span class="board-title" data-action="open-board" data-board-id="${board.id}">${escapeHtml(board.title)}</span>
        <button type="button" data-action="rename-board" data-board-id="${board.id}">Rename</button>
        <button type="button" data-action="delete-board" data-board-id="${board.id}">Delete</button>
      </li>`
    )
    .join('');
}

// FR3, FR10: render a list's cards (or empty state with create-card affordance).
function renderCards(state, listId) {
  const cards = state.cards.filter((c) => c.listId === listId).sort((a, b) => a.order - b.order);

  const cardsHtml =
    cards.length === 0
      ? '<li class="empty-state">No cards yet</li>'
      : cards
          .map(
            (card) => `
      <li class="card-row" draggable="true" data-card-id="${card.id}">
        <span class="card-title" data-action="open-card" data-card-id="${card.id}">${escapeHtml(card.title)}</span>
        <button type="button" data-action="delete-card" data-card-id="${card.id}">Delete</button>
      </li>`
          )
          .join('');

  return `
    <ul class="cards-list" data-list-id="${listId}">${cardsHtml}</ul>
    <form class="create-card-form" data-action="create-card-form" data-list-id="${listId}">
      <input type="text" name="card-title" placeholder="Add a card" data-list-id="${listId}" />
      <button type="submit">Add card</button>
    </form>`;
}

// FR8: populate and show the card detail modal for the given card.
export function renderCardModal(card) {
  const modal = document.getElementById('card-modal');
  if (!modal) return;

  modal.innerHTML = `
    <div class="card-modal-overlay" data-action="close-card-modal"></div>
    <div class="card-modal-content">
      <button type="button" class="card-modal-close" data-action="close-card-modal" aria-label="Close">&times;</button>
      <label for="card-modal-title">Title</label>
      <input id="card-modal-title" type="text" value="${escapeHtml(card.title)}" data-card-id="${card.id}" />
      <label for="card-modal-description">Description</label>
      <textarea id="card-modal-description" rows="6" data-card-id="${card.id}">${escapeHtml(card.description || '')}</textarea>
      <div class="card-modal-actions">
        <button type="button" data-action="save-card-modal" data-card-id="${card.id}">Save</button>
        <button type="button" data-action="close-card-modal">Cancel</button>
      </div>
    </div>`;
  modal.hidden = false;
}

// Hide the card detail modal and clear its contents.
export function hideCardModal() {
  const modal = document.getElementById('card-modal');
  if (!modal) return;
  modal.hidden = true;
  modal.innerHTML = '';
}

// FR2, FR6, FR3, FR10: render a board's lists with their cards.
export function renderBoardView(state, boardId) {
  const boardView = document.getElementById('board-view');
  const titleEl = document.getElementById('board-view-title');
  const listsEl = document.getElementById('lists-container');
  if (!boardView || !titleEl || !listsEl) return;

  const board = state.boards.find((b) => b.id === boardId);
  titleEl.textContent = board ? board.title : '';

  const lists = state.lists.filter((l) => l.boardId === boardId).sort((a, b) => a.order - b.order);

  if (lists.length === 0) {
    listsEl.innerHTML = '<p class="empty-state">No lists yet — create one</p>';
    return;
  }

  listsEl.innerHTML = lists
    .map(
      (list) => `
      <div class="list-column" data-list-id="${list.id}">
        <div class="list-header">
          <span class="list-title" data-action="rename-list" data-list-id="${list.id}">${escapeHtml(list.title)}</span>
          <button type="button" data-action="delete-list" data-list-id="${list.id}">Delete</button>
        </div>
        ${renderCards(state, list.id)}
      </div>`
    )
    .join('');
}
