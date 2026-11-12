import pkg from 'pg';
const { Pool } = pkg;
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const poolConfig = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL }
  : {
      user: process.env.PGUSER || process.env.DB_USER || process.env.USER || 'postgres',
      host: process.env.PGHOST || process.env.DB_HOST || 'localhost',
      database: process.env.PGDATABASE || process.env.DB_NAME || 'game_gpt',
      password: process.env.PGPASSWORD || process.env.DB_PASSWORD || '',
      port: parseInt(process.env.PGPORT || process.env.DB_PORT || '5432', 10),
    };

export const pool = new Pool(poolConfig);

export const query = (text, params) => pool.query(text, params);

export async function initDB() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Chat sessions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS chat_sessions (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) DEFAULT 'New Chat',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Chat messages table
    await client.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id SERIAL PRIMARY KEY,
        session_id INTEGER NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
        role VARCHAR(20) NOT NULL,
        text TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Wishlist items table
    await client.query(`
      CREATE TABLE IF NOT EXISTS wishlist_items (
        id SERIAL PRIMARY KEY,
        game_id VARCHAR(100) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        image TEXT DEFAULT '',
        rating DOUBLE PRECISION DEFAULT 0.0,
        added_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Feedback table
    await client.query(`
      CREATE TABLE IF NOT EXISTS feedbacks (
        id SERIAL PRIMARY KEY,
        rating INTEGER NOT NULL,
        comment TEXT DEFAULT '',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query('COMMIT');
    console.log('✅ PostgreSQL database tables initialized successfully');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Failed to initialize PostgreSQL tables:', err);
    throw err;
  } finally {
    client.release();
  }
}

