// ============================================================
// Suveera's Magic Maths — Procedural question generators
// Shared by BOTH the browser and the Node server (ES module).
// ------------------------------------------------------------
// Every question is made fresh in code, so "Add 25 more" is
// endless. Each generator takes a `level` (1, 2, 3, ...) which
// gently scales the numbers up.
//
// Each question returns:
//   { text, visual?, answer, accept[], choices[], hint, explanation, speak }
//   - choices[] : used for 🟢 Basic (multiple choice / tap)
//   - accept[]  : extra answers accepted for 🟡🔴 typed answers
//   - hint      : a gentle nudge shown on demand
//   - explanation : an elaborate, step-by-step worked solution
// ============================================================

import { NAMES, TREATS, TOYS } from './content.js';

// ---------- small helpers ----------
export const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
export const pick = (arr) => arr[rnd(0, arr.length - 1)];
export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = rnd(0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// 4 unique numeric choices around the correct answer.
export function numChoices(correct, { min = 0, spread } = {}) {
  const s = spread || Math.max(2, Math.round(Math.abs(correct) * 0.4) + 1);
  const set = new Set([correct]);
  let guard = 0;
  while (set.size < 4 && guard++ < 200) {
    let d = correct + rnd(-s, s);
    if (d < min) d = correct + rnd(1, s + 1);
    if (d !== correct) set.add(d);
  }
  let n = min;
  while (set.size < 4) { if (!set.has(n)) set.add(n); n++; }
  return shuffle([...set].map(String));
}

// Money helpers (work in pence internally).
const fmtMoney = (p, forcePounds = false) =>
  forcePounds || p >= 100 ? `£${(p / 100).toFixed(2)}` : `${p}p`;

function moneyChoices(correctPence) {
  const pounds = correctPence >= 100;
  const set = new Set([correctPence]);
  const steps = [5, 10, 20, 50, 100, -5, -10, -20, -50, -100];
  let guard = 0;
  while (set.size < 4 && guard++ < 200) {
    const d = correctPence + pick(steps);
    if (d > 0) set.add(d);
  }
  let n = 5;
  while (set.size < 4) { if (!set.has(n)) set.add(n); n += 5; }
  return shuffle([...set].map((p) => fmtMoney(p, pounds)));
}

function acceptMoney(pence) {
  const pounds = pence / 100;
  const set = new Set([fmtMoney(pence, pence >= 100)]);
  set.add(`£${pounds.toFixed(2)}`);
  set.add(pounds.toFixed(2));
  set.add(String(pounds));
  set.add(`${pence}p`);
  set.add(String(pence));
  if (Number.isInteger(pounds)) set.add(`£${pounds}`);
  return [...set];
}

// Fixed-set string choices (times, fractions...).
function fromSet(answer, pool) {
  const set = new Set([answer]);
  for (const p of shuffle(pool)) { if (set.size >= 4) break; set.add(p); }
  return shuffle([...set]); // pools are always sized to give 4 distinct options
}

const treat = () => pick(TREATS);
const toy = () => pick(TOYS);
const someThing = () => pick([...TREATS, ...TOYS]);
const friend = () => pick(NAMES.friends);
const listCount = (n) => Array.from({ length: n }, (_, i) => i + 1).join(', ');

// builders -----------------------------------------------------
function numQ({ text, ans, hint, explanation, visual, min = 0, spread, accept = [] }) {
  return { text, visual, answer: String(ans), accept: [String(ans), ...accept], choices: numChoices(ans, { min, spread }), hint, explanation };
}
function moneyQ({ text, pence, hint, explanation }) {
  return { text, answer: fmtMoney(pence, pence >= 100), accept: acceptMoney(pence), choices: moneyChoices(pence), hint, explanation };
}
function setQ({ text, answer, pool, accept = [], hint, explanation }) {
  return { text, answer, accept: [answer, ...accept], choices: fromSet(answer, pool), hint, explanation };
}

// ============================================================
//  GENERATORS  — gens[topicId][difficulty](level)
// ============================================================
const gens = {
  // -------------------- COUNTING --------------------
  counting: {
    basic(level) {
      const n = rnd(1, Math.min(5 + level * 3, 20));
      const item = someThing();
      return numQ({
        text: `How many ${item.name} can you count?`,
        visual: item.emoji.repeat(n),
        ans: n, min: 0, spread: 3,
        hint: 'Point at each one and count slowly: 1, 2, 3...',
        explanation: `Let's count them one by one: ${listCount(n)}. So there are ${n} ${item.name}.`,
      });
    },
    intermediate(level) {
      const top = Math.min(15 + level * 5, 50);
      const kind = pick(['after', 'before', 'between']);
      if (kind === 'after') {
        const n = rnd(1, top - 1);
        return numQ({ text: `What number comes right after ${n}?`, ans: n + 1, spread: 3, hint: `Count up: ...${n}, then?`, explanation: `When we count up, after ${n} comes ${n + 1}. (${n}, ${n + 1})` });
      }
      if (kind === 'before') {
        const n = rnd(2, top);
        return numQ({ text: `What number comes just before ${n}?`, ans: n - 1, spread: 3, hint: `Count back one from ${n}.`, explanation: `Just before ${n} is ${n - 1}. (${n - 1}, ${n})` });
      }
      const a = rnd(1, top - 2);
      return numQ({ text: `What number is between ${a} and ${a + 2}?`, ans: a + 1, spread: 3, hint: `Say ${a}, ?, ${a + 2}.`, explanation: `Count ${a}, ${a + 1}, ${a + 2}. The one in the middle is ${a + 1}.` });
    },
    advanced(level) {
      const step = pick([2, 5, 10]);
      const start = step * rnd(1, 2 + level);
      const seq = [start, start + step, start + step * 2];
      const next = start + step * 3;
      return numQ({
        text: `Skip count by ${step}. What comes next?  ${seq.join(', ')}, ?`,
        ans: next, spread: step,
        hint: `Each number jumps up by ${step}.`,
        explanation: `We add ${step} each time: ${seq[2]} + ${step} = ${next}.`,
      });
    },
  },

  // -------------------- ADDITION --------------------
  addition: {
    basic(level) {
      const top = Math.min(5 + level * 2, 20);
      const a = rnd(1, top), b = rnd(1, top), sum = a + b;
      const q = numQ({
        text: `${a} + ${b} = ?`, ans: sum,
        hint: `Start at ${a} and count on ${b} more.`,
        explanation: `Start with ${a}, then count ${b} more to reach ${sum}. So ${a} + ${b} = ${sum}.`,
      });
      if (sum <= 12) { const it = someThing().emoji; q.visual = `${it.repeat(a)}  +  ${it.repeat(b)}`; }
      return q;
    },
    intermediate(level) {
      const top = Math.min(4 + level * 2, 20);
      const a = rnd(2, top), b = rnd(2, top), it = treat();
      return numQ({
        text: `${NAMES.kid} has ${a} ${it.name} ${it.emoji}. ${NAMES.mum} gives her ${b} more. How many ${it.name} does she have now?`,
        ans: a + b,
        hint: `"More" means add. Put ${a} and ${b} together.`,
        explanation: `She started with ${a} ${it.name} and got ${b} more. ${a} + ${b} = ${a + b} ${it.name}.`,
      });
    },
    advanced(level) {
      if (level >= 2 && rnd(0, 1)) {
        const a = rnd(10, 20 + level * 10), b = rnd(10, 20 + level * 10);
        return numQ({ text: `${a} + ${b} = ?`, ans: a + b, spread: 6, hint: 'Add the tens, then the ones.', explanation: `${a} + ${b}: add them together to get ${a + b}.` });
      }
      const a = rnd(2, 6 + level), b = rnd(2, 6 + level), c = rnd(1, 4 + level), t1 = treat();
      return numQ({
        text: `${NAMES.kid} buys ${a} ${t1.name} and ${b} more ${t1.name}. Then ${NAMES.dad} gives her ${c} extra. How many ${t1.name} altogether?`,
        ans: a + b + c,
        hint: 'Add them in steps: first two amounts, then the last.',
        explanation: `First ${a} + ${b} = ${a + b}. Then ${a + b} + ${c} = ${a + b + c} ${t1.name} altogether.`,
      });
    },
  },

  // -------------------- SUBTRACTION --------------------
  subtraction: {
    basic(level) {
      const top = Math.min(6 + level * 2, 20);
      const a = rnd(2, top), b = rnd(1, a);
      const q = numQ({
        text: `${a} − ${b} = ?`, ans: a - b,
        hint: `Start at ${a} and count back ${b}.`,
        explanation: `Start at ${a} and take ${b} away: you land on ${a - b}. So ${a} − ${b} = ${a - b}.`,
      });
      if (a <= 12) { const it = someThing().emoji; q.visual = it.repeat(a - b) + '❌'.repeat(b); }
      return q;
    },
    intermediate(level) {
      const top = Math.min(6 + level * 2, 20);
      const a = rnd(4, top), b = rnd(1, a - 1), it = treat();
      return numQ({
        text: `${NAMES.kid} had ${a} ${it.name} ${it.emoji}. She ate ${b}. How many ${it.name} are left?`,
        ans: a - b,
        hint: '"Ate" means they go away — take away.',
        explanation: `She had ${a} and ${b} were eaten. ${a} − ${b} = ${a - b} ${it.name} left.`,
      });
    },
    advanced(level) {
      if (level >= 2 && rnd(0, 1)) {
        const a = rnd(20, 30 + level * 10), b = rnd(5, a - 1);
        return numQ({ text: `${a} − ${b} = ?`, ans: a - b, spread: 6, hint: 'Count back from the bigger number.', explanation: `${a} − ${b} = ${a - b}.` });
      }
      const a = rnd(10, 14 + level * 3), b = rnd(2, 6), c = rnd(1, 4), it = toy();
      return numQ({
        text: `${NAMES.kid} had ${a} ${it.name} ${it.emoji}. She gave ${b} to ${friend()} and ${c} to ${NAMES.mum}. How many ${it.name} are left?`,
        ans: a - b - c,
        hint: 'Take away both amounts she gave away.',
        explanation: `She gave away ${b} + ${c} = ${b + c}. ${a} − ${b + c} = ${a - b - c} left.`,
      });
    },
  },

  // -------------------- MULTIPLICATION --------------------
  multiplication: {
    basic(level) {
      const a = rnd(2, Math.min(3 + level, 6)), b = rnd(2, 10);
      return numQ({
        text: `${a} × ${b} = ?`, ans: a * b, spread: a + 2,
        hint: `${a} groups of ${b}. Add ${b} to itself ${a} times.`,
        explanation: `${a} × ${b} means ${a} groups of ${b}: ${Array(a).fill(b).join(' + ')} = ${a * b}.`,
      });
    },
    intermediate(level) {
      const a = rnd(2, 3 + level), b = rnd(2, 6), it = treat();
      return numQ({
        text: `There are ${a} plates. Each plate has ${b} ${it.name} ${it.emoji}. How many ${it.name} in total?`,
        ans: a * b, spread: 4,
        hint: `${a} plates, ${b} on each → multiply.`,
        explanation: `${a} plates × ${b} each = ${a * b} ${it.name}.`,
      });
    },
    advanced(level) {
      const a = rnd(2, 4 + level), b = rnd(2, 5), c = rnd(1, 4), it = toy();
      return numQ({
        text: `${NAMES.kid} has ${a} boxes of ${it.name} ${it.emoji}. Each box has ${b}. She gives ${c} away. How many are left?`,
        ans: a * b - c, spread: 4,
        hint: 'First find the total, then take away what she gave.',
        explanation: `${a} × ${b} = ${a * b} in total. Then ${a * b} − ${c} = ${a * b - c} left.`,
      });
    },
  },

  // -------------------- DIVISION --------------------
  division: {
    basic(level) {
      const b = rnd(2, 4 + Math.min(level, 4)), ans = rnd(2, 6 + level), tot = b * ans;
      return numQ({
        text: `${tot} ÷ ${b} = ?`, ans, spread: 3,
        hint: `How many groups of ${b} make ${tot}?`,
        explanation: `${tot} ÷ ${b} = ${ans}, because ${b} × ${ans} = ${tot}.`,
      });
    },
    intermediate(level) {
      const b = rnd(2, 4), ans = rnd(2, 4 + level), tot = b * ans, it = treat();
      return numQ({
        text: `${NAMES.kid} shares ${tot} ${it.name} ${it.emoji} equally between ${b} friends. How many does each friend get?`,
        ans, spread: 3,
        hint: `Split ${tot} into ${b} equal groups.`,
        explanation: `Sharing ${tot} between ${b}: ${tot} ÷ ${b} = ${ans} each.`,
      });
    },
    advanced(level) {
      const per = rnd(2, 3 + level), bags = rnd(2, 5), rem = rnd(0, per - 1), tot = per * bags + rem, it = treat();
      return numQ({
        text: `${tot} ${it.name} ${it.emoji} are packed into bags of ${per}. How many full bags can ${NAMES.kid} make?`,
        ans: bags, spread: 2,
        hint: `How many times does ${per} fit into ${tot}?`,
        explanation: `${per} × ${bags} = ${per * bags}, which fits inside ${tot}. So ${bags} full bags${rem ? ` (with ${rem} left over)` : ''}.`,
      });
    },
  },

  // -------------------- MONEY (£/p) --------------------
  money: {
    basic(level) {
      const kind = pick(['add', 'add', 'pound']);
      if (kind === 'pound') {
        return numQ({ text: 'How many pence (p) are there in £1?', ans: 100, spread: 20, hint: 'A pound is made of lots of pennies.', explanation: 'There are 100 pence in £1.' });
      }
      const step = pick([5, 10, 20]);
      const a = step * rnd(1, 4 + level), b = step * rnd(1, 4 + level);
      return moneyQ({ text: `${fmtMoney(a)} + ${fmtMoney(b)} = ?`, pence: a + b, hint: 'Add the two amounts of pence together.', explanation: `${fmtMoney(a)} + ${fmtMoney(b)} = ${fmtMoney(a + b)}.` });
    },
    intermediate(level) {
      const it = treat(), price = pick([20, 30, 40, 50]) + (level > 2 ? pick([0, 5]) : 0), n = rnd(2, 2 + level);
      return moneyQ({
        text: `A ${it.one} ${it.emoji} costs ${fmtMoney(price)}. ${NAMES.kid} buys ${n}. How much does she pay?`,
        pence: price * n,
        hint: `${n} of them means ${fmtMoney(price)} added ${n} times.`,
        explanation: `${n} × ${fmtMoney(price)} = ${fmtMoney(price * n)}.`,
      });
    },
    advanced(level) {
      const it = treat(), cost = pick([120, 130, 150, 160, 180, 250]);
      const paid = Math.ceil((cost + rnd(10, 50 + level * 20)) / 50) * 50;
      return moneyQ({
        text: `${NAMES.kid} buys a ${it.one} ${it.emoji} for ${fmtMoney(cost)}. She pays with ${fmtMoney(paid)}. How much change does she get?`,
        pence: paid - cost,
        hint: 'Change = the money you give − the price.',
        explanation: `She paid ${fmtMoney(paid)} for something costing ${fmtMoney(cost)}. ${fmtMoney(paid)} − ${fmtMoney(cost)} = ${fmtMoney(paid - cost)} change.`,
      });
    },
  },

  // -------------------- TIME --------------------
  time: {
    basic() {
      const h = rnd(1, 12), pool = [];
      for (let i = 1; i <= 12; i++) pool.push(`${i}:00`);
      return setQ({ text: `How do we write ${h} o'clock in numbers?`, answer: `${h}:00`, pool, accept: [`${h}`, `${h}.00`], hint: "o'clock means zero minutes, so :00.", explanation: `${h} o'clock has no extra minutes, so we write it ${h}:00.` });
    },
    intermediate() {
      const h = rnd(1, 12), half = rnd(0, 1) === 0;
      const answer = half ? `${h}:30` : `${h}:15`;
      const word = half ? `half past ${h}` : `quarter past ${h}`;
      const pool = [`${h}:30`, `${h}:15`, `${h}:00`, `${h}:45`, `${(h % 12) + 1}:30`];
      return setQ({ text: `How do we write ${word} in numbers?`, answer, pool, accept: [answer.replace(':', '.'), answer.replace(':', '')], hint: half ? 'Half past means 30 minutes past.' : 'Quarter past means 15 minutes past.', explanation: `${word} is written ${answer} (the minutes are ${half ? '30' : '15'}).` });
    },
    advanced(level) {
      const start = rnd(1, 8), hours = rnd(2, 3 + level), end = start + hours;
      const answer = `${end} o'clock`, pool = [];
      for (let i = 1; i <= 12; i++) pool.push(`${i} o'clock`);
      return setQ({
        text: `${NAMES.kid}'s class starts at ${start} o'clock and lasts ${hours} hours. What time does it finish?`,
        answer, pool, accept: [`${end}`, `${end}:00`, `${end} oclock`],
        hint: 'Count the hours forward from the start time.',
        explanation: `Start at ${start} o'clock and add ${hours} hours: ${start} + ${hours} = ${end}. It finishes at ${end} o'clock.`,
      });
    },
  },

  // -------------------- FRACTIONS --------------------
  fractions: {
    basic(level) {
      const useQuarter = level >= 2 && rnd(0, 1) === 0;
      const part = useQuarter ? 4 : 2, whole = part * rnd(1, 4 + level), it = treat();
      return numQ({
        text: `What is ${useQuarter ? 'a quarter' : 'half'} of ${whole} ${it.name} ${it.emoji}?`,
        ans: whole / part, spread: 2,
        hint: `${useQuarter ? 'A quarter' : 'Half'} means split into ${part} equal groups.`,
        explanation: `Split ${whole} into ${part} equal groups: ${whole} ÷ ${part} = ${whole / part}.`,
      });
    },
    intermediate(level) {
      const d = pick([2, 3, 4]), ans = rnd(2, 3 + level), whole = d * ans, it = treat();
      return numQ({
        text: `${NAMES.kid} has ${whole} ${it.name} ${it.emoji}. She gives 1/${d} of them to ${friend()}. How many does she give away?`,
        ans, spread: 2,
        hint: `1/${d} means one of ${d} equal parts.`,
        explanation: `Split ${whole} into ${d} equal parts: ${whole} ÷ ${d} = ${ans}. She gives away ${ans}.`,
      });
    },
    advanced() {
      const kind = pick(['compare', 'add', 'equiv']);
      if (kind === 'compare') return setQ({ text: 'Which fraction is the biggest piece?', answer: '1/2', pool: ['1/4', '1/3', '1/8', '2/4'], hint: 'The fewer the pieces, the bigger each piece.', explanation: 'Cutting into 2 gives bigger pieces than 3, 4 or 8. So 1/2 is the biggest.' });
      if (kind === 'add') return setQ({ text: 'What is 1/4 + 1/4?', answer: '1/2', pool: ['1/4', '3/4', '1/3', '1'], accept: ['2/4', '0.5'], hint: 'Two quarters join together.', explanation: '1/4 + 1/4 = 2/4, and 2/4 is the same as 1/2.' });
      return setQ({ text: 'One half (1/2) is the same as how many quarters?', answer: '2/4', pool: ['1/4', '3/4', '2/3', '4/2'], accept: ['2', '1/2'], hint: 'How many quarters fill one half?', explanation: 'Half a pizza is the same as 2 quarter-slices. So 1/2 = 2/4.' });
    },
  },

  // -------------------- DECIMALS --------------------
  decimals: {
    basic(level) {
      if (level >= 2 && rnd(0, 1)) {
        const a = pick(['0.3', '0.4', '0.6', '0.7']), b = pick(['0.2', '0.3', '0.5']);
        const ans = (parseFloat(a) + parseFloat(b)).toFixed(1);
        return setQ({ text: `${a} + ${b} = ?`, answer: ans, pool: [ans, '1.0', '0.9', '0.8', '0.5', '0.6'], hint: 'Add them like normal numbers, keep the dot.', explanation: `${a} + ${b} = ${ans}.` });
      }
      return setQ({ text: 'What is 0.5 + 0.5?', answer: '1.0', pool: ['0.5', '1.5', '2.0', '0.1'], accept: ['1'], hint: '0.5 is one half. Two halves make a whole.', explanation: '0.5 + 0.5 = 1.0 (two halves make one whole).' });
    },
    intermediate(level) {
      const it = treat(), price = pick([60, 70, 80, 90]), n = rnd(2, 2 + level);
      return moneyQ({
        text: `A ${it.one} ${it.emoji} costs £${(price / 100).toFixed(2)}. ${NAMES.kid} buys ${n}. How much does she pay?`,
        pence: price * n,
        hint: `Add the price ${n} times.`,
        explanation: `£${(price / 100).toFixed(2)} × ${n} = ${fmtMoney(price * n, true)}.`,
      });
    },
    advanced() {
      const a = pick([150, 175, 220, 240, 325]), b = pick([110, 130, 150, 95]);
      return moneyQ({
        text: `${NAMES.kid} buys one thing for £${(a / 100).toFixed(2)} and another for £${(b / 100).toFixed(2)}. How much in total?`,
        pence: a + b,
        hint: 'Add the two prices, lining up the dots.',
        explanation: `£${(a / 100).toFixed(2)} + £${(b / 100).toFixed(2)} = ${fmtMoney(a + b, true)}.`,
      });
    },
  },

  // -------------------- RATIOS --------------------
  ratios: {
    basic(level) {
      const r = pick([2, 3]), n = rnd(1, 2 + level);
      return numQ({
        text: `For every 1 dog 🐶 there are ${r} cats 🐱. If there are ${n} dogs, how many cats are there?`,
        ans: r * n, spread: 3,
        hint: `Each dog brings ${r} cats. Multiply by ${r}.`,
        explanation: `${n} dogs × ${r} cats each = ${n * r} cats.`,
      });
    },
    intermediate(level) {
      const r = pick([2, 3]), n = rnd(2, 2 + level);
      return numQ({
        text: `${NAMES.mum} mixes 1 cup of juice with ${r} cups of water. For ${n} cups of juice, how many cups of water are needed?`,
        ans: r * n, spread: 3,
        hint: `Each cup of juice needs ${r} cups of water.`,
        explanation: `${n} × ${r} = ${n * r} cups of water.`,
      });
    },
    advanced(level) {
      const r = pick([2, 3, 4]), base = rnd(2, 3 + level), want = base * pick([2, 3]), flour = r * base, it = treat();
      return numQ({
        text: `A recipe uses ${flour} ${it.name} ${it.emoji} to make ${base} cakes. How many ${it.name} are needed for ${want} cakes?`,
        ans: (flour / base) * want, spread: 4,
        hint: 'First find how many for one cake, then multiply.',
        explanation: `${flour} ÷ ${base} = ${flour / base} per cake. ${flour / base} × ${want} = ${(flour / base) * want}.`,
      });
    },
  },

  // -------------------- PROPORTIONS --------------------
  proportions: {
    basic(level) {
      const it = treat(), price = pick([20, 30, 40, 50]), n = rnd(2, 3 + level);
      return moneyQ({
        text: `1 ${it.one} ${it.emoji} costs ${fmtMoney(price)}. How much do ${n} ${it.name} cost?`,
        pence: price * n,
        hint: `${n} of them means the price ${n} times.`,
        explanation: `1 costs ${fmtMoney(price)}, so ${n} cost ${fmtMoney(price)} × ${n} = ${fmtMoney(price * n)}.`,
      });
    },
    intermediate() {
      const it = treat(), each = pick([20, 30, 40]), n = rnd(2, 4);
      return moneyQ({
        text: `${n} ${it.name} ${it.emoji} cost ${fmtMoney(each * n)}. How much does 1 ${it.one} cost?`,
        pence: each,
        hint: `Share the total cost between the ${n} of them.`,
        explanation: `${n} cost ${fmtMoney(each * n)}, so 1 costs ${fmtMoney(each * n)} ÷ ${n} = ${fmtMoney(each)}.`,
      });
    },
    advanced(level) {
      const it = treat(), each = pick([15, 20, 25, 30]), have = pick([2, 3]), want = have * pick([2, 3]) + (level > 2 ? 1 : 0);
      return moneyQ({
        text: `${have} ${it.name} ${it.emoji} cost ${fmtMoney(each * have)}. How much would ${want} ${it.name} cost?`,
        pence: each * want,
        hint: 'Find the cost of one first, then multiply.',
        explanation: `${have} cost ${fmtMoney(each * have)}, so 1 costs ${fmtMoney(each)}. ${want} × ${fmtMoney(each)} = ${fmtMoney(each * want)}.`,
      });
    },
  },
};

// Public entry point.
export function generateQuestion(topicId, difficulty, level = 1) {
  const topicGens = gens[topicId];
  const fn = topicGens && topicGens[difficulty];
  let q;
  if (!fn) {
    const a = rnd(1, 9), b = rnd(1, 9);
    q = numQ({ text: `${a} + ${b} = ?`, ans: a + b, hint: 'Count on from the first number.', explanation: `${a} + ${b} = ${a + b}.` });
  } else {
    q = fn(Math.max(1, level));
  }
  q.speak = q.text.replace(/[•×÷−]/g, (m) => ({ '×': ' times ', '÷': ' divided by ', '−': ' minus ', '•': '' }[m])).replace(/\s+/g, ' ').trim();
  return q;
}
