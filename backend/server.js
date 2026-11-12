import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });
import { initDB } from './config/db.js';
import chatsRouter from './routes/chats.js';
import wishlistRouter from './routes/wishlist.js';
import feedbackRouter from './routes/feedback.js';
import compareRouter from './routes/compare.js';
import gamesRouter from './routes/games.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Request logger for development
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'GameBot API',
    stack: 'PERN (PostgreSQL, Express, React, Node.js)',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/chats', chatsRouter);
app.use('/api/wishlist', wishlistRouter);
app.use('/api/feedback', feedbackRouter);
app.use('/api/compare', compareRouter);
app.use('/api/games', gamesRouter);

// 404 Handler for unhandled routes
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

// Initialize database and start listening
async function startServer() {
  try {
    await initDB();
    app.listen(PORT, () => {
      console.log(`🚀 GameBot PERN Express server running at http://localhost:${PORT}`);
      console.log(`📡 API Endpoints available at http://localhost:${PORT}/api/`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
