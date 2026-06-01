// ============================================================
// Suveera's Magic Maths — shared player-state shape
// Used by the server (source of truth) and the browser (cache).
// ============================================================

import { TOPICS, BATCH_SIZE } from './content.js';
import { VEDIC } from './vedic.js';

export function freshLevel() {
  // added      = how many questions are in the pool (grows by BATCH_SIZE)
  // done       = how many attempted, correct = how many right
  // batchLevel = difficulty multiplier for the current pool
  return { added: BATCH_SIZE, done: 0, correct: 0, batchLevel: 1 };
}

export function freshTopic(unlocked) {
  return {
    unlocked,
    crowns: 0,
    score: 0,
    levels: { basic: freshLevel(), intermediate: freshLevel(), advanced: freshLevel() },
  };
}

// Build a {id: freshTopic} map for a list of items, first one unlocked.
function freshSection(items) {
  const out = {};
  items.forEach((t, i) => { out[t.id] = freshTopic(i === 0); });
  return out;
}

export function newState(name) {
  return {
    name,
    totalCrowns: 0,
    totalScore: 0,
    topics: freshSection(TOPICS),
    vedic: freshSection(VEDIC),
    sound: true,
  };
}

// Ensure one section map has every item and every level (so returning
// players keep working after new content is added). Mutates `map`.
function ensureSection(map, items) {
  items.forEach((t, i) => {
    if (!map[t.id]) map[t.id] = freshTopic(i === 0);
    const ts = map[t.id];
    if (typeof ts.crowns !== 'number') ts.crowns = 0;
    if (typeof ts.score !== 'number') ts.score = 0;
    if (typeof ts.unlocked !== 'boolean') ts.unlocked = i === 0;
    if (!ts.levels) ts.levels = {};
    ['basic', 'intermediate', 'advanced'].forEach((lv) => {
      if (!ts.levels[lv]) ts.levels[lv] = freshLevel();
    });
  });
}

// Make sure a loaded state has every section/item/level. Mutates & returns it.
export function ensureShape(state, name) {
  if (!state || typeof state !== 'object') return newState(name || 'Suveera');
  if (!state.name) state.name = name || 'Suveera';
  if (typeof state.totalCrowns !== 'number') state.totalCrowns = 0;
  if (typeof state.totalScore !== 'number') state.totalScore = 0;
  if (state.sound === undefined) state.sound = true;
  if (!state.topics) state.topics = {};
  if (!state.vedic) state.vedic = {};
  ensureSection(state.topics, TOPICS);
  ensureSection(state.vedic, VEDIC);
  delete state.mental; // superseded by the richer `vedic` section
  return state;
}
