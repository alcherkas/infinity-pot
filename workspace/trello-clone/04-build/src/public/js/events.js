// Event wiring: attaches click/submit handlers, calls into store.js, then re-renders.
// See 02-design/api.md and 02-design/architecture.md.

import * as store from './store.js';
import * as render from './render.js';

// Simple re-render-on-every-mutation strategy (per architecture.md).
function rerenderBoards() {
  render.renderBoardsView(store.getState());
}

function showBoardsView() {
  document.getElementById('boards-view').hidden = false;
  document.getElementById('board-view').hidden = true;
}

function showBoardView(boardId) {
  document.getElementById('boards-view').hidden = true;
  document.getElementById('board-view').hidden = false;
  render.renderBoardView(store.getState(), boardId);
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
      // No confirm dialog yet — that's task-011.
      store.deleteBoard(boardId);
      rerenderBoards();
      return;
    }
  });

  backButton.addEventListener('click', () => {
    showBoardsView();
  });
}
