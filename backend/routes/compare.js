import express from 'express';
import { compareGames } from '../services/rawg.js';

const router = express.Router();

// POST /api/compare/ - Compare games via RAWG API
router.post('/', async (req, res) => {
  const games = req.body.games;

  if (!Array.isArray(games) || games.length < 2) {
    return res.status(400).json({ error: 'Provide at least 2 game names to compare' });
  }

  try {
    const results = await compareGames(games);
    res.json(results);
  } catch (err) {
    console.error('Error comparing games:', err);
    res.status(500).json({ error: 'Failed to compare games' });
  }
});

export default router;

