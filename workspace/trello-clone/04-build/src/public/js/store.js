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

function findList(listId) {
  const list = state.lists.find((l) => l.id === listId);
  if (!list) throw new Error('list not found');
  return list;
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
  findBoard(boardId);
  // Cascade: remove lists belonging to this board, and cards belonging to those lists.
  const listIds = state.lists.filter((l) => l.boardId === boardId).map((l) => l.id);
  state.boards = state.boards.filter((b) => b.id !== boardId);
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

export function createList(boardId, title) {
  findBoard(boardId);
  const trimmed = requireTitle(title);
  const listsInBoard = state.lists.filter((l) => l.boardId === boardId);
  const list = {
    id: crypto.randomUUID(),
    boardId,
    title: trimmed,
    order: listsInBoard.length,
  };
  state.lists.push(list);
  persist();
  return list;
}

export function renameList(listId, title) {
  const list = findList(listId);
  const trimmed = requireTitle(title);
  list.title = trimmed;
  persist();
  return list;
}

export function deleteList(listId) {
  findList(listId);
  state.lists = state.lists.filter((l) => l.id !== listId);
  state.cards = state.cards.filter((c) => c.listId !== listId);
  persist();
}

function findCard(cardId) {
  const card = state.cards.find((c) => c.id === cardId);
  if (!card) throw new Error('card not found');
  return card;
}

export function createCard(listId, title) {
  findList(listId);
  const trimmed = requireTitle(title);
  const cardsInList = state.cards.filter((c) => c.listId === listId);
  const card = {
    id: crypto.randomUUID(),
    listId,
    title: trimmed,
    order: cardsInList.length,
    createdAt: new Date().toISOString(),
  };
  state.cards.push(card);
  persist();
  return card;
}

export function renameCard(cardId, title) {
  const card = findCard(cardId);
  const trimmed = requireTitle(title);
  card.title = trimmed;
  persist();
  return card;
}

export function deleteCard(cardId) {
  findCard(cardId);
  state.cards = state.cards.filter((c) => c.id !== cardId);
  persist();
}

export function reorderLists(boardId, listId, toIndex) {
  findList(listId);
  const ordered = state.lists.filter((l) => l.boardId === boardId).sort((a, b) => a.order - b.order);
  const fromIndex = ordered.findIndex((l) => l.id === listId);
  if (fromIndex === -1) throw new Error('list not found');
  const clamped = Math.max(0, Math.min(toIndex, ordered.length - 1));
  const [moved] = ordered.splice(fromIndex, 1);
  ordered.splice(clamped, 0, moved);
  ordered.forEach((l, i) => {
    l.order = i;
  });
  persist();
}
