// ============================================================
// Suveera's Magic Maths — shared player-state shape
// Used by the server (source of truth) and the browser (cache).
// ============================================================

import { TOPICS, BATCH_SIZE } from './content.js';

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

export function newState(name) {
  const topics = {};
  TOPICS.forEach((t, i) => { topics[t.id] = freshTopic(i === 0); });
  return { name, totalCrowns: 0, totalScore: 0, topics, mental: { tricks: {} }, sound: true };
}

// Make sure a loaded state has every topic/level (for returning
// players after new topics are added). Mutates and returns it.
export function ensureShape(state, name) {
  if (!state || typeof state !== 'object') return newState(name || 'Suveera');
  if (!state.name) state.name = name || 'Suveera';
  if (typeof state.totalCrowns !== 'number') state.totalCrowns = 0;
  if (typeof state.totalScore !== 'number') state.totalScore = 0;
  if (state.sound === undefined) state.sound = true;
  if (!state.mental || typeof state.mental !== 'object') state.mental = { tricks: {} };
  if (!state.mental.tricks) state.mental.tricks = {};
  if (!state.topics) state.topics = {};
  TOPICS.forEach((t, i) => {
    if (!state.topics[t.id]) state.topics[t.id] = freshTopic(i === 0);
    const ts = state.topics[t.id];
    if (!ts.levels) ts.levels = {};
    ['basic', 'intermediate', 'advanced'].forEach((lv) => {
      if (!ts.levels[lv]) ts.levels[lv] = freshLevel();
    });
  });
  return state;
}
