# Enterprise Todo Application

Full-stack enterprise task management system featuring an AdonisJS API, AdminJS administration console, PostgreSQL persistence, and a React + TailwindCSS frontend.

## Project Structure

```
backend/   # AdonisJS API + AdminJS server
frontend/  # React SPA (Vite + TailwindCSS)
```

## Quick Start

```bash
# API setup
cd backend
npm install
cp .env.example .env
node ace migration:run
node ace db:seed
npm run dev # starts API on http://localhost:3333
npm run start:admin # launches AdminJS on http://localhost:3334/admin

# Frontend setup (in a new terminal)
cd ../frontend
npm install
npm run dev # defaults to http://localhost:5173
```

Set `VITE_API_URL` in `frontend/.env` if the API runs on a different host or port.

## Seeded Accounts

| Role      | Email                     | Password     |
| --------- | ------------------------- | ------------ |
| Admin     | admin@enterprise.local    | Admin123!    |
| Team Lead | teamlead@enterprise.local | TeamLead123! |
| User      | user@enterprise.local     | User123!     |

## Features

- Role-based authentication and JWT-secured API routes.
- Task CRUD with priorities, due dates, and assignment workflows.
- Dashboard metrics for admins and individual contributors.
- AdminJS console for user lifecycle management (activate/deactivate, role updates).
- Tailwind-powered React frontend with login, registration, and task board.
