# CT Masterlist Portal

A portal for curating HER2+ breast cancer clinical trial "masterlists". Users
create named masterlists, then add trials by NCT id — the backend fetches
and parses the trial record from clinicaltrials.gov and retains only
Canadian (or plausibly Canadian) trial sites.

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
| DELETE | `/masterlists/:id/trials/:nct`     | Remove a trial from a masterlist      |

Responses use a consistent envelope: `{ success, data }` on success,
`{ success: false, message }` or `{ success: false, errors: [...] }` on
failure.

## Data model

**User**: `name`, `email` (unique), `password` (bcrypt-hashed, hidden by default).

**Masterlist**: `name`, `cancerType`, `user` (creator reference), `trials[]`,
timestamps. Each trial subdocument stores `nct`, `title`, `phase`,
`study_type`, `sponsor`, `location[]`, `inclusion_criteria[]`,
`exclusion_criteria[]`.

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
