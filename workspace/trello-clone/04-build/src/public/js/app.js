// Entry point. Boots the app.
// task-002: wires up storage.js to load persisted state on boot.
// task-003: initializes store.js with the persisted state.
// task-004: wires events.js listeners and renders the boards overview via render.js.

import * as storage from './storage.js';
import * as store from './store.js';
import * as render from './render.js';
import * as events from './events.js';

function init() {
  const boardsView = document.getElementById('boards-view');
  if (!boardsView) return;

  store.init(storage.load());
  render.renderBoardsView(store.getState());
  events.init();
}

init();
