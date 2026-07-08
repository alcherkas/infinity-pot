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

// Stub board view (full lists/cards rendering arrives in task-005/task-006).
export function renderBoardView(state, boardId) {
  const boardView = document.getElementById('board-view');
  const titleEl = document.getElementById('board-view-title');
  if (!boardView || !titleEl) return;

  const board = state.boards.find((b) => b.id === boardId);
  titleEl.textContent = board ? board.title : '';
}
