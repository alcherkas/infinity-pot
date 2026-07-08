// Persistence layer: versioned localStorage load/save.
// See 02-design/api.md#storagejs---persistence.

const KEY = 'trello-clone:v1';
const VERSION = 1;

function emptyState() {
  return { boards: [], lists: [], cards: [] };
}

export function load() {
  let raw;
  try {
    raw = localStorage.getItem(KEY);
  } catch (err) {
    console.warn('storage.load: localStorage unavailable', err);
    return emptyState();
  }

  if (!raw) return emptyState();

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    console.warn('storage.load: corrupt JSON, resetting', err);
    return emptyState();
  }

  if (!parsed || parsed.version !== VERSION) {
    console.warn('storage.load: missing/unsupported version, resetting');
    return emptyState();
  }

  return {
    boards: Array.isArray(parsed.boards) ? parsed.boards : [],
    lists: Array.isArray(parsed.lists) ? parsed.lists : [],
    cards: Array.isArray(parsed.cards) ? parsed.cards : [],
  };
}

export function save(state) {
  try {
    const payload = JSON.stringify({
      version: VERSION,
      boards: state.boards || [],
      lists: state.lists || [],
      cards: state.cards || [],
    });
    localStorage.setItem(KEY, payload);
  } catch (err) {
    console.warn('storage.save: failed to persist state', err);
  }
}
