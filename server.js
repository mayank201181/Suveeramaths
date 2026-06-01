// ============================================================
// Suveera's Magic Maths — local Node server
// ------------------------------------------------------------
// For running on your own machine or any Node host:
//     node server.js   →   http://localhost:3000
//
// On Vercel you don't use this file — the /api/*.js serverless
// functions are used instead. Both share server/core.js, so the
// behaviour is identical.  No `npm install` needed.
// ============================================================

import http from 'node:http';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildContent, buildQuestion, loadPlayer, savePlayer } from './server/core.js';
import { usingKV } from './server/store.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;

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
  const filePath = path.normalize(path.join(__dirname, rel));
  if (!filePath.startsWith(__dirname)) { res.writeHead(403); return res.end('Forbidden'); }
  try {
    const data = await fs.readFile(filePath);
    res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  }
}

// ---------- helpers ----------
const sendJSON = (res, code, obj) => {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(obj));
};
const readBody = (req) => new Promise((resolve) => {
  let data = '';
  req.on('data', (c) => { data += c; if (data.length > 1e6) req.destroy(); });
  req.on('end', () => { try { resolve(JSON.parse(data || '{}')); } catch { resolve(null); } });
  req.on('error', () => resolve(null));
});

// ---------- API ----------
async function handleApi(req, res, url) {
  const parts = url.pathname.split('/').filter(Boolean); // ['api', ...]
  if (req.method === 'GET' && parts[1] === 'content') return sendJSON(res, 200, buildContent());
  if (req.method === 'GET' && parts[1] === 'question') {
    return sendJSON(res, 200, buildQuestion({
      topic: url.searchParams.get('topic'),
      difficulty: url.searchParams.get('difficulty'),
      level: url.searchParams.get('level'),
    }));
  }
  if (parts[1] === 'player' && parts[2]) {
    const name = decodeURIComponent(parts[2]);
    if (req.method === 'GET') return sendJSON(res, 200, await loadPlayer(name));
    if (req.method === 'POST') {
      const body = await readBody(req);
      const result = await savePlayer(name, body);
      return sendJSON(res, result.error ? 400 : 200, result);
    }
  }
  sendJSON(res, 404, { error: 'unknown endpoint' });
}

// ---------- server ----------
http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  if (url.pathname.startsWith('/api/')) {
    try { return await handleApi(req, res, url); }
    catch (e) { console.error(e); return sendJSON(res, 500, { error: 'server error' }); }
  }
  return serveStatic(req, res, url.pathname);
}).listen(PORT, () => {
  console.log(`\n  ✨ Suveera's Magic Maths is running!`);
  console.log(`  ➜  Open  http://localhost:${PORT}`);
  console.log(`  ➜  Saving progress to: ${usingKV ? 'Vercel KV / Upstash' : 'local file (data/players.json)'}\n`);
});
