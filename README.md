# Calories & Protein Tracker (MERN)

Full-stack app to log daily calories and protein, set goals, and review progress with optional weekly charts, dark mode, Open Food Facts search, and paginated history.

## Prerequisites

- **Node.js** 18+
- **MongoDB** (local `mongod` or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))

## Backend setup

```bash
cd backend
```

Copy `backend/.env.example` to `backend/.env` (on Windows: `copy .env.example .env` in PowerShell or CMD from the `backend` folder).

Edit `.env`:

- `MONGODB_URI` — your connection string (e.g. `mongodb://127.0.0.1:27017/calories-protein-tracker` or Atlas URL).
- `JWT_SECRET` — a long random string for signing JWTs.
- `CLIENT_ORIGIN` — frontend URL (default `http://localhost:5173`).
- `TZ` — IANA timezone for grouping history by calendar day (default `UTC`). Match your machine or desired “day boundary.”

```bash
npm install
npm run dev
```

API listens on **port 5000** by default (`PORT` in `.env`).

### API summary

| Method | Path | Auth |
|--------|------|------|
| POST | `/api/auth/register` | No |
| POST | `/api/auth/login` | No |
| GET | `/api/user/profile` | Yes |
| PUT | `/api/user/goals` | Yes |
| POST | `/api/food/add` | Yes |
| GET | `/api/food/today` | Yes |
| GET | `/api/food/history?page=1&limit=10` | Yes |
| GET | `/api/food/weekly` | Yes |
| DELETE | `/api/food/:id` | Yes |

## Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**. The Vite dev server proxies `/api` to `http://localhost:5000` (see `vite.config.js`).

For a production build, set `VITE_API_URL` in `.env` to your API origin (see `frontend/.env.example`), then:

```bash
npm run build
npm run preview
```

## Project layout

- `backend/` — Express, Mongoose, JWT, MVC (models, routes, controllers, middleware, config).
- `frontend/` — React (Vite), Tailwind, React Router, Axios, Chart.js.

JWT is stored in **localStorage**; protected UI routes require a valid token.

## Optional features included

- **Chart.js** — last 7 days calories and protein on the dashboard.
- **Dark mode** — toggle in the navbar (persisted in `localStorage`).
- **Open Food Facts** — optional search on Add Food (per-100g values; adjust for your portion).
- **History pagination** — `page` and `limit` query params on `/api/food/history`.
