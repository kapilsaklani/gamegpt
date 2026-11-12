import express from 'express';
import { fetchGames, fetchGameDetails } from '../services/rawg.js';

const router = express.Router();

// GET /api/games - Fetch popular/trending games
router.get('/', async (req, res) => {
  const ordering = req.query.ordering || '-rating';
  const pageSize = parseInt(req.query.page_size, 10) || 5;

  try {
    const games = await fetchGames(ordering, pageSize);
    res.json(games);
  } catch (err) {
    console.error('Error in /api/games:', err);
    res.status(500).json({ error: 'Failed to fetch games' });
  }
});

// GET /api/games/:id - Fetch game details by RAWG ID
router.get('/:id', async (req, res) => {
  const gameId = req.params.id;

  try {
    const details = await fetchGameDetails(gameId);
    if (!details) {
      return res.status(404).json({ error: 'Game details not found' });
    }
    res.json(details);
  } catch (err) {
    console.error(`Error in /api/games/${gameId}:`, err);
    res.status(500).json({ error: 'Failed to fetch game details' });
  }
});

export default router;

