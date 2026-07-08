// DOM rendering: pure "state in, DOM out". No business logic.
// See 02-design/api.md and 02-design/architecture.md.

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// NFR7: show/hide the non-blocking persistence-save-failure warning banner.
// Never auto-hidden on a successful save — only hidden when the user
// dismisses it (see events.js) or the app is reloaded.
export function showSaveWarning() {
  const banner = document.getElementById('save-warning-banner');
  if (banner) banner.hidden = false;
}

export function hideSaveWarning() {
  const banner = document.getElementById('save-warning-banner');
  if (banner) banner.hidden = true;
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
      <li class="board-row" draggable="true" data-board-id="${board.id}">
        <span class="board-title" data-action="open-board" data-board-id="${board.id}">${escapeHtml(board.title)}</span>
        <button type="button" data-action="rename-board" data-board-id="${board.id}">Rename</button>
        <button type="button" data-action="delete-board" data-board-id="${board.id}">Delete</button>
      </li>`
    )
    .join('');
}

// FR6a: build the "Move to..." <select> options for a card — every list on the
// board, with every valid target position within that list. Values are
// encoded as "toListId::toIndex" so events.js can parse and call
// store.reorderCard(cardId, toListId, toIndex) — the same fn DnD uses.
// Exported (not inlined at render time) so events.js can populate a card's
// options lazily, on open, rather than baking every other list's title into
// every card's DOM up front — that would make list titles appear as text
// inside every unrelated card row and break `hasText`-based lookups in tests.
export function renderMoveToOptions(boardLists, card) {
  return boardLists
    .map((list) => {
      // Same list: as many valid target slots as existing cards (moving within).
      // Different list: one extra slot at the end (inserting a new card).
      const positions = list.id === card.listId ? list.cardCount : list.cardCount + 1;
      const opts = [];
      for (let i = 0; i < positions; i += 1) {
        const isCurrent = list.id === card.listId && list.cards[i] && list.cards[i].id === card.id;
        if (isCurrent) continue;
        opts.push(
          `<option value="${list.id}::${i}">${escapeHtml(list.title)} — position ${i + 1}</option>`
        );
      }
      return opts.join('');
    })
    .join('');
}

// Compute the board's lists (each with its sorted cards + count) for a given
// listId, used to lazily build "Move to..." options on demand.
export function computeBoardLists(state, boardId) {
  const lists = state.lists.filter((l) => l.boardId === boardId).sort((a, b) => a.order - b.order);
  return lists.map((list) => {
    const listCards = state.cards.filter((c) => c.listId === list.id).sort((a, b) => a.order - b.order);
    return { id: list.id, title: list.title, cards: listCards, cardCount: listCards.length };
  });
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
        <select class="move-card-select" data-action="move-card-select" data-card-id="${card.id}" aria-label="Move card">
          <option value="" selected disabled>Move to...</option>
        </select>
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
        <div class="list-header" draggable="true" data-list-id="${list.id}">
          <span class="list-title" data-action="rename-list" data-list-id="${list.id}">${escapeHtml(list.title)}</span>
          <button type="button" data-action="delete-list" data-list-id="${list.id}">Delete</button>
        </div>
        ${renderCards(state, list.id)}
      </div>`
    )
    .join('');
}
