// ============================================================
// Suveera's Magic Maths — VEDIC MATHS
// Shared by the browser (and importable by the server).
// ------------------------------------------------------------
// Each "technique" is a full mini-course shaped exactly like a
// topic, so it plugs into the same quiz engine:
//   { id, name, emoji, color, unlockNext,
//     guide: { intro, diagram?, points[[emoji,text]], examples[] },
//     gen(difficulty, level) -> question }
//
// Techniques run from gentle mental short-cuts up to real Vedic
// sutras (Ekādhikena, Nikhilam, Ūrdhva-Tiryak). Each level grows
// with `level`, and medium/tricky include practical, relatable
// word problems (Sneha, Vighanesh, pounds & pence, London).
//
// A question returns:
//   { text, visual?, answer, accept[], choices[], hint, explanation }
//   choices[] are used for 🟢 basic (tap); accept[] for typed answers.
// ============================================================

import { rnd, pick, numChoices } from './generators.js';
import { NAMES, TREATS } from './content.js';

const treat = () => pick(TREATS);
const friend = () => pick(NAMES.friends);

// numeric question builder (MC choices + lenient typed accept list)
function Q({ text, ans, hint, explanation, visual, spread, accept = [] }) {
  return {
    text, visual,
    answer: String(ans),
    accept: [String(ans), ...accept],
    choices: numChoices(ans, { spread }),
    hint, explanation,
  };
}

// ------- a couple of tiny reusable SVG diagrams -------
const svg = (inner, vb = '0 0 320 130') =>
  `<svg class="diagram" viewBox="${vb}" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;

const DIAG = {
  base100: svg(
    `<text x="160" y="34" font-size="20" text-anchor="middle" fill="#5e35d6" font-weight="700">All from 9, the last from 10</text>` +
    `<text x="160" y="74" font-size="30" text-anchor="middle" fill="#7c4dff" font-weight="700">100 − 63 = 37</text>` +
    `<text x="160" y="104" font-size="16" text-anchor="middle" fill="#36cf8b" font-weight="700">9−6=3,  10−3=7</text>`),
  crosswise: svg(
    `<text x="80" y="40" font-size="30" text-anchor="middle" fill="#7c4dff" font-weight="700">2 3</text>` +
    `<text x="80" y="78" font-size="30" text-anchor="middle" fill="#7c4dff" font-weight="700">2 1</text>` +
    `<line x1="58" y1="30" x2="102" y2="70" stroke="#ff5ca8" stroke-width="3"/>` +
    `<line x1="102" y1="30" x2="58" y2="70" stroke="#ff5ca8" stroke-width="3"/>` +
    `<text x="220" y="58" font-size="18" text-anchor="middle" fill="#36cf8b" font-weight="700">vertically &amp; crosswise</text>`),
  ekadhika: svg(
    `<text x="160" y="40" font-size="26" text-anchor="middle" fill="#7c4dff" font-weight="700">2 5²  →  (2×3) | 25</text>` +
    `<text x="160" y="82" font-size="30" text-anchor="middle" fill="#36cf8b" font-weight="700">6 25  =  625</text>`),
};

// ============================================================
//  TECHNIQUES
// ============================================================
export const VEDIC = [
  // ---------------------------------------------------------
  {
    id: 'bonds', name: 'Friends of 10 & 100', emoji: '🤝', color: '#36cf8b', unlockNext: 6,
    guide: {
      intro: 'Numbers that join to make 10 (or 100) are "friends". Spotting them lets you add and subtract in your head super fast.',
      points: [
        ['🤝', 'Friends of 10: 1+9, 2+8, 3+7, 4+6, 5+5.'],
        ['💯', 'For 100, use the Vedic rule: "All from 9, and the last from 10."'],
        ['⚡', 'Find a friend and the answer pops out instantly.'],
      ],
      examples: ['**7 + ? = 10** → **3**.', '**100 − 63**: 9−6=3, 10−3=7 → **37**.'],
    },
    gen(difficulty, level) {
      if (difficulty === 'basic') {
        const n = rnd(1, 9), ans = 10 - n;
        return Q({ text: `${n} + ? = 10`, ans, spread: 3, hint: `What joins ${n} to make 10?`, explanation: `${n} and ${ans} are friends of 10, because ${n} + ${ans} = 10.` });
      }
      if (difficulty === 'intermediate') {
        const n = rnd(11, 89), ans = 100 - n;
        const a = Math.floor(n / 10), b = n % 10;
        return Q({ text: `100 − ${n} = ?`, ans, spread: 8, hint: 'All from 9, and the last from 10.', explanation: `Take each digit of ${n} from 9, and the last from 10: 9−${a}=${9 - a}, 10−${b}=${10 - b}. So the answer is ${ans}.` });
      }
      const need = 100;
      const have = rnd(11, 89), ans = need - have;
      const it = treat();
      return Q({ text: `${NAMES.mum} wants to make ${need} ${it.name} ${it.emoji} for a party. She has already made ${have}. How many more must she make?`, ans, spread: 8, hint: 'Use "all from 9, last from 10" to do 100 − ' + have + '.', explanation: `100 − ${have}: 9−${Math.floor(have / 10)}=${9 - Math.floor(have / 10)}, 10−${have % 10}=${10 - (have % 10)} → ${ans} more.` });
    },
  },

  // ---------------------------------------------------------
  {
    id: 'double-half', name: 'Doubling & Halving', emoji: '✌️', color: '#38bdf8', unlockNext: 6,
    guide: {
      intro: 'Doubling means adding a number to itself; halving means splitting it into two equal parts. They are opposites and they make big sums easy.',
      points: [
        ['✌️', 'Double 6 = 6 + 6 = 12.'],
        ['➗', 'Half of 12 = 6.'],
        ['🔁', 'If you know one, you know the other!'],
      ],
      examples: ['**Double 8** = **16**.', '**Half of 18** = **9**.'],
    },
    gen(difficulty, level) {
      if (difficulty === 'basic') {
        const n = rnd(2, 10 + level), ans = n * 2;
        return Q({ text: `Double ${n} = ?`, ans, spread: 4, hint: `${n} + ${n}.`, explanation: `Double ${n} means ${n} + ${n} = ${ans}.` });
      }
      if (difficulty === 'intermediate') {
        const ans = rnd(6, 15 + level * 3), n = ans * 2;
        return Q({ text: `Half of ${n} = ?`, ans, spread: 4, hint: 'Split it into two equal parts.', explanation: `Half of ${n} is ${ans}, because ${ans} + ${ans} = ${n}.` });
      }
      const per = rnd(3, 6 + level), it = treat();
      return Q({ text: `A recipe for 2 cakes uses ${per} ${it.name} ${it.emoji}. ${NAMES.dad} wants to bake 4 cakes. How many ${it.name} does he need?`, ans: per * 2, spread: 4, hint: '4 cakes is double 2 cakes, so double the ' + it.name + '.', explanation: `Doubling for twice as many cakes: ${per} × 2 = ${per * 2} ${it.name}.` });
    },
  },

  // ---------------------------------------------------------
  {
    id: 'add-vedic', name: 'Quick Adding', emoji: '➕', color: '#a78bfa', unlockNext: 7,
    guide: {
      intro: 'Add the easy way: work from the left, or round a number to a friendly ten and adjust. Adding 9 is just "add 10, take 1".',
      points: [
        ['👈', 'Add the tens first, then the ones.'],
        ['🎯', 'To add 9: add 10, then take 1 back.'],
        ['🎯', 'To add 11: add 10, then add 1 more.'],
      ],
      examples: ['**34 + 9**: 34 + 10 = 44, − 1 = **43**.', '**26 + 11**: 26 + 10 = 36, + 1 = **37**.'],
    },
    gen(difficulty, level) {
      if (difficulty === 'basic') {
        const a = rnd(1, 4 + level) * 10 + rnd(0, 5), b = rnd(2, 4);
        return Q({ text: `${a} + ${b} = ?`, ans: a + b, spread: 4, hint: 'Add the ones to the number.', explanation: `${a} + ${b} = ${a + b}.` });
      }
      if (difficulty === 'intermediate') {
        const a = rnd(13, 60 + level * 5), add = pick([9, 11, 19, 21]);
        const round = add < 15 ? 10 : 20;
        const adj = add - round; // +/-1
        return Q({ text: `${a} + ${add} = ?`, ans: a + add, spread: 5, hint: `Add ${round}, then ${adj > 0 ? 'add ' + adj : 'take ' + (-adj)}.`, explanation: `${a} + ${round} = ${a + round}, then ${adj > 0 ? '+ ' + adj : '− ' + (-adj)} = ${a + add}.` });
      }
      const x = pick([20, 30, 40, 50]) + rnd(0, 9), y = pick([20, 30, 40]) + rnd(0, 9), it = treat();
      return Q({ text: `${NAMES.kid} counts ${x} ${it.name} ${it.emoji} in one box and ${y} in another. How many ${it.name} altogether?`, ans: x + y, spread: 8, hint: 'Add the tens, then the ones.', explanation: `${x} + ${y}: tens ${Math.floor(x / 10) * 10} + ${Math.floor(y / 10) * 10} = ${Math.floor(x / 10) * 10 + Math.floor(y / 10) * 10}, ones ${x % 10} + ${y % 10} = ${x % 10 + y % 10}. Together = ${x + y}.` });
    },
  },

  // ---------------------------------------------------------
  {
    id: 'sub-vedic', name: 'Clever Subtracting', emoji: '➖', color: '#ff6b6b', unlockNext: 7,
    guide: {
      intro: 'When two numbers are close, count UP. To take a number from 100 (or any ten), use the Vedic rule "all from 9, and the last from 10".',
      diagram: DIAG.base100,
      points: [
        ['🪜', 'Close numbers? Count up from the smaller one.'],
        ['💯', '100 − 37: 9−3=6, 10−7=3 → 63.'],
        ['🛍️', 'This is exactly how shopkeepers give change!'],
      ],
      examples: ['**15 − 12** = count up 3 → **3**.', '**100 − 45** = **55**.'],
    },
    gen(difficulty, level) {
      if (difficulty === 'basic') {
        const big = rnd(10, 14 + level * 2), small = rnd(big - 4, big - 1), ans = big - small;
        const seq = []; for (let i = small + 1; i <= big; i++) seq.push(i);
        return Q({ text: `${big} − ${small} = ?`, ans, spread: 2, hint: `Count up from ${small} to ${big}.`, explanation: `Count up from ${small}: ${seq.join(', ')} — that's ${ans} steps. So ${big} − ${small} = ${ans}.` });
      }
      if (difficulty === 'intermediate') {
        const n = rnd(11, 89), ans = 100 - n;
        return Q({ text: `100 − ${n} = ?`, ans, spread: 8, hint: 'All from 9, and the last from 10.', explanation: `9 − ${Math.floor(n / 10)} = ${9 - Math.floor(n / 10)}, 10 − ${n % 10} = ${10 - (n % 10)}. So 100 − ${n} = ${ans}.` });
      }
      const cost = rnd(11, 89), ans = 100 - cost, it = treat();
      return Q({ text: `${NAMES.kid} pays with a £1 coin (100p) for a ${it.one} ${it.emoji} costing ${cost}p. How much change does she get, in pence?`, ans, accept: [`${ans}p`], spread: 8, hint: 'Take the price from 100 using "all from 9, last from 10".', explanation: `100 − ${cost}: 9−${Math.floor(cost / 10)}=${9 - Math.floor(cost / 10)}, 10−${cost % 10}=${10 - (cost % 10)} → ${ans}p change.` });
    },
  },

  // ---------------------------------------------------------
  {
    id: 'times-base', name: 'Times 10 & 100', emoji: '🔟', color: '#ffc93c', unlockNext: 7,
    guide: {
      intro: 'Multiplying by 10 or 100 is the easiest trick of all — the digits just shift up and zeros appear on the end.',
      points: [
        ['🔟', '× 10 → add one zero. 7 × 10 = 70.'],
        ['💯', '× 100 → add two zeros. 7 × 100 = 700.'],
        ['↔️', 'The digits move left into bigger places.'],
      ],
      examples: ['**8 × 10 = 80**.', '**6 × 100 = 600**.'],
    },
    gen(difficulty, level) {
      if (difficulty === 'basic') {
        const n = rnd(2, 9 + level), ans = n * 10;
        return Q({ text: `${n} × 10 = ?`, ans, spread: 12, hint: 'Pop a zero on the end.', explanation: `${n} × 10 = ${ans} (one zero after ${n}).` });
      }
      if (difficulty === 'intermediate') {
        const n = rnd(2, 12), ans = n * 100;
        return Q({ text: `${n} × 100 = ?`, ans, spread: 120, hint: 'Pop two zeros on the end.', explanation: `${n} × 100 = ${ans} (two zeros after ${n}).` });
      }
      const price = pick([10, 100]), people = rnd(3, 9 + level), unit = price === 10 ? '£10' : '£100';
      return Q({ text: `Tickets to ${pick(['the London Eye', 'the zoo', 'the cinema'])} cost ${unit} each. ${NAMES.dad} buys ${people} tickets. How many pounds is that?`, ans: price * people, spread: price, hint: `Multiply ${people} by ${price}.`, explanation: `${people} × ${price} = ${price * people} pounds.` });
    },
  },

  // ---------------------------------------------------------
  {
    id: 'times-tricks', name: '5, 9 & 11 Tricks', emoji: '⭐', color: '#ff5ca8', unlockNext: 8,
    guide: {
      intro: 'Three brilliant short-cuts: ×5 is "×10 then halve", ×9 is "×10 then take one away", and ×11 spreads the digits apart.',
      points: [
        ['🖐️', '× 5: do × 10, then halve. 8 × 5 → 80 → 40.'],
        ['🤟', '× 9: do × 10, then subtract the number. 7 × 9 → 70 − 7 = 63.'],
        ['1️⃣1️⃣', '× 11: 6 × 11 = 66; 4 × 11 = 44.'],
      ],
      examples: ['**6 × 5 = 30**.', '**8 × 9 = 72**.', '**7 × 11 = 77**.'],
    },
    gen(difficulty, level) {
      if (difficulty === 'basic') {
        const n = rnd(2, 12), ans = n * 5;
        return Q({ text: `${n} × 5 = ?`, ans, spread: 6, hint: '× 10 then halve.', explanation: `${n} × 10 = ${n * 10}, half of ${n * 10} = ${ans}.` });
      }
      if (difficulty === 'intermediate') {
        const n = rnd(2, 12), ans = n * 9;
        return Q({ text: `${n} × 9 = ?`, ans, spread: 6, hint: '× 10 then take the number away.', explanation: `${n} × 10 = ${n * 10}, then − ${n} = ${ans}.` });
      }
      const n = rnd(12, 80 + level), ans = n * 11;
      return Q({ text: `${n} × 11 = ?`, ans, spread: 12, hint: `${n} × 10, then add ${n}.`, explanation: `${n} × 10 = ${n * 10}, plus ${n} = ${ans}.` });
    },
  },

  // ---------------------------------------------------------
  {
    id: 'ekadhika', name: 'Squares Ending in 5', emoji: '🔼', color: '#a78bfa', unlockNext: 8,
    guide: {
      intro: 'The Vedic sutra Ekādhikena Pūrveṇa means "by one more than the one before". It squares any number ending in 5 in a flash.',
      diagram: DIAG.ekadhika,
      points: [
        ['🔼', 'Take the first digit and the next number up.'],
        ['✖️', 'Multiply them — that\'s the start of the answer.'],
        ['2️⃣5️⃣', 'Always write 25 on the end.'],
      ],
      examples: ['**25²**: 2 × 3 = 6, then 25 → **625**.', '**35²**: 3 × 4 = 12, then 25 → **1225**.'],
    },
    gen(difficulty, level) {
      const top = difficulty === 'basic' ? 3 : difficulty === 'intermediate' ? 7 : 9 + Math.min(level, 3);
      const lo = difficulty === 'basic' ? 1 : difficulty === 'intermediate' ? 4 : 8;
      const a = rnd(lo, Math.max(lo, top)), x = a * 10 + 5, ans = x * x;
      const base = a * (a + 1);
      if (difficulty === 'advanced') {
        return Q({ text: `A square garden has each side ${x} metres long. What is its area (side × side) in square metres?`, ans, spread: Math.max(50, a * 30), hint: `${x} × ${x}: do ${a} × ${a + 1}, then put 25 on the end.`, explanation: `${x}²: ${a} × ${a + 1} = ${base}, then 25 on the end → ${ans} square metres.` });
      }
      return Q({ text: `${x} × ${x} = ?`, ans, spread: Math.max(40, a * 25), hint: `${a} × ${a + 1}, then put 25 on the end.`, explanation: `${x}²: ${a} × ${a + 1} = ${base}, then 25 on the end → ${ans}.` });
    },
  },

  // ---------------------------------------------------------
  {
    id: 'nikhilam', name: 'Near a Base (Nikhilam)', emoji: '💯', color: '#36cf8b', unlockNext: 8,
    guide: {
      intro: 'Nikhilam multiplies numbers that sit close to a base like 10 or 100. You work with the small "gaps" instead of the big numbers.',
      points: [
        ['🔟', 'See how far each number is below 10 (its gap).'],
        ['✖️', 'Multiply the two gaps → that\'s the ones.'],
        ['➖', 'Take one number minus the other\'s gap → that\'s the tens.'],
      ],
      examples: ['**7 × 8**: gaps 3 and 2. 7 − 2 = 5, 3 × 2 = 6 → **56**.', '**8 × 9**: gaps 2,1. 8 − 1 = 7, 2 × 1 = 2 → **72**.'],
    },
    gen(difficulty, level) {
      if (difficulty === 'advanced') {
        const a = rnd(91, 99), b = rnd(91, 99), ans = a * b;
        const da = 100 - a, db = 100 - b;
        return Q({ text: `${a} × ${b} = ?`, ans, spread: 60, hint: `Gaps from 100 are ${da} and ${db}.`, explanation: `Near 100: gaps ${da} and ${db}. ${a} − ${db} = ${a - db} (hundreds part), ${da} × ${db} = ${da * db} (last part). Put together → ${ans}.` });
      }
      const a = rnd(6, 9), b = rnd(6, 9), ans = a * b;
      const da = 10 - a, db = 10 - b;
      return Q({ text: `${a} × ${b} = ?`, ans, spread: 6, hint: `Gaps from 10 are ${da} and ${db}.`, explanation: `Gaps from 10: ${da} and ${db}. ${a} − ${db} = ${a - db} (tens), ${da} × ${db} = ${da * db} (ones). So ${a} × ${b} = ${ans}.` });
    },
  },

  // ---------------------------------------------------------
  {
    id: 'crosswise', name: 'Vertically & Crosswise', emoji: '✳️', color: '#38bdf8', unlockNext: 99,
    guide: {
      intro: 'Ūrdhva-Tiryagbhyām means "vertically and crosswise". It is the all-purpose Vedic way to multiply any two numbers.',
      diagram: DIAG.crosswise,
      points: [
        ['⬇️', 'Vertically: multiply the ones, and the tens.'],
        ['✖️', 'Crosswise: multiply across and add the two together.'],
        ['🧩', 'Put the parts in their places to get the answer.'],
      ],
      examples: ['**23 × 4 = 92** (20×4 + 3×4).', '**21 × 13 = 273**.'],
    },
    gen(difficulty, level) {
      if (difficulty === 'basic') {
        const t = rnd(1, 3 + level), o = rnd(1, 9), n = t * 10 + o, m = rnd(2, 5), ans = n * m;
        return Q({ text: `${n} × ${m} = ?`, ans, spread: 10, hint: `${t * 10} × ${m}, then ${o} × ${m}, then add.`, explanation: `${n} × ${m}: ${t * 10} × ${m} = ${t * 10 * m}, ${o} × ${m} = ${o * m}. Add → ${ans}.` });
      }
      // two-digit × two-digit (kept gentle)
      const a = rnd(1, 2), b = rnd(1, 9), c = rnd(1, 2), d = rnd(1, 9);
      const n1 = a * 10 + b, n2 = c * 10 + d, ans = n1 * n2;
      const ones = b * d, cross = a * d + b * c, hund = a * c;
      return Q({ text: `${n1} × ${n2} = ?`, ans, spread: 40, hint: 'Ones: ' + b + '×' + d + '. Crosswise: ' + a + '×' + d + ' + ' + b + '×' + c + '. Tens-tens: ' + a + '×' + c + '.', explanation: `Vertically & crosswise: ones ${b}×${d}=${ones}; crosswise ${a}×${d}+${b}×${c}=${cross}; ${a}×${c}=${hund}. Place them: ${hund}×100 + ${cross}×10 + ${ones} = ${ans}.` });
    },
  },
];

export const VEDIC_BY_ID = Object.fromEntries(VEDIC.map((t) => [t.id, t]));

export function generateVedic(id, difficulty, level = 1) {
  const t = VEDIC_BY_ID[id];
  let q;
  if (!t) q = Q({ text: '2 + 2 = ?', ans: 4, hint: 'Count on.', explanation: '2 + 2 = 4.' });
  else q = t.gen(difficulty || 'basic', Math.max(1, level));
  q.speak = q.text.replace(/[×÷−²]/g, (m) => ({ '×': ' times ', '÷': ' divided by ', '−': ' minus ', '²': ' squared ' }[m])).replace(/\s+/g, ' ').trim();
  return q;
}
