// Vercel serverless function — GET/POST /api/player/:name
// vercel.json maps /api/player/<name> to this file with ?name=<name>.
import { loadPlayer, savePlayer } from '../server/core.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const name = req.query.name;
  try {
    if (req.method === 'GET') {
      return res.status(200).json(await loadPlayer(name));
    }
    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      const result = await savePlayer(name, body);
      return res.status(result.error ? 400 : 200).json(result);
    }
    return res.status(405).json({ error: 'method not allowed' });
  } catch (e) {
    return res.status(500).json({ error: 'server error' });
  }
}
