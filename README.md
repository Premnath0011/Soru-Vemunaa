# Soru — Creator Management App

A full-stack web app for managing your Instagram/YouTube food-review channel:
projects, income & expenses, ideas, reports, and schedule — all backed by a
real database.

- **Frontend:** React (Create React App) + React Router + Axios
- **Backend:** Node.js + Express + MongoDB (Mongoose)

---

## 1. Project structure

```
Soru/
├── backend/     → Express API + MongoDB models
└── frontend/    → React app (mobile-first UI)
```

## 2. Prerequisites

- Node.js 18+ and npm
- A MongoDB database — either:
  - **Local:** install MongoDB Community Server (https://www.mongodb.com/try/download/community), or
  - **Free cloud option (recommended, no install):** create a free cluster at
    https://www.mongodb.com/cloud/atlas and copy its connection string.

## 3. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Open `backend/.env` and set:

```
PORT=8000
MONGO_URI=mongodb://127.0.0.1:27017/soru-creator
```

(If using MongoDB Atlas, paste the connection string Atlas gives you instead.)

Start the API:

```bash
npm run dev      # auto-restarts on changes (recommended while developing)
# or
npm start        # plain node
```

You should see:

```
✅ MongoDB Connected : ...
🚀 Soru API running on http://0.0.0.0:8000
```

Verify it's alive: open http://localhost:8000/api/health — you should see
`{"ok":true,"app":"Soru Creator"}`.

## 4. Frontend setup

Open a **second terminal**:

```bash
cd frontend
npm install
cp .env.example .env
```

By default `frontend/.env` points at `http://localhost:8000/api`, which
matches the backend above. Only change it if your backend runs elsewhere
(e.g. a deployed server), by editing `REACT_APP_API_URL`.

Start the app:

```bash
npm start
```

This opens http://localhost:3000 — the app should load and connect to your
backend automatically.

## 5. Using the app

- **Dashboard** — balance overview, recent transactions, quick links
- **Projects** — add/edit/delete brand collaborations & sponsorships
- **Money** — record income and expenses, optionally linked to a project
- **Ideas** — capture content ideas by category
- **Reports** — income vs expenses summary and project stats
- **Schedule** — simple monthly calendar view
- **Settings** — channel name and preferences (stored locally)

All data (Projects, Transactions, Ideas) is persisted in MongoDB through the
Express API — nothing is lost on refresh.

## 6. Building for production / deployment

**Frontend:**
```bash
cd frontend
npm run build
```
This creates an optimized `frontend/build` folder you can deploy to any
static host (Netlify, Vercel, S3, etc.). Before building, set
`REACT_APP_API_URL` in `.env` to your live backend's URL.

**Backend:**
Deploy the `backend` folder to any Node host (Render, Railway, Fly.io, a VPS,
etc.), set the `MONGO_URI` and `PORT` environment variables there, and run
`npm start`.

Remember to update CORS/API URLs on both sides once you have real production
domains.

## 7. Troubleshooting

| Problem | Fix |
|---|---|
| Frontend shows "Could not load..." errors | Backend isn't running, or `REACT_APP_API_URL` in `frontend/.env` doesn't match where the backend is running. |
| Backend crashes with "MONGO_URI is missing" | You haven't created `backend/.env` from `.env.example`, or forgot to set `MONGO_URI`. |
| Backend crashes trying to connect to Mongo | MongoDB isn't running locally, or your Atlas connection string/IP allow-list is wrong. |
| Port 8000/3000 already in use | Stop the other process, or change `PORT` in `backend/.env` (and update `REACT_APP_API_URL` accordingly). |
