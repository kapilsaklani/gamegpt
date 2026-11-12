# GameBot - PERN Stack AI Game Recommendation System

This project is a full-stack AI Game Recommendation application built on the **PERN** stack (**P**ostgreSQL, **E**xpress.js, **R**eact, **N**ode.js).

---

## 🏗️ Architecture (PERN)

- **Database (P)**: PostgreSQL (`game_gpt` database)
- **Backend (E & N)**: Node.js with Express.js REST API (`pg` connection pool, CORS, auto-initializing schemas)
- **Frontend (R)**: React 18, Vite, TailwindCSS, React Router DOM
- **AI Integration**: Google Gemini API with smart game recommendation fallback engine
- **Game Data Integration**: RAWG Video Games Database API

---

## 🚀 Getting Started

### 1. Database Setup (PostgreSQL)

Ensure PostgreSQL is running locally and create the `game_gpt` database:

```bash
# On macOS with Homebrew:
brew services start postgresql@16
createdb game_gpt
```

*(The backend automatically creates all required tables on startup: `chat_sessions`, `chat_messages`, `wishlist_items`, and `feedbacks`.)*

---

### 2. Backend Setup (Node.js & Express)

1. Navigate to the backend folder and install dependencies:
```bash
cd backend
npm install
```

2. Configure environment variables in `backend/.env`:
```env
PORT=5001
PGHOST=localhost
PGPORT=5432
PGDATABASE=game_gpt
PGUSER=postgres
PGPASSWORD=
GEMINI_API_KEY=your_gemini_api_key
RAWG_API_KEY=your_rawg_api_key
```

3. Start the Express backend:
```bash
npm run dev    # with nodemon auto-reload
# or: npm start
```

The Express API will be running at `http://localhost:5001/api/`.

---

### 3. Frontend Setup (React & Vite)

1. From the project root, install frontend dependencies:
```bash
npm install
```

2. Start the Vite development server:
```bash
npm run dev
```

The React frontend will be accessible at `http://localhost:5173/` with automated API proxying to `http://127.0.0.1:5001`.

---

### ⚡ Running Both Frontend & Backend Concurrently

You can also run both simultaneously from the project root:

```bash
npm run dev:all
```

---

## 📡 REST API Endpoints

- `GET /api/health` - Server & database health check
- `GET /api/chats/` - Fetch all saved chat sessions from PostgreSQL
- `POST /api/chats/` - Create a new chat session in PostgreSQL
- `GET /api/chats/:id/` - Fetch chat session history with messages
- `POST /api/chats/:id/message/` - Send a chat message (saves user message & Gemini AI response to PostgreSQL)
- `DELETE /api/chats/:id/` - Delete a chat session
- `GET /api/wishlist/` - Fetch user's wishlisted games from PostgreSQL
- `POST /api/wishlist/` - Add game to PostgreSQL wishlist
- `DELETE /api/wishlist/:id/` - Remove game from PostgreSQL wishlist
- `GET /api/feedback/` - Fetch community feedback & ratings from PostgreSQL
- `POST /api/feedback/` - Save rating and comment to PostgreSQL
- `POST /api/compare/` - Get side-by-side game comparison data via RAWG
