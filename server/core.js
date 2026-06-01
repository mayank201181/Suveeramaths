// ============================================================
// Suveera's Magic Maths — shared request logic
// Used by BOTH the local Node server (server.js) and the
// Vercel serverless functions (api/*.js), so there is one
// source of truth for the API behaviour.
// ============================================================

import { TOPICS, POINTS, CROWNS, BATCH_SIZE } from '../js/content.js';
import { generateQuestion } from '../js/generators.js';
import { newState, ensureShape } from '../js/state.js';
import { getPlayer, setPlayer } from './store.js';

export const keyFor = (name) => String(name || '').trim().toLowerCase().slice(0, 40) || 'suveera';

export function buildContent() {
  return { topics: TOPICS, points: POINTS, crowns: CROWNS, batchSize: BATCH_SIZE };
}

export function buildQuestion({ topic, difficulty, level } = {}) {
  return generateQuestion(topic, difficulty || 'basic', parseInt(level || '1', 10) || 1);
}

export async function loadPlayer(name) {
  const key = keyFor(name);
  let state = await getPlayer(key);
  if (!state) { state = newState(name); await setPlayer(key, state); }
  else state = ensureShape(state, name);
  return state;
}

export async function savePlayer(name, body) {
  if (!body || typeof body !== 'object') return { error: 'bad body' };
  const state = ensureShape(body, name);
  await setPlayer(keyFor(name), state);
  return { ok: true };
}
