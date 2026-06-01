// Vercel serverless function — GET /api/question?topic=&difficulty=&level=
import { buildQuestion } from '../server/core.js';

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json(buildQuestion(req.query || {}));
}
