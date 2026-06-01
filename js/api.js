// ============================================================
// Suveera's Magic Maths — client API layer
// Talks to the Node backend, but gracefully falls back to
// running everything locally if the server can't be reached.
// ============================================================

import { TOPICS, POINTS, CROWNS, BATCH_SIZE } from './content.js';
import { generateQuestion } from './generators.js';
import { newState, ensureShape } from './state.js';
import { cacheGet, cacheSet } from './storage.js';

export let online = true; // best-effort flag for the UI

async function tryFetch(url, opts, ms = 6000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const r = await fetch(url, { ...opts, signal: ctrl.signal });
    clearTimeout(t);
    if (!r.ok) throw new Error('HTTP ' + r.status);
    online = true;
    return r;
  } catch (e) {
    clearTimeout(t);
    online = false;
    throw e;
  }
}

// ---- Content (topics, guides, config) ----
export async function getContent() {
  try {
    const r = await tryFetch('/api/content');
    return await r.json();
  } catch {
    return { topics: TOPICS, points: POINTS, crowns: CROWNS, batchSize: BATCH_SIZE };
  }
}

// ---- Player progress (cross-device when online) ----
export async function loadPlayer(name) {
  try {
    const r = await tryFetch('/api/player/' + encodeURIComponent(name));
    const state = ensureShape(await r.json(), name);
    cacheSet(state);
    return state;
  } catch {
    const cached = cacheGet();
    const state = cached && cached.name && cached.name.toLowerCase() === name.toLowerCase()
      ? ensureShape(cached, name) : newState(name);
    cacheSet(state);
    return state;
  }
}

let saveTimer = null;
export function savePlayer(state) {
  cacheSet(state); // always keep the local mirror up to date
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    tryFetch('/api/player/' + encodeURIComponent(state.name), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state),
    }).catch(() => { /* offline — the cache already has it */ });
  }, 400);
}

// ---- Questions ----
export async function getQuestion(topic, difficulty, level) {
  try {
    const r = await tryFetch(`/api/question?topic=${encodeURIComponent(topic)}&difficulty=${difficulty}&level=${level}`);
    return await r.json();
  } catch {
    return generateQuestion(topic, difficulty, level);
  }
}
