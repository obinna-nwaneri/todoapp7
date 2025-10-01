# Enterprise Todo Application

A full-stack enterprise-grade Todo management platform built with Express.js, PostgreSQL (via Sequelize), AdminJS, and a React frontend.

## Features

- Secure user registration and login with JWT authentication
- Role-aware dashboard with Admin and standard user experiences
- CRUD operations for todos including priority, status, due date, and ownership
- AdminJS back-office panel to manage Users and Todos
- Database migrations and seed data (admin & user accounts with sample todos)
- Docker Compose recipe for running PostgreSQL locally
- React SPA with protected routes, optimistic UI updates, and contextual messaging

## Project Structure

```
.
├── backend/              # Express + Sequelize API and AdminJS dashboard
├── frontend/             # React SPA powered by Vite
├── docker-compose.yml    # PostgreSQL service definition
└── README.md             # Setup and usage instructions
```

## Prerequisites

- Node.js 18+
- npm 9+
- Docker (optional, recommended for PostgreSQL)

## Getting Started

### 1. Clone and install dependencies

```bash
npm install --prefix backend
npm install --prefix frontend
```

### 2. Configure environment variables

Copy the provided examples and adjust as needed.

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Ensure the backend `.env` matches your database credentials. The examples already align with the docker-compose service (host `localhost`, port `5432`, user `postgres`, password `admin`, database `Docapp3`).

### 3. Start PostgreSQL (via Docker Compose)

```bash
docker-compose up -d db
```

> Alternatively, point the backend `.env` to any reachable PostgreSQL instance.

### 4. Run database migrations & seed data

```bash
npm run migrate --prefix backend
npm run seed --prefix backend
```

This creates the schema and seeds:

- Admin user — `admin@example.com` / `admin123`
- Standard user — `user@example.com` / `user123`
- Sample todos for each user

### 5. Launch the backend API & AdminJS

```bash
npm run dev --prefix backend
```

The Express API listens on the port defined in `backend/.env` (default `4000`). AdminJS is available at `http://localhost:4000/admin` and authenticates against the seeded admin account.

### 6. Launch the React frontend

```bash
npm run dev --prefix frontend
```

By default Vite serves the SPA at `http://localhost:3000`. The frontend reads the API base URL from `frontend/.env` (`VITE_API_URL`).

### 7. Sign in and explore

- Visit `http://localhost:3000`
- Login with either seeded account or create a new one via the registration form
- Admin users see a quick link to the AdminJS panel within the dashboard

## Available Scripts

### Backend (`backend/`)

- `npm run dev` – start Express with nodemon
- `npm start` – start Express
- `npm run migrate` – run Sequelize migrations
- `npm run seed` – run all seeders
- `npm run reset` – undo migrations, re-run migrations, and reseed data

### Frontend (`frontend/`)

- `npm run dev` – start the Vite dev server
- `npm run build` – build production assets
- `npm run preview` – preview the production build locally

## API Overview

Base URL: `http://localhost:4000`

| Method | Endpoint         | Description                         |
| ------ | ---------------- | ----------------------------------- |
| POST   | `/api/auth/register` | Register a new user (name, email, password) |
| POST   | `/api/auth/login`    | Login and receive a JWT token              |
| GET    | `/api/todos`         | List todos (admin sees all, users see own) |
| POST   | `/api/todos`         | Create a todo                              |
| GET    | `/api/todos/:id`     | Retrieve a single todo                     |
| PUT    | `/api/todos/:id`     | Update a todo                              |
| DELETE | `/api/todos/:id`     | Delete a todo                              |

All `/api/todos` routes require a `Bearer <token>` authorization header.

## Testing AdminJS

- Navigate to `http://localhost:4000/admin`
- Authenticate with `admin@example.com` / `admin123`
- Manage Users and Todos directly from the dashboard

## Notes

- Passwords are hashed with bcrypt before storage
- JWT tokens expire after 12 hours; adjust `JWT_SECRET` and expiry as needed
- Seeders use Postgres-specific returning statements; keep PostgreSQL for compatibility

## Troubleshooting

- Ensure PostgreSQL is running and accessible before launching the backend
- If migrations fail due to existing enums, run `npm run reset --prefix backend`
- When changing ports or hosts, update both backend and frontend `.env` files

Happy building!
