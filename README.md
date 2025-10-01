# Enterprise Todo Application

Enterprise-grade Todo management stack featuring an Express.js API with AdminJS, PostgreSQL, and a React front end.

## Prerequisites

- Node.js 18+
- npm or yarn
- Docker (for PostgreSQL via Docker Compose)

## Environment Variables

Copy `.env.example` to `.env` and adjust as needed.

```bash
cp .env.example .env
```

Key variables:

- `PG_HOST`, `PG_PORT`, `PG_USER`, `PG_PASSWORD`, `PG_DB_NAME` – PostgreSQL connection
- `JWT_SECRET` – secret key for API JWT tokens
- `ADMIN_EMAIL`, `ADMIN_PASSWORD` – AdminJS login (also matches seeded admin user)
- `VITE_API_BASE_URL` – URL of the Express API used by the React app

## Docker (PostgreSQL)

A `docker-compose.yml` file is provided to spin up PostgreSQL:

```bash
docker-compose up -d
```

This launches PostgreSQL on `localhost:5432` with credentials that match the defaults in `.env.example`.

## Backend (Express + Sequelize + AdminJS)

1. Install dependencies:

   ```bash
   cd backend
   npm install
   ```

2. Run migrations and seeders:

   ```bash
   npm run migrate
   npm run seed
   ```

3. Start the API server:

   ```bash
   npm run dev
   ```

   The API is available at `http://localhost:4000` and AdminJS at `http://localhost:4000/admin`.

### API Routes

- `POST /api/auth/register` – Register a user (name, email, password)
- `POST /api/auth/login` – Login and receive JWT token
- `GET /api/todos` – List todos for the authenticated user (admins see all)
- `POST /api/todos` – Create a todo
- `PUT /api/todos/:id` – Update a todo
- `DELETE /api/todos/:id` – Remove a todo

Include the `Authorization: Bearer <token>` header for todo routes.

### Seeded Data

- Admin: `admin@example.com` / `admin123`
- User: `user@example.com` / `user123`
- Each account has two sample todos.

## Frontend (React + Vite)

1. Install dependencies:

   ```bash
   cd frontend
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

   The app runs at `http://localhost:5173` and communicates with the backend via `VITE_API_BASE_URL`.

### Features

- Registration & login with persistent JWT session
- Dashboard with todo creation, editing, deletion, and refresh controls
- Admin users see a shortcut to the AdminJS dashboard
- Context-driven messaging for success/error feedback

## Running Tests

Automated tests are not included. Use the provided scripts to verify API and UI manually.
