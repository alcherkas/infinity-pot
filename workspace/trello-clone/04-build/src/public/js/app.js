// Entry point. Boots the app.
// task-002: wires up storage.js to load persisted state on boot.
// Future tasks will wire store.js/render.js/events.js on top of this.

import * as storage from './storage.js';

function init() {
  const boardsView = document.getElementById('boards-view');
  if (!boardsView) return;

  const state = storage.load();

  if (state.boards.length === 0) {
    boardsView.innerHTML = '<p class="empty-state">No boards yet</p>';
  } else {
    boardsView.innerHTML = `<p class="empty-state">${state.boards.length} board(s) loaded</p>`;
  }
}

init();
