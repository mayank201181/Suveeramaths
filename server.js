// ============================================================
// Suveera's Magic Maths — tiny zero-dependency Node server
// ------------------------------------------------------------
//  • Serves the web app (static files)
//  • Syncs each player's progress across devices (JSON file)
//  • Serves topics/guides and freshly generated questions
//
//  Run with:  node server.js     (then open http://localhost:3000)
//  No `npm install` needed — uses only built-in Node modules.
// ============================================================

import http from 'node:http';
import { promises as fs } from 'node:fs';
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { TOPICS, POINTS, CROWNS, BATCH_SIZE } from './js/content.js';
import { generateQuestion } from './js/generators.js';
import { newState, ensureShape } from './js/state.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'players.json');

// ---------- simple JSON player store ----------
if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
let db = { players: {} };
try {
  if (existsSync(DB_FILE)) db = JSON.parse(await fs.readFile(DB_FILE, 'utf8')) || { players: {} };
} catch { db = { players: {} }; }
if (!db.players) db.players = {};

let writeTimer = null;
function persist() {
  // debounce writes so rapid answers don't thrash the disk
  clearTimeout(writeTimer);
  writeTimer = setTimeout(async () => {
    try {
      const tmp = DB_FILE + '.tmp';
      await fs.writeFile(tmp, JSON.stringify(db));
      await fs.rename(tmp, DB_FILE);
    } catch (e) { console.error('Could not save players:', e.message); }
  }, 300);
}

const keyFor = (name) => String(name || '').trim().toLowerCase().slice(0, 40) || 'suveera';

// ---------- static file serving ----------
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.png': 'image/png',
  '.webmanifest': 'application/manifest+json',
};

async function serveStatic(req, res, urlPath) {
  let rel = decodeURIComponent(urlPath.split('?')[0]);
  if (rel === '/' || rel === '') rel = '/index.html';
  // prevent directory traversal
  const filePath = path.normalize(path.join(__dirname, rel));
  if (!filePath.startsWith(__dirname)) { res.writeHead(403); return res.end('Forbidden'); }
  try {
    const data = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  }
}

// ---------- helpers ----------
const sendJSON = (res, code, obj) => {
  const body = JSON.stringify(obj);
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(body);
};
function readBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (c) => { data += c; if (data.length > 1e6) req.destroy(); });
    req.on('end', () => { try { resolve(JSON.parse(data || '{}')); } catch { resolve(null); } });
    req.on('error', () => resolve(null));
  });
}

// ---------- API ----------
async function handleApi(req, res, url) {
  const parts = url.pathname.split('/').filter(Boolean); // e.g. ['api','player','suveera']

  // GET /api/content  → topics, guides (with diagrams), config
  if (req.method === 'GET' && parts[1] === 'content') {
    return sendJSON(res, 200, { topics: TOPICS, points: POINTS, crowns: CROWNS, batchSize: BATCH_SIZE });
  }

  // GET /api/question?topic=&difficulty=&level=
  if (req.method === 'GET' && parts[1] === 'question') {
    const topic = url.searchParams.get('topic');
    const difficulty = url.searchParams.get('difficulty') || 'basic';
    const level = parseInt(url.searchParams.get('level') || '1', 10);
    return sendJSON(res, 200, generateQuestion(topic, difficulty, level));
  }

  // /api/player/:name
  if (parts[1] === 'player' && parts[2]) {
    const key = keyFor(parts[2]);
    if (req.method === 'GET') {
      let state = db.players[key];
      if (!state) { state = newState(parts[2]); db.players[key] = state; persist(); }
      else state = ensureShape(state);
      return sendJSON(res, 200, state);
    }
    if (req.method === 'POST') {
      const body = await readBody(req);
      if (!body) return sendJSON(res, 400, { error: 'bad body' });
      const state = ensureShape(body, parts[2]);
      db.players[key] = state;
      persist();
      return sendJSON(res, 200, { ok: true });
    }
  }

  sendJSON(res, 404, { error: 'unknown endpoint' });
}

// ---------- server ----------
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  if (url.pathname.startsWith('/api/')) {
    try { return await handleApi(req, res, url); }
    catch (e) { console.error(e); return sendJSON(res, 500, { error: 'server error' }); }
  }
  return serveStatic(req, res, url.pathname);
});

server.listen(PORT, () => {
  console.log(`\n  ✨ Suveera's Magic Maths is running!`);
  console.log(`  ➜  Open  http://localhost:${PORT}\n`);
});
