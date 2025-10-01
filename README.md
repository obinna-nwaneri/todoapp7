# Enterprise Todo Platform

A full-stack enterprise-grade todo management platform featuring an AdonisJS API with AdminJS operations console and a modern React dashboard.

## Project structure

| Path | Description |
| --- | --- |
| [`backend/`](backend/) | AdonisJS 6 API with Lucid ORM, AdminJS integration, and PostgreSQL persistence. |
| [`frontend/`](frontend/) | React + Vite single-page app for enterprise task planning and tracking. |

## Backend (AdonisJS + AdminJS)

### Environment

Create a `.env` file inside `backend/` (copy from `.env.example`) and ensure it points to your PostgreSQL instance:

```
PG_HOST=localhost
PG_PORT=5432
PG_USER=postgres
PG_PASSWORD=admin
PG_DB_NAME=Docapp
```

### Setup & usage

```bash
cd backend
npm install
node ace migration:run
node ace db:seed
npm run dev
```

The API will be available at `http://localhost:3333`. AdminJS is mounted at `http://localhost:3333/admin`.

**Seeded accounts**

| Role | Email | Password |
| --- | --- | --- |
| Platform administrator | `admin@enterprise.todo` | `Admin@123` |
| Delivery manager | `olivia@enterprise.todo` | `Password123` |
| Lead engineer | `dylan@enterprise.todo` | `Password123` |

### Key endpoints

- `POST /api/auth/login` – obtain an access token.
- `GET /api/me` – fetch authenticated profile.
- `GET /api/todos` – list todos with filtering (`status`, `priority`, `assignedToId`, `createdById`, `search`).
- `POST /api/todos` – create todo.
- `PATCH /api/todos/:id` – update todo fields/status.
- `DELETE /api/todos/:id` – remove todo.

AdminJS provides a visual console for managing `User` and `Todo` records with the same database connection.

## Frontend (React)

### Environment

```
cd frontend
cp .env.example .env
```

### Setup & usage

```bash
npm install
npm run dev
```

The React dashboard runs on `http://localhost:5173` by default and expects the API at `http://localhost:3333`.

### Features

- Authenticated executive dashboard with enterprise branding.
- Rich filters (status, priority, owner, search) and inline status updates.
- Initiative creation form with due dates and assignments.
- Team bandwidth insights powered by aggregated counts from the API.
- Responsive layout optimised for desktop and tablet form factors.

## Development notes

- Backend is written in TypeScript and uses Lucid ORM and the Adonis auth access token guard.
- AdminJS adapter for Lucid is enabled with customised branding and automatic creator attribution.
- Seeded data showcases administrator and team member personas plus sample initiatives.
- Frontend uses Luxon for date handling and persists the API token in `localStorage`.
