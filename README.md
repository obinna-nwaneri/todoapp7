# Enterprise Todo App

Full-stack enterprise task management platform built with AdonisJS 6, AdminJS 6.x, PostgreSQL, and React.

## Structure

- `backend/` – AdonisJS API, AdminJS configuration, PostgreSQL migrations, and seed data.
- `frontend/` – React + Vite dashboard with TailwindCSS styling.

## Getting Started

### Backend

```bash
cd backend
cp .env.example .env
npm install
node ace generate:key # optional if you want a unique APP_KEY
node ace migration:run
node ace db:seed
npm run dev
```

The seed script provisions sample accounts:

- Admin → `admin@example.com` / `Admin123!`
- Team Lead → `lead@example.com` / `Lead123!`
- User → `user@example.com` / `User123!`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend proxies requests to the backend on `http://localhost:3333`.

## Environment

- PostgreSQL credentials default to `PG_HOST=localhost`, `PG_USER=postgres`, `PG_PASSWORD=admin`, and `PG_DB_NAME=Docapp3`.
- `APP_KEY` defaults to `your-secret-app-key` and can be regenerated using the Adonis CLI.

## Features

- Role-based access with Admin, Team Lead, and User roles.
- Task CRUD with priority, status, and due dates.
- AdminJS panel (bootstrapped via `start/admin.ts`) for visual management.
- React dashboards and forms with Tailwind styling.
- REST API for authentication, dashboards, and reporting.
