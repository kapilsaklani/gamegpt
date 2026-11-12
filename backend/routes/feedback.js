import express from 'express';
import { query } from '../config/db.js';

const router = express.Router();

// GET /api/feedback/ - Get all feedback submissions
router.get('/', async (req, res) => {
  try {
    const result = await query(
      'SELECT id, rating, comment, created_at FROM feedbacks ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching feedbacks:', err);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

// POST /api/feedback/ - Submit feedback
router.post('/', async (req, res) => {
  const rating = parseInt(req.body.rating, 10);
  const comment = (req.body.comment || '').trim();

  if (isNaN(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be an integer between 1 and 5' });
  }

  try {
    const result = await query(
      'INSERT INTO feedbacks (rating, comment) VALUES ($1, $2) RETURNING id, rating, comment, created_at',
      [rating, comment]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error saving feedback:', err);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

export default router;

