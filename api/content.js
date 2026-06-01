// Vercel serverless function — GET /api/content
import { buildContent } from '../server/core.js';

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json(buildContent());
}
