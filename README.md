# CT Masterlist Portal

A portal for curating HER2+ breast cancer clinical trial "masterlists". Users
create named masterlists, then add trials by NCT id — the backend fetches
and parses the trial record from clinicaltrials.gov and retains only
Canadian (or plausibly Canadian) trial sites, plus Bethesda, Maryland (the
NIH Clinical Center).

This is a MERN-stack app split into two independently deployable projects:

- `backend/` — Node.js/Express REST API backed by MongoDB (Mongoose).
- `frontend/` — React 19 + Vite + Tailwind CSS single-page app.

## Stack

| Layer     | Tech                                                            |
| --------- | ---------------------------------------------------------------|
| Frontend  | React 19, React Router 7, Tailwind CSS 4, Vite 7, react-hot-toast |
| Backend   | Express 4, Mongoose 8, JWT auth, express-validator              |
| Database  | MongoDB Atlas                                                   |

## Getting started

### 1. Backend

```bash
cd backend
cp .env.example .env   # fill in MONGO_URI, JWT_SECRET, CORS_ORIGIN
npm install
npm run dev            # http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env   # set VITE_API_URL if not the default
npm install
npm run dev            # http://localhost:5173
```

Register a user, log in, create a masterlist, then add trials by NCT id
(e.g. `NCT00001372`) — comma-separate multiple ids to add several at once.

## Backend API

All routes are prefixed with `/api`. Endpoints under `/auth` are public;
everything under `/masterlists` requires `Authorization: Bearer <token>`.

| Method | Route                              | Description                          |
| ------ | ----------------------------------- | ------------------------------------- |
| GET    | `/health`                           | Liveness + DB connection status       |
| POST   | `/auth/register`                   | Create an account, returns JWT        |
| POST   | `/auth/login`                      | Authenticate, returns JWT             |
| GET    | `/auth/me`                         | Current user profile                  |
| GET    | `/masterlists?page=&limit=&search=`| Paginated, searchable masterlist list |
| POST   | `/masterlists`                     | Create a masterlist                   |
| GET    | `/masterlists/:id`                 | Get a masterlist with its trials      |
| DELETE | `/masterlists/:id`                 | Delete a masterlist                   |
| POST   | `/masterlists/:id/trials`          | Add trial(s) by `{ nct }` / `{ ncts }`|
| PUT    | `/masterlists/:id/trials/:nct`     | Edit a trial's fields                 |
| DELETE | `/masterlists/:id/trials/:nct`     | Remove a trial from a masterlist      |
| GET    | `/masterlists/:id/export`          | Download the masterlist as a .docx    |

Responses use a consistent envelope: `{ success, data }` on success,
`{ success: false, message }` or `{ success: false, errors: [...] }` on
failure.

## Data model

**User**: `name`, `email` (unique), `password` (bcrypt-hashed, hidden by default).

**Masterlist**: `name`, `cancerType`, `user` (creator reference), `trials[]`,
timestamps. Each trial subdocument stores `nct`, `title`, `phase`,
`study_type`, `sponsor`, `url` (link to the trial on clinicaltrials.gov),
`location[]`, `inclusion_criteria[]`, `exclusion_criteria[]`. Trials are kept
sorted by `study_type` then `phase` so same-type/same-phase trials sit
together, re-sorted whenever trials are added or edited.

## Hardening included

- Helmet, CORS allowlist, request body size limits, Mongo query sanitization
- Rate limiting (tighter on `/auth`, general limit on the rest of the API)
- Centralized error handling with typed Mongoose error responses
- Environment variable validation on boot
- Password field excluded from queries/serialization by default
- Pagination + search on the masterlist list endpoint
- Graceful shutdown on SIGTERM/SIGINT

## Frontend features

- Centralized auth context with JWT expiry checks and auto-redirect on 401
- Protected routes, debounced search, paginated list, client-side trial filter
- Toast notifications, accessible confirm dialogs (replacing `window.confirm`)
- Loading skeletons and empty states instead of bare "Loading..." text
- Responsive layout with a mobile navigation menu
- Error boundary around the app shell

## Environment variables

**backend/.env**

```
PORT=5000
MONGO_URI=<your MongoDB connection string>
JWT_SECRET=<a long random secret>
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

**frontend/.env**

```
VITE_API_URL=http://localhost:5000/api
```

Neither `.env` file is committed — see `.env.example` in each project for
the required keys.

## Deployment (free tier)

**Backend — Render**

1. On [Render](https://render.com), click **New +** → **Blueprint**, connect
   this GitHub repo. Render will detect `render.yaml` at the repo root and
   pre-fill a web service rooted at `backend/`.
2. When prompted, fill in the secret env vars: `MONGO_URI`, `JWT_SECRET`,
   and `CORS_ORIGIN` (set this to your Vercel frontend URL once you have
   it — comma-separate multiple origins if needed).
3. Deploy. Render assigns a URL like `https://masterlist-portal-backend.onrender.com`.
   `GET /api/health` is used as the health check.
4. Free tier note: the service spins down after ~15 minutes idle; the next
   request takes 20-50s to wake it back up.

**Frontend — Vercel**

1. On [Vercel](https://vercel.com), **Add New** → **Project**, import this repo.
2. Set **Root Directory** to `frontend`. Framework preset should
   auto-detect as Vite (build command `npm run build`, output `dist`).
3. Add an environment variable `VITE_API_URL` set to
   `https://<your-render-service>.onrender.com/api`.
4. Deploy. Vercel assigns a URL like `https://masterlist-portal.vercel.app`.
   `frontend/vercel.json` handles SPA routing so React Router's client-side
   routes work on refresh/direct link.
5. Go back to Render and set `CORS_ORIGIN` to this Vercel URL, then
   redeploy the backend so the browser is allowed to call the API.

**Database — MongoDB Atlas**

Already in use per the stack table above. In Atlas, under Network Access,
allow access from anywhere (`0.0.0.0/0`) so Render's dynamic egress IPs can
connect, since the free tier doesn't offer static IPs.
