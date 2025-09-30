# To-Do App

A full-stack to-do management application with authentication, task tracking, and an admin console.

## Tech Stack

- **Backend:** Node.js, Express.js, SQLite
- **Frontend:** React (Vite), React Router, Axios
- **Authentication:** JWT with bcrypt password hashing

## Project Structure

```
.
├── client/   # React frontend
└── server/   # Express + SQLite backend
```

## Prerequisites

- Node.js 18+
- npm 9+

## Backend Setup (`server`)

```bash
cd server
npm install
npm run start
```

The backend listens on `http://localhost:4000` by default. Environment variables:

- `PORT` – server port (defaults to `4000`)
- `JWT_SECRET` – secret used to sign JWT tokens (defaults to `supersecretjwt`)

SQLite data is stored in `server/database.sqlite`. The first run seeds:

- **Users:** `admin`, `alice`, `bob` (passwords defined in `src/db.js`)
- **Tasks:** 6 demo tasks across the users

## Frontend Setup (`client`)

```bash
cd client
npm install
npm run dev
```

The Vite dev server runs at `http://localhost:5173` and proxies API calls to the backend.

## Available Features

### User Experience

- Registration & login with JWT token stored in local storage
- Dashboard with task counts by status
- Task list with filtering by status and priority
- Create, update, and delete personal tasks

### Admin Experience

- Admin login (uses the same login endpoint)
- Dashboard showing total users, total tasks, and task breakdown by status
- Manage users (CRUD) and view their tasks
- Manage tasks (CRUD) for any user

## Scripts

- `npm run start` (server) – start Express in production mode
- `npm run dev` (server) – start Express with Nodemon
- `npm run dev` (client) – start Vite dev server
- `npm run build` (client) – build production bundle

## API Overview

| Method | Endpoint               | Description                          |
| ------ | ---------------------- | ------------------------------------ |
| POST   | `/api/register`        | Register new user                    |
| POST   | `/api/login`           | Login and receive JWT token          |
| GET    | `/api/tasks`           | List tasks for logged-in user/admin  |
| POST   | `/api/tasks`           | Create task                          |
| GET    | `/api/tasks/:id`       | Get single task                      |
| PUT    | `/api/tasks/:id`       | Update task                          |
| DELETE | `/api/tasks/:id`       | Delete task                          |
| GET    | `/api/admin/summary`   | Admin overview metrics               |
| GET    | `/api/admin/users`     | Admin list users + tasks             |
| POST   | `/api/admin/users`     | Admin create user                    |
| PUT    | `/api/admin/users/:id` | Admin update user                    |
| DELETE | `/api/admin/users/:id` | Admin delete user                    |
| GET    | `/api/admin/tasks`     | Admin list tasks                     |
| POST   | `/api/admin/tasks`     | Admin create task                    |
| PUT    | `/api/admin/tasks/:id` | Admin update task                    |
| DELETE | `/api/admin/tasks/:id` | Admin delete task                    |

## Sample Credentials

| Role  | Email               | Password       |
| ----- | ------------------- | -------------- |
| Admin | `admin@example.com` | `AdminPass123!`|
| User  | `alice@example.com` | `Password123`  |
| User  | `bob@example.com`   | `Password123`  |

## Notes

- All protected endpoints require an `Authorization: Bearer <token>` header.
- Update the seeded passwords before deploying to production.
