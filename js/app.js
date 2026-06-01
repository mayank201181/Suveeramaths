// ============================================================
// Suveera's Magic Maths — main app controller
// ------------------------------------------------------------
// Two sections share ONE quiz engine:
//   • 'vedic'  — Vedic / mental-maths techniques (default tab)
//   • 'topics' — the Maths Adventures topics
// Both have guides+diagrams, 3 levels, +25 expandable batches,
// crowns/score, and progressive unlocking. New techniques/topics
// can be added in content.js / vedic.js and appear automatically.
// ============================================================

import * as API from './api.js';
import { cacheGet, cacheClear, lastName } from './storage.js';
import { VEDIC, VEDIC_BY_ID, generateVedic } from './vedic.js';

const app = document.getElementById('app');
const confettiLayer = document.getElementById('confetti-layer');

let content = null;          // { topics, points, crowns, batchSize }
let TOPIC_BY_ID = {};
let state = null;            // player progress
let session = null;          // transient quiz session
let currentSection = 'vedic';// 'vedic' (default landing) or 'topics'

const POINTS = () => content.points;
const CROWNS = () => content.crowns;
const BATCH = () => content.batchSize;

// ---------- tiny dom helpers ----------
const el = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const md = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
const save = () => API.savePlayer(state);

// ============================================================
//  SECTIONS — the generic engine is driven by this descriptor
// ============================================================
const SECTIONS = {
  vedic: {
    title: '🕉️ Vedic Maths',
    subtitle: 'Learn clever short-cuts, then practise! ✨',
    items: () => VEDIC,
    byId: (id) => VEDIC_BY_ID[id],
    prog: () => state.vedic,
    getQ: (id, d, lvl) => Promise.resolve(generateVedic(id, d, lvl)),
    otherLabel: '🎮 Maths Adventures (Topics)',
    crownsFor: (d) => CROWNS()[d],
    pointsFor: (d) => POINTS()[d],
    footnote: 'Tap a technique to learn it, then practise. Grown-ups can teach from here too! 👩‍👧',
  },
  topics: {
    title: null, // uses the personalised "Hi <name>"
    subtitle: 'Pick a maths adventure 🌈',
    items: () => content.topics,
    byId: (id) => TOPIC_BY_ID[id],
    prog: () => state.topics,
    getQ: (id, d, lvl) => API.getQuestion(id, d, lvl),
    otherLabel: '🕉️ Vedic Maths',
    crownsFor: (d) => CROWNS()[d],
    pointsFor: (d) => POINTS()[d],
    footnote: 'More adventures unlock as you win crowns! 👑',
  },
};
const SEC = () => SECTIONS[currentSection];
const otherSection = () => (currentSection === 'vedic' ? 'topics' : 'vedic');

// ============================================================
//  SOUND, SPEECH & CONFETTI
// ============================================================
let audioCtx = null;
function tone(freq, start, dur, type = 'sine', vol = 0.18) {
  if (!state || !state.sound) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const t0 = audioCtx.currentTime + start;
    const osc = audioCtx.createOscillator(); const g = audioCtx.createGain();
    osc.type = type; osc.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g).connect(audioCtx.destination);
    osc.start(t0); osc.stop(t0 + dur + 0.02);
  } catch { /* audio not ready */ }
}
const soundCorrect = () => { tone(660, 0, 0.12, 'triangle'); tone(880, 0.1, 0.18, 'triangle'); };
const soundWrong = () => { tone(220, 0, 0.22, 'sine', 0.14); };
const soundFanfare = () => { [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.12, 0.22, 'triangle', 0.2)); };

function speak(text) {
  if (!state || !state.sound || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.92; u.pitch = 1.15; u.lang = 'en-GB';
    window.speechSynthesis.speak(u);
  } catch { /* ignore */ }
}
const stopSpeak = () => { try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch {} };

const PARTY = ['🎉', '⭐', '👑', '🌟', '🎊', '✨', '🥳', '💛'];
function confetti(n = 26) {
  for (let i = 0; i < n; i++) {
    const s = document.createElement('span');
    s.className = 'confetti';
    s.textContent = PARTY[Math.floor(Math.random() * PARTY.length)];
    s.style.left = Math.random() * 100 + 'vw';
    s.style.animationDuration = 1.6 + Math.random() * 1.4 + 's';
    s.style.animationDelay = Math.random() * 0.3 + 's';
    s.style.fontSize = 1.2 + Math.random() * 1.6 + 'rem';
    confettiLayer.appendChild(s);
    setTimeout(() => s.remove(), 3400);
  }
}

// ============================================================
//  MODAL
// ============================================================
function modal({ emoji, title, body, buttons }) {
  const back = el(`<div class="modal-back"></div>`);
  const m = el(`<div class="modal" role="dialog" aria-modal="true"><div class="m-emoji">${emoji || '🎉'}</div><h2>${esc(title)}</h2><p>${body || ''}</p><div class="m-actions"></div></div>`);
  const actions = m.querySelector('.m-actions');
  (buttons || [{ label: 'OK' }]).forEach((b) => {
    const btn = el(`<button class="big-btn ${b.cls || ''}" style="margin-top:10px">${esc(b.label)}</button>`);
    btn.addEventListener('click', () => { back.remove(); b.onClick && b.onClick(); });
    actions.appendChild(btn);
  });
  back.appendChild(m);
  document.body.appendChild(back);
  return back;
}

// ============================================================
//  ANSWER CHECKING (for typed answers)
// ============================================================
function normalize(s) {
  return String(s).toLowerCase().trim()
    .replace(/o['’]?clock/g, '')
    .replace(/£/g, '')
    .replace(/pence|pounds?/g, '')
    .replace(/[\s,]/g, '')
    .replace(/p$/, '');
}
function isCorrect(input, q) {
  const norm = normalize(input);
  if (!norm) return false;
  return [q.answer, ...(q.accept || [])].map(normalize).includes(norm);
}

// ============================================================
//  TOP BAR
// ============================================================
function refreshPills() {
  const pills = document.querySelector('.stats');
  if (pills) pills.innerHTML = `<span class="stat-pill">👑 ${state.totalCrowns}</span><span class="stat-pill">⭐ ${state.totalScore}</span>`;
}
function topbar({ home = true } = {}) {
  const bar = el(`<div class="topbar"></div>`);
  if (home) {
    const h = el(`<button class="home-btn" title="Home" aria-label="Home">🏠</button>`);
    h.addEventListener('click', () => goHome());
    bar.appendChild(h);
  }
  bar.appendChild(el(`<div class="stats"><span class="stat-pill">👑 ${state.totalCrowns}</span><span class="stat-pill">⭐ ${state.totalScore}</span></div>`));
  const snd = el(`<button class="sound-btn ${state.sound ? '' : 'off'}" title="Sound" aria-label="Toggle sound">${state.sound ? '🔊' : '🔇'}</button>`);
  snd.addEventListener('click', () => {
    state.sound = !state.sound; if (!state.sound) stopSpeak(); save();
    snd.textContent = state.sound ? '🔊' : '🔇'; snd.classList.toggle('off', !state.sound);
  });
  bar.appendChild(snd);
  return bar;
}
const clear = () => { app.innerHTML = ''; stopSpeak(); };
function goHome() { stopSpeak(); renderSectionHome(); }

// ============================================================
//  WELCOME
// ============================================================
function renderWelcome() {
  clear();
  const saved = lastName();
  app.appendChild(el(`<h1 class="title">Suveera's<br>Magic Maths ✨</h1>`));
  app.appendChild(el(`<div class="welcome-emoji">👑🔢🥭</div>`));
  const card = el(`<div class="card"></div>`);
  if (saved) {
    card.appendChild(el(`<p style="text-align:center;font-size:1.3rem;margin:4px 0 14px">Welcome back,<br><b style="font-size:1.6rem;color:#7c4dff">${esc(saved)}</b>! 🌟</p>`));
    const cont = el(`<button class="big-btn">Let's Play! ▶️</button>`);
    cont.addEventListener('click', async () => { await begin(saved); });
    card.appendChild(cont);
    const change = el(`<button class="big-btn ghost" style="margin-top:12px">I'm someone else 🙋</button>`);
    change.addEventListener('click', () => switchPlayer());
    card.appendChild(change);
  } else {
    card.appendChild(el(`<p style="text-align:center;font-size:1.25rem;margin:2px 0 6px">What is your name?</p>`));
    const input = el(`<input class="name-input" placeholder="Type your name" maxlength="16" autocomplete="off" />`);
    card.appendChild(input);
    const go = el(`<button class="big-btn">Start! 🚀</button>`);
    const start = async () => {
      const name = (input.value || '').trim() || 'Suveera';
      state = state || { sound: true };
      modal({
        emoji: '👋', title: `Hi ${name}!`,
        body: 'Tap 🔊 to hear a question. Need help? Tap the 💡 hint. Win crowns 👑 for right answers. Let\'s go!',
        buttons: [{ label: "Let's Maths! ✨", onClick: () => begin(name) }],
      });
    };
    go.addEventListener('click', start);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') start(); });
    card.appendChild(go);
    setTimeout(() => input.focus(), 100);
  }
  app.appendChild(card);
  app.appendChild(el(`<p class="footnote">Made with 💜 for Suveera</p>`));
}

async function begin(name) {
  clear();
  app.appendChild(el(`<h1 class="title" style="margin-top:60px">Loading… ✨</h1>`));
  state = await API.loadPlayer(name);
  currentSection = 'vedic';
  renderSectionHome();
}

function switchPlayer() {
  modal({
    emoji: '🙋', title: 'New player?',
    body: 'Type a different name to start a fresh adventure. Your saved crowns stay safe.',
    buttons: [
      { label: 'Yes, new name', cls: 'pink', onClick: () => { cacheClear(); state = { sound: true }; renderWelcome(); } },
      { label: 'Cancel', cls: 'ghost', onClick: () => renderWelcome() },
    ],
  });
}

// ============================================================
//  SECTION HOME — the map of techniques / topics
// ============================================================
function itemProgress(item) {
  const ts = SEC().prog()[item.id];
  const pct = Math.min(100, Math.round((ts.crowns / item.unlockNext) * 100));
  return { ts, pct, complete: ts.crowns >= item.unlockNext };
}

function renderSectionHome() {
  clear();
  const sec = SEC();
  app.appendChild(topbar({ home: false }));
  if (sec.title) app.appendChild(el(`<h1 class="title" style="font-size:2rem;margin:6px 0 2px">${sec.title}</h1>`));
  else app.appendChild(el(`<h1 class="title" style="font-size:1.9rem;margin:6px 0 2px">Hi ${esc(state.name)}! 👋</h1>`));
  app.appendChild(el(`<p class="subtitle">${esc(sec.subtitle)}</p>`));

  // switch to the other section
  const swap = el(`<button class="big-btn ${currentSection === 'vedic' ? 'pink' : 'yellow'}" style="margin-bottom:16px">${esc(sec.otherLabel)} ➡️</button>`);
  swap.addEventListener('click', () => { currentSection = otherSection(); renderSectionHome(); });
  app.appendChild(swap);

  const items = sec.items();
  const grid = el(`<div class="topic-grid"></div>`);
  let shown = 0;
  items.forEach((t, i) => {
    const { ts, pct, complete } = itemProgress(t);
    if (!ts.unlocked) return; // hidden until added via the button below
    shown++;
    const card = el(`<div class="topic-card tappable ${complete ? 'current' : ''}">${complete ? '<span class="done-badge">🌟</span>' : ''}<span class="emoji">${t.emoji}</span><div class="name">${esc(t.name)}</div><div class="bar"><i style="width:${pct}%"></i></div><div class="crowns-line">👑 ${ts.crowns} / ${t.unlockNext}</div></div>`);
    card.addEventListener('click', () => renderItem(t.id));
    grid.appendChild(card);
  });
  app.appendChild(grid);

  // "Add another technique/topic" — reveal the next locked item on demand
  const nextLocked = items.find((t) => !SEC().prog()[t.id].unlocked);
  if (nextLocked) {
    const noun = currentSection === 'vedic' ? 'technique' : 'topic';
    const addBtn = el(`<button class="big-btn secondary" style="margin-top:18px">➕ Add another ${noun}</button>`);
    addBtn.addEventListener('click', () => {
      SEC().prog()[nextLocked.id].unlocked = true;
      save(); soundFanfare(); confetti(36);
      modal({ emoji: '🎉', title: 'New ' + noun + ' added!', body: `You opened <b>${esc(nextLocked.name)} ${nextLocked.emoji}</b>. Have fun! ✨`, buttons: [{ label: 'Open it', cls: 'pink', onClick: () => renderItem(nextLocked.id) }, { label: 'Later', cls: 'ghost', onClick: () => renderSectionHome() }] });
    });
    app.appendChild(addBtn);
  } else if (shown > 0) {
    app.appendChild(el(`<p class="footnote">You've opened them all — amazing! 🏆</p>`));
  }

  app.appendChild(el(`<p class="footnote">${esc(sec.footnote)}</p>`));
  const sw = el(`<button class="tiny-link">Switch player</button>`);
  sw.addEventListener('click', () => switchPlayer());
  app.appendChild(sw);
}

// ============================================================
//  ITEM DETAIL (technique / topic)
// ============================================================
const LEVELS = [
  { id: 'basic', label: 'Easy', dot: '🟢', desc: 'Tap the answer' },
  { id: 'intermediate', label: 'Medium', dot: '🟡', desc: 'Type the answer' },
  { id: 'advanced', label: 'Tricky', dot: '🔴', desc: 'Type the answer' },
];
function renderItem(itemId) {
  clear();
  const sec = SEC();
  const t = sec.byId(itemId);
  const { ts, pct, complete } = itemProgress(t);
  app.appendChild(topbar());
  app.appendChild(el(`<div class="card topic-hero" style="background:linear-gradient(160deg,#fff, ${t.color || '#7c4dff'}22)"><span class="big-emoji">${t.emoji}</span><h2>${esc(t.name)}</h2></div>`));
  const guideBtn = el(`<button class="big-btn yellow">📖 ${currentSection === 'vedic' ? 'Learn the trick' : 'How does it work?'} (Guide)</button>`);
  guideBtn.addEventListener('click', () => renderGuide(itemId));
  app.appendChild(guideBtn);

  const items = sec.items();
  const idx = items.findIndex((x) => x.id === itemId);
  const next = items[idx + 1];
  if (next) {
    const noun = currentSection === 'vedic' ? 'technique' : 'topic';
    app.appendChild(el(`<div class="progress-wrap"><div class="label">👑 ${ts.crowns} / ${t.unlockNext} crowns to unlock the next ${noun}: ${esc(next.name)} ${next.emoji}</div><div class="progress-track"><i style="width:${pct}%"></i></div></div>`));
  }

  app.appendChild(el(`<h3 class="section-head" style="font-size:1.2rem">Choose your questions</h3>`));
  LEVELS.forEach((lv) => {
    const d = ts.levels[lv.id];
    const btn = el(`<button class="level-btn"><span class="dot">${lv.dot}</span><span class="ltext"><b>${lv.label}</b><span>${lv.desc} · done ${d.done} of ${d.added}${d.batchLevel > 1 ? ' · level ' + d.batchLevel : ''}</span></span><span class="go">▶</span></button>`);
    btn.addEventListener('click', () => startQuiz(itemId, lv.id));
    app.appendChild(btn);
  });

  if (next && sec.prog()[next.id].unlocked) {
    const nx = el(`<button class="big-btn pink" style="margin-top:6px">➡️ Next: ${esc(next.name)} ${next.emoji}</button>`);
    nx.addEventListener('click', () => renderItem(next.id));
    app.appendChild(nx);
  }
}

// ============================================================
//  GUIDE (with diagram)
// ============================================================
function renderGuide(itemId) {
  clear();
  const t = SEC().byId(itemId);
  app.appendChild(topbar());
  const card = el(`<div class="card"></div>`);
  card.appendChild(el(`<div style="text-align:center"><span style="font-size:3.4rem">${t.emoji}</span><h2 style="margin:4px 0">${esc(t.name)}</h2></div>`));
  card.appendChild(el(`<p style="font-size:1.2rem;line-height:1.45">${esc(t.guide.intro)}</p>`));
  if (t.guide.diagram) card.appendChild(el(`<div class="diagram-box">${t.guide.diagram}</div>`));
  (t.guide.points || []).forEach(([b, txt]) => card.appendChild(el(`<div class="guide-point"><span class="b">${b}</span><span>${esc(txt)}</span></div>`)));
  card.appendChild(el(`<h3 style="margin:8px 0 10px">Try these examples 👀</h3>`));
  (t.guide.examples || []).forEach((ex) => card.appendChild(el(`<div class="guide-example">${md(ex)}</div>`)));
  const listen = el(`<button class="big-btn yellow">🔊 Read this to me</button>`);
  listen.addEventListener('click', () => speak([t.guide.intro, ...(t.guide.points || []).map((p) => p[1]), ...(t.guide.examples || []).map((e) => e.replace(/\*\*/g, ''))].join('. ')));
  card.appendChild(listen);
  const back = el(`<button class="big-btn" style="margin-top:12px">Let's try questions! ✏️</button>`);
  back.addEventListener('click', () => renderItem(itemId));
  card.appendChild(back);
  app.appendChild(card);
}

// ============================================================
//  QUIZ ENGINE (shared by both sections)
// ============================================================
function startQuiz(itemId, difficulty) {
  const d = SEC().prog()[itemId].levels[difficulty];
  if (d.done >= d.added) return askAddMore(itemId, difficulty, () => startQuiz(itemId, difficulty));
  session = { section: currentSection, itemId, difficulty, current: null, answered: false };
  renderQuestion();
}

async function renderQuestion() {
  const { section, itemId, difficulty } = session;
  const sec = SECTIONS[section];
  const t = sec.byId(itemId);
  const d = sec.prog()[itemId].levels[difficulty];
  if (d.done >= d.added) return renderQuizDone();

  clear();
  app.appendChild(topbar());
  const qNum = d.done + 1;
  app.appendChild(el(`<div class="quiz-meta"><span>${t.emoji} ${esc(t.name)}</span><span class="q-count">Question ${qNum} / ${d.added}</span></div>`));
  app.appendChild(el(`<div class="qbar"><i style="width:${Math.round((d.done / d.added) * 100)}%"></i></div>`));
  const loading = el(`<div class="card question-card"><div class="q-text">…</div></div>`);
  app.appendChild(loading);

  const q = await sec.getQ(itemId, difficulty, d.batchLevel);
  if (!session || session.itemId !== itemId) return; // navigated away
  session.current = q;
  session.answered = false;
  loading.remove();

  const isMC = difficulty === 'basic';
  const card = el(`<div class="card question-card"></div>`);
  if (q.visual) card.appendChild(el(`<div class="q-visual">${q.visual}</div>`));
  card.appendChild(el(`<div class="q-text">${esc(q.text)}</div>`));
  const tools = el(`<div class="q-tools"></div>`);
  const sp = el(`<button class="speak-btn">🔊 Hear it</button>`);
  sp.addEventListener('click', () => speak(q.speak));
  const hintBtn = el(`<button class="speak-btn hint">💡 Hint</button>`);
  hintBtn.addEventListener('click', () => {
    if (card.querySelector('.hint-box')) return;
    card.appendChild(el(`<div class="hint-box">💡 ${esc(q.hint || 'Take your time!')}</div>`)); speak(q.hint || '');
  });
  tools.appendChild(sp); tools.appendChild(hintBtn);
  card.appendChild(tools);
  app.appendChild(card);

  if (isMC) {
    const choices = el(`<div class="choices"></div>`);
    q.choices.forEach((c) => {
      const b = el(`<button class="choice">${esc(c)}</button>`);
      b.addEventListener('click', () => onAnswer(c === q.answer, b));
      choices.appendChild(b);
    });
    app.appendChild(choices);
  } else {
    const wrap = el(`<div class="answer-wrap"></div>`);
    const input = el(`<input class="answer-input" placeholder="Type your answer" autocomplete="off" enterkeyhint="done" />`);
    const submit = el(`<button class="big-btn">Check my answer ✓</button>`);
    const go = () => { if (session.answered) return; onAnswer(isCorrect(input.value, q), null, input.value); };
    submit.addEventListener('click', go);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });
    wrap.appendChild(input); wrap.appendChild(submit);
    app.appendChild(wrap);
    setTimeout(() => input.focus(), 60);
  }
  app.appendChild(el(`<div class="feedback"></div>`));
  speak(q.speak);
}

function onAnswer(correct, btn, typed) {
  if (session.answered) return;
  session.answered = true;
  const { section, itemId, difficulty, current } = session;
  const sec = SECTIONS[section];
  const t = sec.byId(itemId);
  const ts = sec.prog()[itemId];
  const d = ts.levels[difficulty];

  document.querySelectorAll('.choice').forEach((b) => {
    b.disabled = true;
    if (b.textContent === current.answer) b.classList.add('reveal');
  });
  const inEl = document.querySelector('.answer-input');
  const subEl = document.querySelector('.answer-wrap .big-btn');
  if (inEl) { inEl.disabled = true; inEl.classList.add(correct ? 'ok' : 'bad'); }
  if (subEl) subEl.style.display = 'none';
  if (btn) btn.classList.add(correct ? 'correct' : 'wrong');

  d.done += 1;
  const fb = document.querySelector('.feedback');
  let unlocked = null;

  if (correct) {
    d.correct += 1;
    const gc = sec.crownsFor(difficulty), gs = sec.pointsFor(difficulty);
    ts.crowns += gc; ts.score += gs; state.totalCrowns += gc; state.totalScore += gs;
    soundCorrect(); confetti(gc >= 3 ? 30 : 18);
    fb.appendChild(el(`<div class="msg good">${pickPraise()} +${gc} 👑</div>`));
    const items = sec.items();
    const idx = items.findIndex((x) => x.id === itemId);
    const next = items[idx + 1];
    if (next && ts.crowns >= t.unlockNext && !sec.prog()[next.id].unlocked) { sec.prog()[next.id].unlocked = true; unlocked = next; }
  } else {
    soundWrong();
    fb.appendChild(el(`<div class="msg try">Good try! 😊 The answer is <b>${esc(current.answer)}</b>${typed ? `, not "${esc(typed)}"` : ''}.</div>`));
  }

  // ALWAYS show the elaborate explanation so she learns the "why"
  const exp = el(`<div class="explain-box"><div class="explain-head">${section === 'vedic' ? '🪄 The trick:' : "📘 Let's see why:"}</div><div class="explain-body">${md(current.explanation || '')}</div><button class="speak-btn">🔊 Read this</button></div>`);
  exp.querySelector('.speak-btn').addEventListener('click', () => speak(current.explanation));
  fb.appendChild(exp);
  if (!correct) speak(`Good try! The answer is ${current.answer}. ${current.explanation}`);

  refreshPills();
  save();

  const nextBtn = el(`<button class="big-btn" style="margin-top:16px">${d.done >= d.added ? 'See my results 🏆' : 'Next question ➡️'}</button>`);
  nextBtn.addEventListener('click', () => { if (unlocked) celebrateUnlock(unlocked, proceed); else proceed(); });
  fb.appendChild(nextBtn);
  function proceed() { if (d.done >= d.added) renderQuizDone(); else renderQuestion(); }

  if (unlocked) { soundFanfare(); confetti(40); }
}

const PRAISES = ['Brilliant! 🎉', 'Well done! 🌟', 'Superstar! ⭐', 'Yes! 🥳', 'Amazing! ✨', 'Clever girl! 💛', 'Fantastic! 🎊'];
const pickPraise = () => PRAISES[Math.floor(Math.random() * PRAISES.length)];

function celebrateUnlock(item, onClose) {
  soundFanfare(); confetti(40);
  const noun = currentSection === 'vedic' ? 'technique' : 'topic';
  modal({ emoji: '🎉👑', title: `New ${noun} unlocked!`, body: `You opened <b>${esc(item.name)} ${item.emoji}</b>! Keep going to discover even more.`, buttons: [{ label: 'Yay! Continue', cls: 'pink', onClick: onClose || (() => {}) }] });
}

// ============================================================
//  QUIZ FINISHED
// ============================================================
function renderQuizDone() {
  clear();
  const { section, itemId, difficulty } = session;
  const sec = SECTIONS[section];
  const t = sec.byId(itemId);
  const d = sec.prog()[itemId].levels[difficulty];
  app.appendChild(topbar());
  const great = d.correct >= d.added * 0.8;
  app.appendChild(el(`<div class="result-emoji">${great ? '🏆' : '🌟'}</div>`));
  const card = el(`<div class="card"></div>`);
  card.appendChild(el(`<h2 style="text-align:center;margin:0 0 8px">${great ? 'Superstar!' : 'Great work!'} 🎉</h2>`));
  card.appendChild(el(`<div class="result-stat">You got ${d.correct} out of ${d.added} right! ✅</div>`));
  card.appendChild(el(`<div class="result-stat">👑 ${sec.prog()[itemId].crowns} crowns in ${esc(t.name)}</div>`));
  app.appendChild(card);
  confetti(great ? 40 : 22); if (great) soundFanfare(); else soundCorrect();
  const more = el(`<button class="big-btn">➕ Add 25 more questions</button>`);
  more.addEventListener('click', () => askAddMore(itemId, difficulty, () => startQuiz(itemId, difficulty)));
  app.appendChild(more);
  const backItem = el(`<button class="big-btn secondary" style="margin-top:12px">↩️ Back to ${esc(t.name)}</button>`);
  backItem.addEventListener('click', () => renderItem(itemId));
  app.appendChild(backItem);
  const home = el(`<button class="big-btn ghost" style="margin-top:12px">🏠 Home</button>`);
  home.addEventListener('click', () => goHome());
  app.appendChild(home);
}

// ============================================================
//  ADD MORE — with the "make it harder" choice
// ============================================================
function askAddMore(itemId, difficulty, then) {
  const d = SEC().prog()[itemId].levels[difficulty];
  modal({
    emoji: '➕', title: 'Add 25 more questions!',
    body: 'Do you want them the same, or a little bit harder? ⬆️',
    buttons: [
      { label: '😀 Same level — more fun', onClick: () => { d.added += BATCH(); save(); then(); } },
      { label: '⬆️ Make it a bit harder!', cls: 'pink', onClick: () => { d.added += BATCH(); d.batchLevel += 1; save(); then(); } },
    ],
  });
}

// ============================================================
//  BOOT
// ============================================================
async function boot() {
  clear();
  app.appendChild(el(`<h1 class="title" style="margin-top:80px">Suveera's<br>Magic Maths ✨</h1>`));
  content = await API.getContent();
  TOPIC_BY_ID = Object.fromEntries(content.topics.map((t) => [t.id, t]));
  const name = lastName();
  if (name) {
    const cached = cacheGet();
    state = cached && cached.name ? cached : { sound: true };
    await begin(name);
  } else {
    state = { sound: true };
    renderWelcome();
  }
}
boot();
