# Todo App 7

A full-stack Todo dashboard built with an Express/Node.js backend, SQLite database, and a React frontend.

## Features

- REST API for managing todos and users
- SQLite persistence with schema + seed scripts
- React UI featuring filtering, inline editing, and completion toggles
- Sample users (including an admin) and todos preloaded via the seed script

## Getting Started

### Backend

```bash
cd backend
npm install
npm run migrate
npm run seed
npm start
```

The API listens on `http://localhost:4000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The React app runs on `http://localhost:3000` and proxies `/api` requests to the backend during development.

## API Overview

- `GET /api/users` — List users with their role (admin or user)
- `GET /api/todos` — List todos, supports `ownerId` and `completed` query parameters
- `POST /api/todos` — Create a todo (`title` and `ownerId` required)
- `PATCH /api/todos/:id` — Update fields on a todo
- `DELETE /api/todos/:id` — Remove a todo

All responses are JSON. Error responses include a `message` describing the failure.
