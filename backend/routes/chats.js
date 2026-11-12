import express from 'express';
import { query } from '../config/db.js';
import { generateAIChatReply } from '../services/ai.js';

const router = express.Router();

// GET /api/chats/ - List all chat sessions
router.get('/', async (req, res) => {
  try {
    const sql = `
      SELECT 
        s.id,
        s.title,
        s.created_at,
        s.updated_at,
        COALESCE(
          json_agg(
            json_build_object(
              'id', m.id,
              'session', m.session_id,
              'role', m.role,
              'text', m.text,
              'created_at', m.created_at
            ) ORDER BY m.created_at ASC
          ) FILTER (WHERE m.id IS NOT NULL),
          '[]'
        ) AS messages
      FROM chat_sessions s
      LEFT JOIN chat_messages m ON m.session_id = s.id
      GROUP BY s.id
      ORDER BY s.updated_at DESC;
    `;
    const result = await query(sql);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching chat sessions:', err);
    res.status(500).json({ error: 'Failed to fetch chat sessions' });
  }
});

// POST /api/chats/ - Create a new chat session
router.post('/', async (req, res) => {
  try {
    const countRes = await query('SELECT COUNT(*) FROM chat_sessions');
    const nextNum = parseInt(countRes.rows[0].count, 10) + 1;
    const title = `Chat ${nextNum}`;

    const insertRes = await query(
      'INSERT INTO chat_sessions (title) VALUES ($1) RETURNING *',
      [title]
    );

    const newSession = insertRes.rows[0];
    res.status(201).json({
      ...newSession,
      messages: [],
    });
  } catch (err) {
    console.error('Error creating chat session:', err);
    res.status(500).json({ error: 'Failed to create chat session' });
  }
});

// GET /api/chats/:id/ - Get chat session details
router.get('/:id', async (req, res) => {
  const sessionId = parseInt(req.params.id, 10);
  if (isNaN(sessionId)) {
    return res.status(400).json({ error: 'Invalid session ID' });
  }

  try {
    const sql = `
      SELECT 
        s.id,
        s.title,
        s.created_at,
        s.updated_at,
        COALESCE(
          json_agg(
            json_build_object(
              'id', m.id,
              'session', m.session_id,
              'role', m.role,
              'text', m.text,
              'created_at', m.created_at
            ) ORDER BY m.created_at ASC
          ) FILTER (WHERE m.id IS NOT NULL),
          '[]'
        ) AS messages
      FROM chat_sessions s
      LEFT JOIN chat_messages m ON m.session_id = s.id
      WHERE s.id = $1
      GROUP BY s.id;
    `;
    const result = await query(sql, [sessionId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Chat session not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching chat session details:', err);
    res.status(500).json({ error: 'Failed to fetch session details' });
  }
});

// POST /api/chats/:id/message/ - Send message in chat session
router.post('/:id/message', async (req, res) => {
  const sessionId = parseInt(req.params.id, 10);
  if (isNaN(sessionId)) {
    return res.status(400).json({ error: 'Invalid session ID' });
  }

  const userText = (req.body.text || '').trim();
  if (!userText) {
    return res.status(400).json({ error: 'Message text is required' });
  }

  try {
    // Verify session exists
    const sessionRes = await query('SELECT * FROM chat_sessions WHERE id = $1', [sessionId]);
    if (sessionRes.rows.length === 0) {
      return res.status(404).json({ error: 'Chat session not found' });
    }
    const session = sessionRes.rows[0];

    // Check message count in session
    const msgCountRes = await query(
      'SELECT COUNT(*) FROM chat_messages WHERE session_id = $1',
      [sessionId]
    );
    const isFirstMessage = parseInt(msgCountRes.rows[0].count, 10) === 0;

    // 1. Save user message to PostgreSQL
    const userMsgRes = await query(
      `INSERT INTO chat_messages (session_id, role, text) 
       VALUES ($1, 'user', $2) 
       RETURNING id, session_id AS session, role, text, created_at`,
      [sessionId, userText]
    );
    const userMsg = userMsgRes.rows[0];

    // 2. Update session title if first message
    if (isFirstMessage) {
      const newTitle = userText.slice(0, 30) + (userText.length > 30 ? '...' : '');
      await query('UPDATE chat_sessions SET title = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [
        newTitle,
        sessionId,
      ]);
    }

    // 3. Fetch past messages to pass to Gemini
    const pastRes = await query(
      'SELECT role, text FROM chat_messages WHERE session_id = $1 ORDER BY created_at ASC',
      [sessionId]
    );

    // 4. Generate AI reply (Gemini or smart RAWG fallback)
    const replyText = await generateAIChatReply(pastRes.rows, userText);

    // 5. Save AI response to PostgreSQL
    const modelMsgRes = await query(
      `INSERT INTO chat_messages (session_id, role, text) 
       VALUES ($1, 'model', $2) 
       RETURNING id, session_id AS session, role, text, created_at`,
      [sessionId, replyText]
    );
    const modelMsg = modelMsgRes.rows[0];

    // 6. Update session updated_at
    await query('UPDATE chat_sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = $1', [sessionId]);

    // 7. Fetch full updated session with all messages
    const updatedSessionSql = `
      SELECT 
        s.id,
        s.title,
        s.created_at,
        s.updated_at,
        COALESCE(
          json_agg(
            json_build_object(
              'id', m.id,
              'session', m.session_id,
              'role', m.role,
              'text', m.text,
              'created_at', m.created_at
            ) ORDER BY m.created_at ASC
          ) FILTER (WHERE m.id IS NOT NULL),
          '[]'
        ) AS messages
      FROM chat_sessions s
      LEFT JOIN chat_messages m ON m.session_id = s.id
      WHERE s.id = $1
      GROUP BY s.id;
    `;
    const updatedSessionRes = await query(updatedSessionSql, [sessionId]);

    res.json({
      user_message: userMsg,
      model_message: modelMsg,
      session: updatedSessionRes.rows[0],
    });
  } catch (err) {
    console.error('Error handling chat message:', err);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
});

// DELETE /api/chats/:id/ - Delete a chat session
router.delete('/:id', async (req, res) => {
  const sessionId = parseInt(req.params.id, 10);
  if (isNaN(sessionId)) {
    return res.status(400).json({ error: 'Invalid session ID' });
  }

  try {
    const result = await query('DELETE FROM chat_sessions WHERE id = $1 RETURNING id', [sessionId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Chat session not found' });
    }
    res.json({ message: 'Chat session deleted successfully' });
  } catch (err) {
    console.error('Error deleting chat session:', err);
    res.status(500).json({ error: 'Failed to delete chat session' });
  }
});

export default router;

