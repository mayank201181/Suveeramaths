// ============================================================
// Suveera's Magic Maths — MENTAL MATHS tricks
// Shared by the browser (and importable by the server).
// ------------------------------------------------------------
// Each "trick" is a tiny lesson (a clever short-cut) plus an
// endless supply of practice questions that test exactly that
// short-cut. Suveera can learn on her own, or a grown-up can
// open a trick and teach it. Tricks are ordered easy → harder.
//
// trick = {
//   id, name, emoji, tag,
//   lesson: { intro, steps[], examples[], tip, diagram? },
//   gen(level) -> { text, answer, choices[], hint, explanation }
// }
// ============================================================

import { rnd, pick, shuffle, numChoices } from './generators.js';

// small inline ten-frame diagram for "Friends of 10"
const tenFrame = (filled) => {
  let cells = '';
  for (let i = 0; i < 10; i++) {
    const x = 8 + (i % 5) * 46, y = i < 5 ? 8 : 56;
    cells += `<rect x="${x}" y="${y}" width="42" height="42" rx="8" fill="${i < filled ? '#36cf8b' : '#fff'}" stroke="#a78bfa" stroke-width="3"/>`;
  }
  return `<svg class="diagram" viewBox="0 0 244 106" xmlns="http://www.w3.org/2000/svg">${cells}</svg>`;
};

const numQ = (text, ans, hint, explanation, spread) => ({
  text, answer: String(ans), choices: numChoices(ans, { spread }), hint, explanation,
});

export const TRICKS = [
  {
    id: 'count-on', name: 'Count On', emoji: '🐾', tag: 'Adding',
    lesson: {
      intro: 'To add a small number, start at the BIGGER number and count on. You don\'t go back to 1!',
      steps: ['Find the bigger number.', 'Say it, then count on the smaller number using your fingers.', 'The number you land on is the answer.'],
      examples: ['**8 + 3**: start at 8 → 9, 10, 11 → **11**.', '**6 + 2**: start at 6 → 7, 8 → **8**.'],
      tip: 'Always start with the bigger number — it\'s less counting!',
    },
    gen() {
      const a = rnd(4, 9), b = rnd(2, 3), ans = a + b;
      const seq = []; for (let i = 1; i <= b; i++) seq.push(a + i);
      return numQ(`${a} + ${b} = ?`, ans, `Start at ${a} and count on ${b}.`, `Start at ${a}, then count on: ${seq.join(', ')}. So ${a} + ${b} = ${ans}.`, 3);
    },
  },
  {
    id: 'bonds10', name: 'Friends of 10', emoji: '🤝', tag: 'Adding',
    lesson: {
      intro: 'Some pairs of numbers are "friends" because they add up to 10. Knowing them makes maths super fast!',
      steps: ['Remember the pairs: 1+9, 2+8, 3+7, 4+6, 5+5.', 'If you see one number, you can find its friend to make 10.'],
      examples: ['**7 + ? = 10** → the friend of 7 is **3**.', '**4 + 6 = 10**.'],
      tip: 'Fill a ten-frame: how many empty boxes are left? That\'s the friend!',
      diagram: tenFrame(7),
    },
    gen() {
      const n = rnd(1, 9), ans = 10 - n;
      return numQ(`${n} + ? = 10`, ans, `What goes with ${n} to make 10?`, `${n} and ${ans} are friends of 10, because ${n} + ${ans} = 10.`, 3);
    },
  },
  {
    id: 'doubles', name: 'Doubles', emoji: '👯', tag: 'Adding',
    lesson: {
      intro: 'A double is a number added to itself. Doubles are easy to remember and help with lots of sums.',
      steps: ['Double means the same number twice.', 'Double 1 = 2, double 2 = 4, double 3 = 6 ...'],
      examples: ['**Double 4** = 4 + 4 = **8**.', '**Double 7** = 7 + 7 = **14**.'],
      tip: 'Think of two equal hands or two equal teams!',
    },
    gen() {
      const n = rnd(2, 10), ans = n * 2;
      return numQ(`Double ${n} = ?`, ans, `${n} + ${n}.`, `Double ${n} means ${n} + ${n} = ${ans}.`, 3);
    },
  },
  {
    id: 'near-doubles', name: 'Near Doubles', emoji: '👯‍♀️', tag: 'Adding',
    lesson: {
      intro: 'If two numbers are next-door neighbours (like 6 and 7), use the double you know, then add 1.',
      steps: ['Spot the smaller number.', 'Double it.', 'Add 1 more.'],
      examples: ['**6 + 7**: double 6 = 12, add 1 = **13**.', '**4 + 5**: double 4 = 8, add 1 = **9**.'],
      tip: 'Near doubles are just a double with one extra.',
    },
    gen() {
      const n = rnd(3, 9), ans = n + (n + 1);
      return numQ(`${n} + ${n + 1} = ?`, ans, `Double ${n}, then add 1.`, `${n} + ${n + 1}: double ${n} = ${n * 2}, then add 1 = ${ans}.`, 3);
    },
  },
  {
    id: 'add10', name: 'Add 10 Fast', emoji: '⚡', tag: 'Adding',
    lesson: {
      intro: 'Adding 10 is one of the quickest tricks: the ones digit stays the same and the tens digit goes up by one.',
      steps: ['Keep the last digit (the ones) the same.', 'Make the tens one bigger.'],
      examples: ['**23 + 10 = 33**.', '**7 + 10 = 17**.'],
      tip: 'On a 100-square, adding 10 just jumps straight down one row.',
    },
    gen() {
      const n = rnd(3, 79), ans = n + 10;
      return numQ(`${n} + 10 = ?`, ans, 'The ones digit stays the same.', `Adding 10 makes the tens go up by one: ${n} + 10 = ${ans}.`, 5);
    },
  },
  {
    id: 'bridge10', name: 'Jump Through 10', emoji: '🌈', tag: 'Adding',
    lesson: {
      intro: 'For trickier sums, make 10 first, then add what\'s left. 10 is an easy number to build on.',
      steps: ['Look at the bigger number and find its friend to reach 10.', 'Split the smaller number to give that friend.', 'Add the rest onto 10.'],
      examples: ['**8 + 5**: 8 needs 2 to make 10, 5 = 2 + 3, so 10 + 3 = **13**.', '**7 + 6**: 7 + 3 = 10, then + 3 = **13**.'],
      tip: 'Always build up to the friendly number 10 first.',
    },
    gen() {
      const a = rnd(6, 9), b = rnd(11 - a, 9), ans = a + b;
      const need = 10 - a, rest = b - need;
      return numQ(`${a} + ${b} = ?`, ans, `First make 10 from ${a}.`, `${a} needs ${need} to make 10. ${b} = ${need} + ${rest}. So 10 + ${rest} = ${ans}.`, 3);
    },
  },
  {
    id: 'sub-countup', name: 'Count Up to Subtract', emoji: '🪜', tag: 'Taking Away',
    lesson: {
      intro: 'When two numbers are close, don\'t count back — count UP from the smaller to the bigger. The steps you take are the answer!',
      steps: ['Start at the smaller number.', 'Count up to the bigger number.', 'How many steps did you take? That\'s the answer.'],
      examples: ['**12 − 9**: from 9 → 10, 11, 12 = 3 steps → **3**.', '**15 − 13** = 2 steps → **2**.'],
      tip: 'This is how shopkeepers work out change!',
    },
    gen() {
      const m = rnd(11, 17), s = rnd(m - 4, m - 1), ans = m - s;
      const seq = []; for (let i = s + 1; i <= m; i++) seq.push(i);
      return numQ(`${m} − ${s} = ?`, ans, `Count up from ${s} to ${m}.`, `Count up from ${s}: ${seq.join(', ')} — that's ${ans} steps. So ${m} − ${s} = ${ans}.`, 2);
    },
  },
  {
    id: 'times2', name: 'Times 2 (Double)', emoji: '✌️', tag: 'Multiplying',
    lesson: {
      intro: 'Multiplying by 2 is exactly the same as doubling. So if you know your doubles, you know your 2 times table!',
      steps: ['×2 means double.', 'Add the number to itself.'],
      examples: ['**6 × 2** = double 6 = **12**.', '**9 × 2** = **18**.'],
      tip: 'Two of everything — like a pair of shoes.',
    },
    gen() {
      const n = rnd(2, 12), ans = n * 2;
      return numQ(`${n} × 2 = ?`, ans, 'Just double it.', `${n} × 2 is double ${n} = ${ans}.`, 4);
    },
  },
  {
    id: 'times10', name: 'Times 10', emoji: '🔟', tag: 'Multiplying',
    lesson: {
      intro: 'Multiplying a whole number by 10 is magic: just pop a zero on the end!',
      steps: ['Write the number.', 'Add a 0 to the end.'],
      examples: ['**4 × 10 = 40**.', '**12 × 10 = 120**.'],
      tip: 'The digits all shift up one place — that\'s why a 0 appears.',
    },
    gen() {
      const n = rnd(2, 12), ans = n * 10;
      return numQ(`${n} × 10 = ?`, ans, 'Add a zero to the end.', `${n} × 10 = ${ans} (just put a 0 after ${n}).`, 12);
    },
  },
  {
    id: 'times5', name: 'Times 5 Trick', emoji: '🖐️', tag: 'Multiplying',
    lesson: {
      intro: 'To multiply by 5, multiply by 10 (easy!) and then take half. Half of a ×10 answer is the ×5 answer.',
      steps: ['Multiply the number by 10.', 'Halve that answer.'],
      examples: ['**6 × 5**: 6 × 10 = 60, half of 60 = **30**.', '**8 × 5**: 80 → half = **40**.'],
      tip: 'Counting in 5s also works: 5, 10, 15, 20...',
    },
    gen() {
      const n = rnd(2, 12), ans = n * 5;
      return numQ(`${n} × 5 = ?`, ans, '×10 then halve.', `${n} × 10 = ${n * 10}, and half of ${n * 10} = ${ans}.`, 6);
    },
  },
  {
    id: 'times9', name: 'Times 9 Trick', emoji: '🤟', tag: 'Multiplying',
    lesson: {
      intro: 'To multiply by 9, multiply by 10 and then take ONE of the number away. Nine is just one less than ten.',
      steps: ['Multiply the number by 10.', 'Subtract the number once.'],
      examples: ['**6 × 9**: 6 × 10 = 60, minus 6 = **54**.', '**7 × 9**: 70 − 7 = **63**.'],
      tip: 'Finger trick: hold down the n-th finger; fingers left = tens, fingers right = ones!',
    },
    gen() {
      const n = rnd(2, 10), ans = n * 9;
      return numQ(`${n} × 9 = ?`, ans, '×10 then take the number away once.', `${n} × 10 = ${n * 10}, then minus ${n} = ${ans}.`, 6);
    },
  },
  {
    id: 'times11', name: 'Times 11 Trick', emoji: '1️⃣1️⃣', tag: 'Multiplying',
    lesson: {
      intro: 'To multiply a small number by 11, multiply by 10 and add one more of the number.',
      steps: ['Multiply the number by 10.', 'Add the number once more.'],
      examples: ['**4 × 11**: 40 + 4 = **44**.', '**7 × 11**: 70 + 7 = **77**.'],
      tip: 'For single digits, the answer is just that digit twice (3 → 33)!',
    },
    gen() {
      const n = rnd(2, 9), ans = n * 11;
      return numQ(`${n} × 11 = ?`, ans, '×10 then add one more.', `${n} × 10 = ${n * 10}, plus ${n} = ${ans}.`, 7);
    },
  },
  {
    id: 'half', name: 'Halving', emoji: '➗', tag: 'Dividing',
    lesson: {
      intro: 'Halving means splitting into two equal parts. Halving is the opposite of doubling.',
      steps: ['Share the number into two equal groups.', 'One group is the half.'],
      examples: ['**Half of 12** = **6**.', '**Half of 20** = **10**.'],
      tip: 'If you know doubles, halving is just doing them backwards!',
    },
    gen() {
      const ans = rnd(1, 12), n = ans * 2;
      return numQ(`Half of ${n} = ?`, ans, 'Split into two equal parts.', `Half of ${n} is ${ans}, because ${ans} + ${ans} = ${n}.`, 3);
    },
  },
  {
    id: 'div10', name: 'Divide by 10', emoji: '🔻', tag: 'Dividing',
    lesson: {
      intro: 'Dividing a multiple of 10 by 10 is the reverse of the ×10 trick: take a zero OFF the end.',
      steps: ['Look at the number (it ends in 0).', 'Take the last 0 away.'],
      examples: ['**60 ÷ 10 = 6**.', '**120 ÷ 10 = 12**.'],
      tip: 'The digits all shift down one place.',
    },
    gen() {
      const ans = rnd(2, 12), n = ans * 10;
      return numQ(`${n} ÷ 10 = ?`, ans, 'Take a zero off the end.', `${n} ÷ 10 = ${ans} (just remove the 0 from ${n}).`, 3);
    },
  },
  {
    id: 'squares', name: 'Square Numbers', emoji: '⬛', tag: 'Squaring',
    lesson: {
      intro: 'To "square" a number means to multiply it by itself. We write it like 4² which means 4 × 4.',
      steps: ['Take the number.', 'Multiply it by the same number.'],
      examples: ['**4²** = 4 × 4 = **16**.', '**6²** = 6 × 6 = **36**.'],
      tip: 'It\'s called squaring because it makes a square grid of dots!',
    },
    gen() {
      const n = rnd(2, 12), ans = n * n;
      return numQ(`${n} × ${n} = ?`, ans, `${n} groups of ${n}.`, `${n} squared means ${n} × ${n} = ${ans}.`, Math.max(4, n));
    },
  },
  {
    id: 'square5', name: 'Square Ending in 5', emoji: '🟪', tag: 'Squaring',
    lesson: {
      intro: 'There\'s a brilliant trick for squaring any number that ends in 5 (like 15, 25, 35). The answer always ends in 25!',
      steps: ['Take the first digit (the tens).', 'Multiply it by the next number up.', 'Write that, then put 25 on the end.'],
      examples: ['**25²**: 2 × 3 = 6, then 25 → **625**.', '**35²**: 3 × 4 = 12, then 25 → **1225**.'],
      tip: 'This is a great one to show grown-ups — it looks like magic!',
    },
    gen() {
      const a = rnd(1, 9), x = a * 10 + 5, ans = x * x;
      return numQ(`${x} × ${x} = ?`, ans, `${a} × ${a + 1}, then put 25 on the end.`, `${x}²: ${a} × ${a + 1} = ${a * (a + 1)}, then put 25 on the end → ${ans}.`, Math.max(40, a * 30));
    },
  },
];

export const TRICK_BY_ID = Object.fromEntries(TRICKS.map((t) => [t.id, t]));
export const MASTERY = 12; // correct answers to "master" a trick

export function practice(trickId, level = 1) {
  const t = TRICK_BY_ID[trickId];
  const q = t ? t.gen(level) : numQ('2 + 2 = ?', 4, 'Count on.', '2 + 2 = 4.', 2);
  q.speak = q.text.replace(/[×÷−]/g, (m) => ({ '×': ' times ', '÷': ' divided by ', '−': ' minus ' }[m])).replace(/\s+/g, ' ').trim();
  return q;
}
