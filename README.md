# Enterprise Todo Application

A full-stack Todo platform built with NestJS, PostgreSQL, AdminJS for administration, and a React front-end. The project features JWT-based authentication, role-based access for admins, and an admin portal for managing users and todos.

## Project structure

```
backend/   # NestJS API + AdminJS
frontend/  # React client built with Vite
.env       # Shared environment defaults
```

## Prerequisites

- Node.js 18+
- npm 9+
- PostgreSQL running with credentials matching the `.env` file (defaults to `Docapp3` on `localhost:5432`).

## Backend

```bash
cd backend
npm install
npm run build       # optional, validates the TypeScript build
npm run start:dev   # start the NestJS server on http://localhost:3000
```

### Database seeding

Seed the database with an admin and demo data:

```bash
cd backend
npm run seed
```

Created accounts:

- Admin: `admin@example.com / admin123`
- User: `user@example.com / user123`

## Frontend

```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```

The client expects the API at `http://localhost:3000/api` (configurable through `VITE_API_URL`).

## Admin panel

Once authenticated as an admin, navigate to `http://localhost:3000/admin` or use the "Admin Panel" link in the UI. The panel is powered by AdminJS and secured via the same credentials.

## Environment variables

The repository includes a `.env` file with sensible defaults. Adjust it as needed for your environment.
