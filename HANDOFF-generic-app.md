# Handoff brief — build a generic kids' Vedic / Mental Maths app (ages 5–12)

Paste this whole file as your first message in the new chat. It tells the
assistant what to build and reuses everything already proven in an existing app
(github.com/mayank201181/Suveeramaths, live at suveeramaths.vercel.app).

---

## 1. What I want
A colourful, kid-friendly **web app to teach and practise Vedic Maths and Mental
Maths**, shareable by link to **any child aged ~5 to ~12**. A child types their
name, picks their age, and gets lessons (shortcuts/sutras) plus endless practice.
It must keep expanding (more questions, more techniques) over time.

This is a GENERIC version of an app I already have for one child. Please START
FROM the architecture below (it's already built and working) rather than from
scratch — then make the genericisation changes in section 5.

## 2. Proven architecture to reuse (copy this design)
- **Pure web app, no framework, no build step.** Vanilla JS ES modules + one CSS
  file. Static `index.html` loads `js/app.js` as `<script type="module">`.
- **Backend = tiny Node, zero npm dependencies.** Deployed on **Vercel** as
  serverless functions in `/api`, plus a local `server.js` for `node server.js`.
  Both share one `server/core.js` so behaviour is identical.
- **Storage:** Vercel KV / Upstash Redis when env vars `KV_REST_API_URL` +
  `KV_REST_API_TOKEN` exist (cross-device sync); else a JSON file. The browser
  also keeps a `localStorage` cache and the client falls back to running fully
  offline if the API is unreachable. (See `server/store.js`, `js/api.js`.)
- **Questions are GENERATED IN CODE, not stored in lists** — so "add more" is
  infinite and each harder batch just scales numbers up. This is the single most
  important idea: see `js/generators.js` (topics) and `js/vedic.js` (techniques).
- **Vercel config matters:** a `vercel.json` is REQUIRED so `/js/**` and `/css/**`
  are served as static assets with correct MIME and `/api/*` routes to functions.
  Without it the page deploys but renders blank (JS/CSS 404). Include it from day
  one. (Exact file is in the existing repo — copy it.)

### File layout (mirror this)
```
index.html
css/styles.css
vercel.json                 # static js/ & css/ + /api routing  ← don't forget
server.js                   # local Node server
server/core.js              # shared request logic
server/store.js             # KV or JSON-file storage
api/content.js              # GET /api/content  (topics + config)
api/question.js             # GET /api/question?topic&difficulty&level
api/player.js               # GET/POST /api/player/:name (mapped via vercel.json)
js/app.js                   # screens + ONE shared quiz engine
js/content.js               # topics, guides, SVG diagrams, word-banks
js/generators.js            # procedural topic-question generators
js/vedic.js                 # Vedic techniques: guides + generators
js/state.js                 # player-state shape + migration
js/storage.js               # browser localStorage cache
js/api.js                   # client <-> server, offline fallback
data/                       # players.json at runtime (git-ignored)
```

## 3. Features that already work (keep all of these)
- Name-to-start; progress saved + synced; "switch player".
- **Two sections sharing one quiz engine**, driven by a section descriptor:
  - **Vedic Maths** (default landing tab): techniques from mental shortcuts to
    real sutras — Friends of 10 & 100 (*all from 9, last from 10*), Doubling &
    Halving, Quick Adding, Clever Subtracting, ×10/×100, the 5/9/11 tricks,
    Squares ending in 5 (*Ekādhikena*), Near a Base (*Nikhilam*), Vertically &
    Crosswise (*Ūrdhva-Tiryak*).
  - **Topics** ("Maths Adventures"): Counting → Adding → Subtracting → Times
    Tables → Division → Money → Time → Fractions → Decimals → Ratios →
    Proportions.
- Each item is a mini-course: **Guide** (intro, steps, worked examples, an SVG
  **diagram**, and a 🔊 read-aloud button).
- **Three difficulty levels:** 🟢 Easy = multiple-choice (tap); 🟡 Medium &
  🔴 Tricky = type the answer (lenient checking accepts `£1.50`, `1.50`, `1.5`,
  `150p`, etc.).
- **💡 Hint** on every question; an elaborate **step-by-step explanation** after
  every answer (read aloud when wrong) so they learn the *why*.
- **Endless practice:** 25 questions to start; **"Add 25 more"** with an optional
  **"a bit harder ⬆️"** that bumps difficulty within the same skill.
- **Crowns 👑 + score ⭐**; reaching a crown goal **unlocks the next** item; plus
  an **"➕ Add another technique/topic"** button to grow the map on demand.
- Read-aloud (Web Speech API, en-GB), gentle Web-Audio sounds, confetti.
- State migration: `ensureShape()` backfills new items/levels so old saves keep
  working when content is added.

## 4. Tech/UX conventions that worked well
- Kid UI: big rounded buttons, Fredoka font, emoji, pastel gradient, tap targets
  sized for small fingers; everything one or two taps deep.
- Generators return `{ text, visual?, answer, accept[], choices[], hint,
  explanation, speak }`. A `numChoices(correct,{spread})` helper builds 4 unique
  MC options including the answer. Validate with a sweep that generates ~hundreds
  of thousands of questions and asserts: 4 distinct choices, answer ∈ choices,
  hint+explanation present.
- Test the serverless handlers with mock `req/res`, and do a jsdom headless
  click-through of the whole UI before declaring done.
- Commit on a feature branch, open a **draft PR**, let Vercel deploy a preview,
  then merge to `main` (production). Always verify the live URL returns 200 for
  `/js/app.js` and `/css/styles.css` after deploy.

## 5. What to CHANGE for the generic ages-5–12 version
1. **Branding:** neutral name like **"Magic Maths"** or **"Vedic Maths for Kids"**
   (no child's name in title, README, or PR text).
2. **Welcome flow:** after the name, add an **age picker** with bands
   **5–6 / 7–8 / 9–10 / 11–12**. Store `age`/`band` in player state. The band sets
   the **starting difficulty/level** per generator (an 11-year-old shouldn't be
   counting pictures of apples; a 5-year-old shouldn't get 2-digit×2-digit).
   Optionally let them change it later in settings.
3. **De-personalise word problems:** the existing app hardcodes family names
   (Sneha/Vighanesh), London places, and £/p. Replace with **generic, swappable
   word-banks**: a small pool of neutral kid names, generic places (park, shop,
   school), and a **currency/region toggle** (£/$/₹ + km/miles) — default to one,
   but make it data-driven so it's easy to localise.
4. **Difficulty scaling by age:** generators already take a `level` param; map
   `band → base level` and let "add harder" climb from there. Make sure each
   technique/topic has sensible content across the full 5–12 range (add a couple
   of harder techniques for the 11–12 end, e.g. multi-digit Nikhilam, squares of
   any 2-digit number, simple percentages).
5. **Keep cross-device sync optional** (Vercel KV) and documented in the README
   with the one-click deploy button.
6. (Nice to have) A lightweight **parent/teacher screen** showing each child's
   crowns/mastery per technique — useful when sharing with many kids.

## 6. Deployment recipe (so the new app goes live cleanly)
- Include `vercel.json` from the start (serve `/js/**`, `/css/**`; route `/api/*`).
- New GitHub repo → import to Vercel → deploy (no build settings needed).
- For sync: Vercel project → Storage → Create Database → KV → connect → redeploy.
- After each deploy, curl-check `/`, `/js/app.js`, `/css/styles.css`, `/api/content`
  all return 200 with correct content-type.

## 7. First message you can literally send
> "Build a generic, kid-friendly Vedic Maths + Mental Maths web app for ages
> 5–12, shareable by link. Use the architecture and feature set described in the
> brief I'm pasting (vanilla JS + zero-dependency Node, Vercel serverless +
> `vercel.json`, code-generated infinite questions, two sections sharing one quiz
> engine, guides with diagrams + read-aloud, 3 levels, hints, explanations,
> crowns, unlocking, KV sync). Then apply the genericisation changes: neutral
> branding, an age-band picker (5–6/7–8/9–10/11–12) that sets starting
> difficulty, generic swappable word-banks with a currency/region toggle, and
> content that scales across the whole age range. Deploy to Vercel and confirm
> the live link works."

---
*Tip: if the new assistant can access the existing repo
`mayank201181/Suveeramaths`, tell it to copy that codebase as the starting point
and just apply section 5 — that's by far the fastest path.*
