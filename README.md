# Enterprise Todo Application

This repository contains a full-stack Todo application featuring an AdonisJS v6 backend and a React (Vite) frontend. It demonstrates JWT authentication, role-based access for admins and users, and complete CRUD capabilities for todos.

## Project structure

```
.
├── backend   # AdonisJS v6 API
├── frontend  # React dashboard (Vite)
└── README.md
```

## Backend (AdonisJS v6)

### Prerequisites

- Node.js 18+
- PostgreSQL database using the following defaults (configurable via `.env`):
  - `PG_HOST=localhost`
  - `PG_PORT=5432`
  - `PG_USER=postgres`
  - `PG_PASSWORD=admin`
  - `PG_DB_NAME=Docapp3`

### Setup & usage

```bash
cd backend
cp .env.example .env
npm install
node ace migration:run
node ace db:seed
npm run dev
```

The API will be available at `http://localhost:3333` and provides:

- `POST /register` – Register users (optional role selection)
- `POST /login` – Obtain a JWT access token
- Authenticated user routes under `/todos`
- Admin-only routes under `/admin`

Seeded credentials:

- Admin — `admin@example.com` / `admin123`
- User — `user@example.com` / `user123`

## Frontend (React + Vite)

### Setup & usage

```bash
cd frontend
npm install
npm run dev
```

Create a `.env` file (optional) to override the API URL:

```
VITE_API_URL=http://localhost:3333
```

Routes:

- `/login` – Login page for users and admins
- `/register` – New user registration
- `/dashboard` – Authenticated user todo management
- `/admin` – Admin oversight of users and todos

## Running the full stack

1. Start the backend API (`npm run dev` inside `backend`).
2. Start the frontend dev server (`npm run dev` inside `frontend`).
3. Access the UI at `http://localhost:5173`.

## Testing & linting

This starter does not ship with automated tests. Use the provided scripts to run AdonisJS commands or to extend with your preferred testing tools.
