// ============================================================
// Suveera's Magic Maths — player storage
// ------------------------------------------------------------
// Picks the right backing store automatically:
//   • Vercel KV / Upstash Redis  — when its env vars exist
//     (this is what gives real cross-device sync in production)
//   • JSON file                  — for local `node server.js`
//                                  and `vercel dev`
// Zero npm dependencies: KV is reached over its REST API with
// the built-in `fetch`.
// ============================================================

import { promises as fs } from 'node:fs';
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const KV_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
export const usingKV = !!(KV_URL && KV_TOKEN);

// ---------- Vercel KV / Upstash (REST) ----------
async function kvGet(key) {
  const r = await fetch(`${KV_URL}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${KV_TOKEN}` },
  });
  if (!r.ok) throw new Error('KV get ' + r.status);
  const j = await r.json();
  return j.result ? JSON.parse(j.result) : null;
}
async function kvSet(key, value) {
  const r = await fetch(`${KV_URL}/set/${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${KV_TOKEN}` },
    body: JSON.stringify(value),
  });
  if (!r.ok) throw new Error('KV set ' + r.status);
}

// ---------- JSON file (local / fallback) ----------
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Vercel's only writable place is /tmp; locally we keep it in ./data
const FILE = process.env.VERCEL
  ? '/tmp/suveera-players.json'
  : path.join(__dirname, '..', 'data', 'players.json');

async function fileLoad() {
  try { return JSON.parse(await fs.readFile(FILE, 'utf8')) || { players: {} }; }
  catch { return { players: {} }; }
}
async function fileSave(db) {
  const dir = path.dirname(FILE);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const tmp = FILE + '.tmp';
  await fs.writeFile(tmp, JSON.stringify(db));
  await fs.rename(tmp, FILE);
}

// ---------- public API ----------
export async function getPlayer(key) {
  if (usingKV) return kvGet('player:' + key);
  const db = await fileLoad();
  return db.players[key] || null;
}
export async function setPlayer(key, state) {
  if (usingKV) return kvSet('player:' + key, state);
  const db = await fileLoad();
  db.players[key] = state;
  await fileSave(db);
}
