import express from 'express';
import { query } from '../config/db.js';

const router = express.Router();

// GET /api/wishlist/ - Fetch all wishlist items
router.get('/', async (req, res) => {
  try {
    const result = await query(
      'SELECT id, game_id, title, image, rating, added_at FROM wishlist_items ORDER BY added_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching wishlist:', err);
    res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
});

// POST /api/wishlist/ - Add game to wishlist
router.post('/', async (req, res) => {
  const gameId = String(req.body.game_id || req.body.id || '').trim();
  const title = (req.body.title || req.body.name || '').trim();
  const image = req.body.image || req.body.background_image || '';
  const rating = parseFloat(req.body.rating || 0.0) || 0.0;

  if (!gameId) {
    return res.status(400).json({ error: 'game_id is required' });
  }

  try {
    // Check if already in wishlist
    const existing = await query('SELECT * FROM wishlist_items WHERE game_id = $1', [gameId]);
    if (existing.rows.length > 0) {
      return res.status(200).json({
        message: 'Already in wishlist',
        item: existing.rows[0],
      });
    }

    const insertRes = await query(
      `INSERT INTO wishlist_items (game_id, title, image, rating)
       VALUES ($1, $2, $3, $4)
       RETURNING id, game_id, title, image, rating, added_at`,
      [gameId, title, image, rating]
    );

    res.status(201).json(insertRes.rows[0]);
  } catch (err) {
    console.error('Error adding to wishlist:', err);
    res.status(500).json({ error: 'Failed to add item to wishlist' });
  }
});

// DELETE /api/wishlist/:id/ - Remove item from wishlist
router.delete('/:id', async (req, res) => {
  const param = req.params.id;

  try {
    const result = await query(
      'DELETE FROM wishlist_items WHERE id::text = $1 OR game_id = $1 RETURNING id',
      [param]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Wishlist item not found' });
    }

    res.json({ message: 'Item removed from wishlist successfully' });
  } catch (err) {
    console.error('Error removing from wishlist:', err);
    res.status(500).json({ error: 'Failed to remove item from wishlist' });
  }
});

export default router;

