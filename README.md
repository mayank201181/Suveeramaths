# Suveera's Magic Maths ✨👑

A colourful, ever-expanding maths playground built for **Suveera** — a young
learner in London who loves numbers (and tracing bus numbers! 🚌). Word problems
use her world: pounds & pence 💷, samosas & mangoes 🥭, Hyde Park, and her mum
**Sneha** and dad **Vighanesh**.

It runs as a small **live web app with a Node backend**, so her crowns and
progress **sync across devices**, and content can keep growing over time. It also
works offline / as a static page (it falls back to running everything in the
browser if the backend isn't reachable).

## Two sections, one game

When Suveera opens the app she lands on **🕉️ Vedic Maths** first. A button
switches over to **🎮 Maths Adventures** (the topics) whenever she likes. Both
sections work exactly the same way (guides, levels, batches, crowns, unlocking),
so everything feels consistent.

### 🕉️ Vedic Maths (the default tab)
Clever short-cuts to do sums **mentally / orally** — Suveera can learn on her own,
or a grown-up can open a technique and teach it. Each technique is a full
mini-course:
- a **Guide** with a friendly explanation, steps, worked examples, an optional
  **diagram**, and a **🔊 Read this to me** button;
- **three levels** — 🟢 Easy (tap), 🟡 Medium & 🔴 Tricky (type the answer), with
  **application / word problems** at the harder levels;
- **endless practice** — 25 questions to start, **"Add 25 more"** for another
  batch, optionally **a bit harder ⬆️**;
- **crowns 👑 + score ⭐**, and the next technique **unlocks** as crowns are won.

Techniques included: Friends of 10 & 100 (*all from 9, last from 10*),
Doubling & Halving, Quick Adding, Clever Subtracting, ×10 & ×100, the 5/9/11
tricks, **Squares ending in 5** (*Ekādhikena*), **Near a Base** (*Nikhilam*), and
**Vertically & Crosswise** (*Ūrdhva-Tiryak*). More can be added any time.

### 🎮 Maths Adventures (topics)
The progressively-unlocking topic track: Counting → Adding → Taking Away → Times
Tables → Sharing Out → Pounds & Pence → Telling Time → Fractions → Decimals →
Ratios → Proportions. Same guide + level + batch + crown system.

## Shared features
- **Type your name to start.** Progress saves to the server and syncs everywhere.
- **💡 Hint** on every question, and an **elaborate, step-by-step explanation**
  after every answer (read aloud when she's wrong) so she learns the *why*.
- **➕ Add another technique / topic** button to grow the map on demand.
- **Read-aloud** 🔊, gentle sounds, and confetti 🎉 — friendly for early readers.

## How it stays endless
Questions are **generated in code** (`js/generators.js` and `js/vedic.js`) rather
than stored in a list, so batches never run out and each harder batch scales up
while staying on the same skill. Typed answers are checked leniently (`£1.50`,
`1.50`, `1.5`, `150p` all accepted).

## Run it locally
No installation needed — the server uses only built-in Node modules.

```bash
node server.js        # then open http://localhost:3000
```

Saved progress lives in `data/players.json` (created automatically, git-ignored).

## Deploy to Vercel (recommended) ▲

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/mayank201181/Suveeramaths)

Built the way Vercel likes it: static files at the root and **serverless
functions** in `/api` (`content`, `question`, `player/[name]`). No build step and
no dependencies.

1. Click the button (or in Vercel: **Add New → Project → Import** this repo).
2. Accept the defaults and **Deploy**. The link is live in ~1 minute. 🎈

**Cross-device progress sync (Vercel KV):** in your project go to
**Storage → Create Database → KV** (Upstash Redis) and connect it. That adds the
`KV_REST_API_URL` / `KV_REST_API_TOKEN` env vars; the app detects them and starts
syncing — **redeploy** once. Without KV the app still works fully; progress is
just saved per-device in the browser.

> It also runs on any Node host (Render, Railway, Fly.io, a Raspberry Pi…):
> start command `npm start`; the host's `PORT` is picked up automatically.

## Project layout
```
index.html             # shell
css/styles.css         # kid-friendly styles, animations, confetti
api/content.js         # Vercel function: topics + config
api/question.js        # Vercel function: one generated topic question
api/player/[name].js   # Vercel function: load/save a player
server.js              # local Node server (same behaviour as the functions)
server/core.js         # shared request logic                       (shared)
server/store.js        # Vercel KV / Upstash, or JSON-file fallback (shared)
js/content.js          # topics, guides, SVG diagrams, word-banks   (shared)
js/generators.js       # procedural topic questions                 (shared)
js/vedic.js            # Vedic techniques: guides + generators       (shared)
js/state.js            # player-state shape + migration             (shared)
js/storage.js          # browser local cache (offline fallback)
js/api.js              # client <-> server, with offline fallback
js/app.js              # screens, the shared quiz engine, sounds, speech
data/                  # players.json saved here at runtime (git-ignored)
```

## Adding more content later
- **A Vedic technique:** add an entry to `VEDIC` in `js/vedic.js` (name, emoji,
  guide, crown goal, and a `gen(difficulty, level)` function).
- **A topic:** add an entry to `TOPICS` in `js/content.js` and a matching
  generator block in `js/generators.js`.

Either appears automatically as a new card (revealed via **Add another…**), and
Suveera just refreshes the same link. 🌈
