// Event wiring: attaches click/submit handlers, calls into store.js, then re-renders.
// See 02-design/api.md and 02-design/architecture.md.

import * as store from './store.js';
import * as render from './render.js';

// Simple re-render-on-every-mutation strategy (per architecture.md).
let currentBoardId = null;

function rerenderBoards() {
  render.renderBoardsView(store.getState());
}

function rerenderBoard() {
  if (!currentBoardId) return;
  render.renderBoardView(store.getState(), currentBoardId);
}

function showBoardsView() {
  currentBoardId = null;
  document.getElementById('boards-view').hidden = false;
  document.getElementById('board-view').hidden = true;
}

function showBoardView(boardId) {
  currentBoardId = boardId;
  document.getElementById('boards-view').hidden = true;
  document.getElementById('board-view').hidden = false;
  render.renderBoardView(store.getState(), boardId);
}

// FR8: card detail modal — clicking a card opens it; close/cancel discards
// unsaved edits (developer's call per task-007), Save persists title + description.
function openCardModal(cardId) {
  const state = store.getState();
  const card = state.cards.find((c) => c.id === cardId);
  if (!card) return;
  render.renderCardModal(card);
}

function closeCardModal() {
  render.hideCardModal();
}

function saveCardModal(cardId) {
  const modal = document.getElementById('card-modal');
  const titleInput = modal.querySelector('#card-modal-title');
  const descriptionInput = modal.querySelector('#card-modal-description');
  try {
    store.renameCard(cardId, titleInput ? titleInput.value : '');
    store.updateCardDescription(cardId, descriptionInput ? descriptionInput.value : '');
  } catch (err) {
    console.warn('saveCardModal failed', err);
    return;
  }
  closeCardModal();
  rerenderBoard();
}

// FR4/FR5: native HTML5 drag-and-drop for card reordering/moving.
let draggedCardId = null;

function computeDropIndex(cardsListEl, clientY) {
  const rows = [...cardsListEl.querySelectorAll('.card-row')];
  for (let i = 0; i < rows.length; i += 1) {
    const rect = rows[i].getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    if (clientY < midpoint) return i;
  }
  return rows.length;
}

function wireCardDragAndDrop(listsContainer) {
  listsContainer.addEventListener('dragstart', (event) => {
    const cardRow = event.target.closest('.card-row');
    if (!cardRow) return;
    draggedCardId = cardRow.dataset.cardId;
    event.dataTransfer.effectAllowed = 'move';
    try {
      event.dataTransfer.setData('text/plain', draggedCardId);
    } catch (err) {
      // Some browsers restrict setData in certain contexts; draggedCardId fallback still works.
    }
  });

  listsContainer.addEventListener('dragend', () => {
    draggedCardId = null;
    listsContainer.querySelectorAll('.cards-list.drag-over').forEach((el) => el.classList.remove('drag-over'));
  });

  listsContainer.addEventListener('dragover', (event) => {
    const cardsList = event.target.closest('.cards-list');
    if (!cardsList || !draggedCardId) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    listsContainer.querySelectorAll('.cards-list.drag-over').forEach((el) => {
      if (el !== cardsList) el.classList.remove('drag-over');
    });
    cardsList.classList.add('drag-over');
  });

  listsContainer.addEventListener('drop', (event) => {
    const cardsList = event.target.closest('.cards-list');
    if (!cardsList || !draggedCardId) return;
    event.preventDefault();
    cardsList.classList.remove('drag-over');
    const toListId = cardsList.dataset.listId;
    const toIndex = computeDropIndex(cardsList, event.clientY);
    const cardId = draggedCardId;
    draggedCardId = null;
    try {
      store.reorderCard(cardId, toListId, toIndex);
    } catch (err) {
      console.warn('reorderCard failed', err);
      return;
    }
    rerenderBoard();
  });
}

export function init() {
  const createForm = document.getElementById('create-board-form');
  const createInput = document.getElementById('create-board-input');
  const boardsList = document.getElementById('boards-list');
  const backButton = document.getElementById('back-to-boards');

  createForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const title = createInput.value;
    try {
      store.createBoard(title);
    } catch (err) {
      console.warn('createBoard failed', err);
      return;
    }
    createInput.value = '';
    rerenderBoards();
  });

  boardsList.addEventListener('click', (event) => {
    const target = event.target.closest('[data-action]');
    if (!target) return;
    const { action, boardId } = target.dataset;

    if (action === 'open-board') {
      showBoardView(boardId);
      return;
    }

    if (action === 'rename-board') {
      const state = store.getState();
      const board = state.boards.find((b) => b.id === boardId);
      const nextTitle = window.prompt('Rename board', board ? board.title : '');
      if (nextTitle === null) return;
      try {
        store.renameBoard(boardId, nextTitle);
      } catch (err) {
        console.warn('renameBoard failed', err);
        return;
      }
      rerenderBoards();
      return;
    }

    if (action === 'delete-board') {
      const state = store.getState();
      const board = state.boards.find((b) => b.id === boardId);
      const label = board ? board.title : 'this board';
      if (!window.confirm(`Delete "${label}" and all its lists and cards?`)) return;
      store.deleteBoard(boardId);
      rerenderBoards();
      return;
    }
  });

  backButton.addEventListener('click', () => {
    showBoardsView();
  });

  const createListForm = document.getElementById('create-list-form');
  const createListInput = document.getElementById('create-list-input');
  const listsContainer = document.getElementById('lists-container');

  createListForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!currentBoardId) return;
    const title = createListInput.value;
    try {
      store.createList(currentBoardId, title);
    } catch (err) {
      console.warn('createList failed', err);
      return;
    }
    createListInput.value = '';
    rerenderBoard();
  });

  wireCardDragAndDrop(listsContainer);

  listsContainer.addEventListener('click', (event) => {
    const target = event.target.closest('[data-action]');
    if (!target) return;
    const { action, listId } = target.dataset;

    if (action === 'rename-list') {
      const state = store.getState();
      const list = state.lists.find((l) => l.id === listId);
      const nextTitle = window.prompt('Rename list', list ? list.title : '');
      if (nextTitle === null) return;
      try {
        store.renameList(listId, nextTitle);
      } catch (err) {
        console.warn('renameList failed', err);
        return;
      }
      rerenderBoard();
      return;
    }

    if (action === 'delete-list') {
      const state = store.getState();
      const list = state.lists.find((l) => l.id === listId);
      const label = list ? list.title : 'this list';
      if (!window.confirm(`Delete "${label}" and all its cards?`)) return;
      store.deleteList(listId);
      rerenderBoard();
      return;
    }

    if (action === 'open-card') {
      const { cardId } = target.dataset;
      openCardModal(cardId);
      return;
    }

    if (action === 'delete-card') {
      const { cardId } = target.dataset;
      const state = store.getState();
      const card = state.cards.find((c) => c.id === cardId);
      const label = card ? card.title : 'this card';
      if (!window.confirm(`Delete "${label}"?`)) return;
      store.deleteCard(cardId);
      rerenderBoard();
      return;
    }
  });

  listsContainer.addEventListener('submit', (event) => {
    const form = event.target.closest('[data-action="create-card-form"]');
    if (!form) return;
    event.preventDefault();
    const { listId } = form.dataset;
    const input = form.querySelector('input[name="card-title"]');
    const title = input ? input.value : '';
    try {
      store.createCard(listId, title);
    } catch (err) {
      console.warn('createCard failed', err);
      return;
    }
    if (input) input.value = '';
    rerenderBoard();
  });

  const cardModal = document.getElementById('card-modal');
  cardModal.addEventListener('click', (event) => {
    const target = event.target.closest('[data-action]');
    if (!target) return;
    const { action, cardId } = target.dataset;

    if (action === 'close-card-modal') {
      closeCardModal();
      return;
    }

    if (action === 'save-card-modal') {
      saveCardModal(cardId);
      return;
    }
  });
}
