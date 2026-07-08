// Entry point. Boots the app.
// task-002: wires up storage.js to load persisted state on boot.
// task-003: initializes store.js with the persisted state.
// Future tasks will wire render.js/events.js on top of this.

import * as storage from './storage.js';
import * as store from './store.js';

function init() {
  const boardsView = document.getElementById('boards-view');
  if (!boardsView) return;

  store.init(storage.load());
  const state = store.getState();

  if (state.boards.length === 0) {
    boardsView.innerHTML = '<p class="empty-state">No boards yet</p>';
  } else {
    boardsView.innerHTML = `<p class="empty-state">${state.boards.length} board(s) loaded</p>`;
  }
}

init();
