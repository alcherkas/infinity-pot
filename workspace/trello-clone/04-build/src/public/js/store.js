// In-memory state + mutations, write-through persisted via storage.js.
// See 02-design/api.md#storejs---state--mutations.

import * as storage from './storage.js';

let state = { boards: [], lists: [], cards: [] };

export function init(initialState) {
  state = {
    boards: (initialState && initialState.boards) || [],
    lists: (initialState && initialState.lists) || [],
    cards: (initialState && initialState.cards) || [],
  };
}

export function getState() {
  return state;
}

function persist() {
  storage.save(state);
}

function requireTitle(title) {
  const trimmed = (title || '').trim();
  if (!trimmed) throw new Error('title required');
  return trimmed;
}

function findBoard(boardId) {
  const board = state.boards.find((b) => b.id === boardId);
  if (!board) throw new Error('board not found');
  return board;
}

export function createBoard(title) {
  const trimmed = requireTitle(title);
  const board = {
    id: crypto.randomUUID(),
    title: trimmed,
    order: state.boards.length,
    createdAt: new Date().toISOString(),
  };
  state.boards.push(board);
  persist();
  return board;
}

export function renameBoard(boardId, title) {
  const board = findBoard(boardId);
  const trimmed = requireTitle(title);
  board.title = trimmed;
  persist();
  return board;
}

export function deleteBoard(boardId) {
  const board = findBoard(boardId);
  state.boards = state.boards.filter((b) => b.id !== boardId);
  // Cascade: remove lists belonging to this board, and cards belonging to those lists.
  // No-op stub until task-005/006 add lists/cards, but logic is correct now.
  const listIds = state.lists.filter((l) => l.boardId === boardId).map((l) => l.id);
  state.lists = state.lists.filter((l) => l.boardId !== boardId);
  state.cards = state.cards.filter((c) => !listIds.includes(c.listId));
  persist();
}

export function reorderBoards(boardId, toIndex) {
  findBoard(boardId);
  const ordered = [...state.boards].sort((a, b) => a.order - b.order);
  const fromIndex = ordered.findIndex((b) => b.id === boardId);
  const clamped = Math.max(0, Math.min(toIndex, ordered.length - 1));
  const [moved] = ordered.splice(fromIndex, 1);
  ordered.splice(clamped, 0, moved);
  ordered.forEach((b, i) => {
    b.order = i;
  });
  persist();
}
