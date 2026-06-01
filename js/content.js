// ============================================================
// Suveera's Magic Maths — Topics, guides & diagrams
// Shared by BOTH the browser and the Node server (ES module).
// ------------------------------------------------------------
// Topics unlock one after another. A topic unlocks the next one
// once Suveera has collected `unlockNext` crowns inside it.
// Each guide has an SVG `diagram` that explains the idea visually.
// ============================================================

export const POINTS = { basic: 5, intermediate: 10, advanced: 15 };
export const CROWNS = { basic: 1, intermediate: 2, advanced: 3 };
export const BATCH_SIZE = 25;

// Word-problem word banks — practical & relatable for an Indian
// family living in London. Mum = Sneha, Dad = Vighanesh.
export const NAMES = {
  kid: 'Suveera',
  mum: 'Sneha',
  dad: 'Vighanesh',
  friends: ['Aanya', 'Riya', 'Maya', 'Leela', 'Arjun', 'Kabir', 'Diya'],
};

export const TREATS = [
  { name: 'samosas', one: 'samosa', emoji: '🥟' },
  { name: 'mangoes', one: 'mango', emoji: '🥭' },
  { name: 'laddoos', one: 'laddoo', emoji: '🟡' },
  { name: 'biscuits', one: 'biscuit', emoji: '🍪' },
  { name: 'cupcakes', one: 'cupcake', emoji: '🧁' },
  { name: 'rotis', one: 'roti', emoji: '🫓' },
  { name: 'strawberries', one: 'strawberry', emoji: '🍓' },
  { name: 'grapes', one: 'grape', emoji: '🍇' },
  { name: 'apples', one: 'apple', emoji: '🍎' },
];

export const TOYS = [
  { name: 'stickers', one: 'sticker', emoji: '⭐' },
  { name: 'crayons', one: 'crayon', emoji: '🖍️' },
  { name: 'balloons', one: 'balloon', emoji: '🎈' },
  { name: 'marbles', one: 'marble', emoji: '🔵' },
  { name: 'toy cars', one: 'toy car', emoji: '🚗' },
  { name: 'hair clips', one: 'hair clip', emoji: '🎀' },
];

export const PLACES = [
  'Hyde Park', 'the London Eye', 'Tesco', 'school', 'the park',
  "Granny's house", 'the library', 'the toy shop', 'the Tube station',
];

// ------------------------------------------------------------
//  SVG diagram helpers (small, self-contained, colourful)
// ------------------------------------------------------------
const SVG = (inner, vb = '0 0 340 170') =>
  `<svg class="diagram" viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" role="img">${inner}</svg>`;

const circle = (x, y, r, fill, label = '', tcol = '#fff') =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>` +
  (label !== '' ? `<text x="${x}" y="${y + r * 0.34}" font-size="${r}" text-anchor="middle" fill="${tcol}" font-weight="700">${label}</text>` : '');

const emo = (x, y, size, e) => `<text x="${x}" y="${y}" font-size="${size}" text-anchor="middle">${e}</text>`;
const sign = (x, y, s, col = '#5e35d6') => `<text x="${x}" y="${y}" font-size="34" text-anchor="middle" fill="${col}" font-weight="700">${s}</text>`;

const DIAGRAMS = {
  counting: SVG(
    [40, 95, 150, 205, 260].map((x, i) => circle(x, 75, 26, ['#38bdf8', '#36cf8b', '#ffc93c', '#ff6b6b', '#a78bfa'][i], String(i + 1))).join('') +
    `<text x="170" y="140" font-size="20" text-anchor="middle" fill="#5e35d6" font-weight="700">Count them: 1, 2, 3, 4, 5</text>`
  ),
  addition: SVG(
    emo(45, 70, 34, '🍎') + emo(80, 70, 34, '🍎') +
    sign(120, 70, '+') +
    emo(155, 70, 34, '🍎') + emo(190, 70, 34, '🍎') + emo(225, 70, 34, '🍎') +
    sign(263, 70, '=') +
    circle(300, 62, 26, '#36cf8b', '5') +
    `<text x="170" y="135" font-size="20" text-anchor="middle" fill="#5e35d6" font-weight="700">2 + 3 = 5</text>`
  ),
  subtraction: SVG(
    [50, 95, 140, 185, 230].map((x, i) => emo(x, 70, 34, '🍪') + (i >= 3 ? `<text x="${x}" y="78" font-size="40" text-anchor="middle" fill="#ff6b6b" font-weight="700">✕</text>` : '')).join('') +
    sign(270, 70, '=') + circle(305, 62, 26, '#ff6b6b', '3') +
    `<text x="170" y="135" font-size="20" text-anchor="middle" fill="#5e35d6" font-weight="700">5 take away 2 = 3 left</text>`
  ),
  multiplication: SVG(
    (() => { let s = ''; for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) s += circle(60 + c * 44, 35 + r * 36, 14, '#ff5ca8'); return s; })() +
    `<text x="250" y="80" font-size="22" text-anchor="middle" fill="#5e35d6" font-weight="700">3 rows</text>` +
    `<text x="250" y="108" font-size="22" text-anchor="middle" fill="#5e35d6" font-weight="700">of 4</text>` +
    `<text x="170" y="160" font-size="20" text-anchor="middle" fill="#5e35d6" font-weight="700">3 × 4 = 12</text>`
  ),
  division: SVG(
    [0, 1, 2].map((g) => {
      const bx = 20 + g * 105;
      return `<rect x="${bx}" y="30" width="90" height="70" rx="14" fill="none" stroke="#a78bfa" stroke-width="3"/>` +
        [0, 1, 2, 3].map((i) => circle(bx + 22 + (i % 2) * 46, 52 + Math.floor(i / 2) * 36, 13, '#a78bfa')).join('');
    }).join('') +
    `<text x="170" y="135" font-size="20" text-anchor="middle" fill="#5e35d6" font-weight="700">12 shared into 3 groups = 4 each</text>`
  ),
  money: SVG(
    circle(60, 65, 34, '#ffc93c', '£1', '#7a5c00') +
    circle(140, 65, 26, '#cfa600', '50p', '#fff') +
    circle(210, 65, 22, '#bdbdbd', '20p', '#fff') +
    circle(272, 65, 20, '#d98a3b', '5p', '#fff') +
    `<text x="170" y="135" font-size="19" text-anchor="middle" fill="#5e35d6" font-weight="700">100 pence (p) = £1</text>`
  ),
  time: SVG(
    `<circle cx="100" cy="80" r="60" fill="#fff" stroke="#ffc93c" stroke-width="8"/>` +
    [12, 3, 6, 9].map((n, i) => { const a = (i * 90 - 90) * Math.PI / 180; return `<text x="${100 + Math.cos(a) * 44}" y="${85 + Math.sin(a) * 44}" font-size="16" text-anchor="middle" fill="#5e35d6" font-weight="700">${n}</text>`; }).join('') +
    `<line x1="100" y1="80" x2="100" y2="42" stroke="#ff6b6b" stroke-width="5" stroke-linecap="round"/>` +
    `<line x1="100" y1="80" x2="132" y2="80" stroke="#5e35d6" stroke-width="5" stroke-linecap="round"/>` +
    `<circle cx="100" cy="80" r="5" fill="#5e35d6"/>` +
    `<text x="250" y="75" font-size="40" text-anchor="middle" fill="#5e35d6" font-weight="700">3:00</text>` +
    `<text x="250" y="110" font-size="18" text-anchor="middle" fill="#5e35d6" font-weight="700">3 o'clock</text>`
  ),
  fractions: SVG(
    (() => {
      const cx = 90, cy = 80, r = 56; let s = '';
      const cols = ['#ff6b6b', '#ffd9d9', '#ffd9d9', '#ffd9d9'];
      for (let i = 0; i < 4; i++) {
        const a0 = (i * 90 - 90) * Math.PI / 180, a1 = ((i + 1) * 90 - 90) * Math.PI / 180;
        s += `<path d="M${cx},${cy} L${cx + r * Math.cos(a0)},${cy + r * Math.sin(a0)} A${r},${r} 0 0 1 ${cx + r * Math.cos(a1)},${cy + r * Math.sin(a1)} Z" fill="${cols[i]}" stroke="#fff" stroke-width="3"/>`;
      }
      return s;
    })() +
    `<text x="240" y="70" font-size="34" text-anchor="middle" fill="#5e35d6" font-weight="700">1/4</text>` +
    `<text x="240" y="105" font-size="17" text-anchor="middle" fill="#5e35d6" font-weight="700">one quarter</text>` +
    `<text x="170" y="155" font-size="18" text-anchor="middle" fill="#5e35d6" font-weight="700">1 piece out of 4 equal pieces</text>`
  ),
  decimals: SVG(
    `<line x1="30" y1="70" x2="310" y2="70" stroke="#38bdf8" stroke-width="4"/>` +
    [0, 0.5, 1].map((v, i) => { const x = 30 + v * 280; return `<line x1="${x}" y1="60" x2="${x}" y2="80" stroke="#38bdf8" stroke-width="4"/><text x="${x}" y="105" font-size="18" text-anchor="middle" fill="#5e35d6" font-weight="700">${v.toFixed(1)}</text>`; }).join('') +
    `<circle cx="170" cy="70" r="9" fill="#ff6b6b"/>` +
    `<text x="170" y="145" font-size="18" text-anchor="middle" fill="#5e35d6" font-weight="700">0.5 is halfway between 0 and 1</text>`
  ),
  ratios: SVG(
    `<rect x="40" y="50" width="40" height="40" rx="8" fill="#ff6b6b"/>` +
    sign(110, 80, ':') +
    `<rect x="140" y="50" width="40" height="40" rx="8" fill="#38bdf8"/>` +
    `<rect x="190" y="50" width="40" height="40" rx="8" fill="#38bdf8"/>` +
    `<text x="60" y="115" font-size="16" text-anchor="middle" fill="#5e35d6" font-weight="700">1 red</text>` +
    `<text x="185" y="115" font-size="16" text-anchor="middle" fill="#5e35d6" font-weight="700">2 blue</text>` +
    `<text x="170" y="150" font-size="18" text-anchor="middle" fill="#5e35d6" font-weight="700">For every 1 red there are 2 blue</text>`
  ),
  proportions: SVG(
    emo(55, 60, 30, '🥭') + `<text x="55" y="95" font-size="16" text-anchor="middle" fill="#5e35d6" font-weight="700">1 = 20p</text>` +
    sign(110, 60, '→') +
    emo(150, 60, 28, '🥭') + emo(185, 60, 28, '🥭') + emo(220, 60, 28, '🥭') +
    `<text x="185" y="95" font-size="16" text-anchor="middle" fill="#5e35d6" font-weight="700">3 = 60p</text>` +
    `<text x="170" y="145" font-size="18" text-anchor="middle" fill="#5e35d6" font-weight="700">3 times as many → 3 times the cost</text>`
  ),
};

export const TOPICS = [
  {
    id: 'counting', name: 'Counting Fun', emoji: '🔢', color: '#38bdf8', unlockNext: 12,
    guide: {
      intro: "Numbers are everywhere! On buses 🚌, on doors, on clocks. Counting is just saying numbers in order: 1, 2, 3, 4, 5...",
      diagram: DIAGRAMS.counting,
      points: [
        ['👉', 'Count things one at a time and say each number out loud.'],
        ['🔜', 'After a number comes the next one: after 6 comes 7.'],
        ['🔢', 'You can skip count too: 2, 4, 6, 8... or 5, 10, 15!'],
      ],
      examples: ['Count the apples: 🍎🍎🍎 — that is **3** apples.', 'What comes after **7**? It is **8**.', 'Skip count by 2: 2, 4, 6, **8**.'],
    },
  },
  {
    id: 'addition', name: 'Adding Up', emoji: '➕', color: '#36cf8b', unlockNext: 15,
    guide: {
      intro: 'Adding means putting things together to make a bigger group. The + sign means "and".',
      diagram: DIAGRAMS.addition,
      points: [
        ['🤝', 'When you add, the number gets bigger.'],
        ['🖐️', 'You can count on your fingers to help!'],
        ['🥭', 'If you have 2 mangoes and get 3 more, count them all: 1,2,3,4,5.'],
      ],
      examples: ['2 + 3 means 2 things and 3 more = **5**.', 'Suveera has 4 stickers and Sneha gives 2 more = **6** stickers.'],
    },
  },
  {
    id: 'subtraction', name: 'Taking Away', emoji: '➖', color: '#ff6b6b', unlockNext: 15,
    guide: {
      intro: 'Taking away (subtracting) means some things go away, so the group gets smaller. The − sign means "take away".',
      diagram: DIAGRAMS.subtraction,
      points: [
        ['📉', 'When you take away, the number gets smaller.'],
        ['🍪', 'If you eat some biscuits, there are fewer left!'],
        ['🖐️', 'Start at the big number and count back.'],
      ],
      examples: ['5 − 2 means 5 things, take 2 away = **3** left.', 'Suveera had 6 grapes and ate 2, so **4** grapes are left.'],
    },
  },
  {
    id: 'multiplication', name: 'Times Tables', emoji: '✖️', color: '#ff5ca8', unlockNext: 15,
    guide: {
      intro: 'Multiplying is a fast way to add the same number lots of times. 3 × 4 means "3 groups of 4".',
      diagram: DIAGRAMS.multiplication,
      points: [
        ['🍱', '3 plates with 4 rotis each = 3 × 4 = 12 rotis.'],
        ['➕', '3 × 4 is the same as 4 + 4 + 4.'],
        ['⚡', 'Times tables help you count quickly!'],
      ],
      examples: ['2 × 5 means 2 groups of 5 = **10**.', '4 boxes with 3 crayons each = 4 × 3 = **12** crayons.'],
    },
  },
  {
    id: 'division', name: 'Sharing Out', emoji: '➗', color: '#a78bfa', unlockNext: 15,
    guide: {
      intro: 'Dividing means sharing things equally into groups. 12 ÷ 3 means "share 12 into 3 equal groups".',
      diagram: DIAGRAMS.division,
      points: [
        ['🤲', 'Everyone gets the same amount — that is fair sharing.'],
        ['🍬', '12 sweets shared between 4 friends = 3 sweets each.'],
        ['🔄', 'Dividing is the opposite of multiplying.'],
      ],
      examples: ['10 ÷ 2 means share 10 into 2 groups = **5** each.', 'Share 12 laddoos between 3 friends = **4** laddoos each.'],
    },
  },
  {
    id: 'money', name: 'Pounds & Pence', emoji: '💷', color: '#36cf8b', unlockNext: 15,
    guide: {
      intro: 'In London we use pounds (£) and pence (p) to buy things. 100 pence make 1 pound.',
      diagram: DIAGRAMS.money,
      points: [
        ['💷', '£1 = 100p.'],
        ['🛒', 'Add up the prices to know how much to pay.'],
        ['🔁', 'Change is the money you get back if you pay too much.'],
      ],
      examples: ['50p + 50p = **£1.00**.', 'A samosa is 40p. Two samosas cost 40p + 40p = **80p**.', 'Pay £1 for an 80p drink, change is **20p**.'],
    },
  },
  {
    id: 'time', name: 'Telling Time', emoji: '🕐', color: '#ffc93c', unlockNext: 15,
    guide: {
      intro: "Clocks tell us the time. We write time with hours and minutes, like 3:00 (three o'clock).",
      diagram: DIAGRAMS.time,
      points: [
        ['🕒', "o'clock means the minutes are 00, like 3:00."],
        ['🕞', 'Half past means 30 minutes, like 3:30.'],
        ['⏩', 'You can count hours forward to find a later time.'],
      ],
      examples: ["7 o'clock is written **7:00**.", 'Half past 4 is written **4:30**.', 'It is 2:00. In 3 hours it will be **5:00**.'],
    },
  },
  {
    id: 'fractions', name: 'Yummy Fractions', emoji: '🍕', color: '#ff6b6b', unlockNext: 15,
    guide: {
      intro: 'A fraction is a part of a whole. If you cut a pizza into equal pieces, each piece is a fraction.',
      diagram: DIAGRAMS.fractions,
      points: [
        ['🍕', 'Cut into 2 equal parts → each part is one half (1/2).'],
        ['🍫', 'Cut into 4 equal parts → each is one quarter (1/4).'],
        ['🔢', 'Half of 8 is 4. A quarter of 8 is 2.'],
      ],
      examples: ['Half of 6 mangoes = **3** mangoes.', 'A quarter of 8 grapes = **2** grapes.', '1/2 is bigger than 1/4.'],
    },
  },
  {
    id: 'decimals', name: 'Decimal Points', emoji: '🔟', color: '#38bdf8', unlockNext: 15,
    guide: {
      intro: 'A decimal point splits whole numbers from parts. We see it a lot in money: £1.50 means 1 pound and 50 pence.',
      diagram: DIAGRAMS.decimals,
      points: [
        ['•', 'The dot is the decimal point: 1.5.'],
        ['💷', '£0.50 is the same as 50p.'],
        ['➕', '0.5 + 0.5 = 1.0 (one whole).'],
      ],
      examples: ['0.5 + 0.5 = **1.0**.', 'A mango is £0.80. Two mangoes = **£1.60**.'],
    },
  },
  {
    id: 'ratios', name: 'Ratios', emoji: '🎨', color: '#a78bfa', unlockNext: 15,
    guide: {
      intro: 'A ratio compares two amounts. "For every 1 red, there are 2 blue" is a ratio of 1 to 2.',
      diagram: DIAGRAMS.ratios,
      points: [
        ['🎨', 'Ratios tell you how many of one thing for another.'],
        ['🔁', 'If the ratio is 1 to 2 and you have 3 reds, you need 6 blues.'],
        ['🍪', 'Great for sharing fairly in groups!'],
      ],
      examples: ['For every 1 dog there are 2 cats. With 3 dogs → **6** cats.', 'Mix 1 cup juice to 2 cups water. With 2 cups juice → **4** cups water.'],
    },
  },
  {
    id: 'proportions', name: 'Proportions', emoji: '⚖️', color: '#ffc93c', unlockNext: 9999,
    guide: {
      intro: 'Proportions help us scale things up or down fairly. If you know the cost of a few, you can work out the cost of more.',
      diagram: DIAGRAMS.proportions,
      points: [
        ['⚖️', 'Find the value of one, then multiply.'],
        ['🛒', 'If 2 apples cost 40p, then 1 apple costs 20p.'],
        ['📈', 'So 4 apples cost 80p.'],
      ],
      examples: ['If 1 samosa costs 30p, then 3 samosas cost **90p**.', 'If 2 mangoes cost 60p, then 4 mangoes cost **£1.20**.'],
    },
  },
];

export const TOPIC_BY_ID = Object.fromEntries(TOPICS.map((t) => [t.id, t]));
