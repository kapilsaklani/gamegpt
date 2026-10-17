# GameBot - Full Stack AI Game Recommendation System

This project is a full-stack AI Game Recommendation application converted into **Django + React + PostgreSQL**.

---

## 🏗️ Architecture

- **Frontend**: React 18, Vite, TailwindCSS, React Router DOM
- **Backend**: Django 6.x, Django REST Framework (DRF), `django-cors-headers`
- **Database**: PostgreSQL (`game_gpt` database)
- **AI Integration**: Google Gemini 1.5 Pro API (via Django Backend)
- **Game Data Integration**: RAWG Video Games Database API

---

## 🚀 Getting Started

### 1. Database Setup (PostgreSQL)

Ensure PostgreSQL is running locally:
```bash
brew services start postgresql@16
psql postgres -c "CREATE DATABASE game_gpt;"
```

### 2. Django Backend Setup

1. Activate virtual environment and install dependencies:
```bash
source venv/bin/activate
pip install -r requirements.txt  # or: pip install django djangorestframework django-cors-headers psycopg2-binary requests python-dotenv
```

2. Run Database Migrations:
```bash
cd backend
python manage.py makemigrations
python manage.py migrate
```

3. Start Django Development Server:
```bash
python manage.py runserver 8000
```

The Django REST API will be available at `http://127.0.0.1:8000/api/`.

---

## 💻 3. React Frontend Setup

1. Install frontend dependencies:
```bash
npm install
```

2. Run Development Server:
```bash
npm run dev
```

The Vite dev server will start at `http://localhost:5173/game-gpt/` with automated API proxying to `http://127.0.0.1:8000`.

---

## 📡 REST API Endpoints

- `GET /api/chats/` - Fetch all saved chat sessions from PostgreSQL
- `POST /api/chats/` - Create a new chat session in PostgreSQL
- `GET /api/chats/<id>/` - Fetch chat session history with messages
- `POST /api/chats/<id>/message/` - Send a chat message (saves user message & Gemini AI response to PostgreSQL)
- `GET /api/wishlist/` - Fetch user's wishlisted games from PostgreSQL
- `POST /api/wishlist/` - Add game to PostgreSQL wishlist
- `DELETE /api/wishlist/<id>/` - Remove game from PostgreSQL wishlist
- `GET /api/feedback/` - Fetch overall feedback & ratings from PostgreSQL
- `POST /api/feedback/` - Save rating and comment to PostgreSQL
- `POST /api/compare/` - Get game comparison data for 2 games
