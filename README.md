# Enterprise To-Do Application

A full-stack enterprise to-do management platform built with AdonisJS and React. The application provides role-based authentication, personal task tracking, and administrative oversight with actionable analytics.

## Project structure

```
.
├── backend   # AdonisJS API server
└── frontend  # React client (Vite)
```

## Requirements

- Node.js 18+
- npm 10+
- PostgreSQL instance with the following defaults:
  - host: `localhost`
  - port: `5432`
  - user: `postgres`
  - password: `admin`
  - database: `Docapp3`

## Backend setup (AdonisJS)

1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```
2. Configure environment variables (already provided in `.env`). Adjust if your PostgreSQL credentials differ.
3. Run database migrations and seeders:
   ```bash
   node ace migration:run
   node ace db:seed
   ```
4. Start the development server:
   ```bash
   adonis serve --dev
   ```
   The API will be available at `http://localhost:3333`.

### Seeded users

| Role  | Email                | Password  |
|-------|----------------------|-----------|
| Admin | `admin@example.com`  | `Admin@123` |
| User  | `johndoe@example.com` | `User@123`  |

## Frontend setup (React)

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:5173` in your browser. The frontend expects the API to be accessible at `http://localhost:3333`.

## Features

- **Authentication:** JWT-based login and registration with role support (`admin`, `user`).
- **User dashboard:** Personal task CRUD, filtering by status/priority, and upcoming task highlights.
- **Admin dashboard:** User and task management (CRUD), overview metrics, and charts for tasks by status and per user.
- **Tech stack:** AdonisJS, PostgreSQL, React (Vite), React Router, Axios, Bootstrap, Recharts.

## Useful scripts

| Location | Command                | Description                         |
|----------|------------------------|-------------------------------------|
| backend  | `adonis serve --dev`   | Start Adonis API in watch mode      |
| backend  | `node ace migration:run` | Apply database migrations          |
| backend  | `node ace db:seed`     | Seed default admin/user accounts    |
| frontend | `npm run dev`          | Start the Vite development server   |
| frontend | `npm run build`        | Create a production build           |

## Notes

- CORS is enabled on the API to allow the React client to communicate with it.
- Update the `.env` files if you deploy with different credentials or hosts.
- Ensure PostgreSQL is running before starting the backend server.
