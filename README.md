# Todo App

Full-stack Todo management application built with AdonisJS 6, SQLite, and a React + Vite frontend.

## Project Structure

- `backend/` – AdonisJS API with JWT authentication, Lucid ORM models, migrations, and seed data.
- `frontend/` – React application bootstrapped with Vite and styled using Tailwind CSS.

## Backend Setup

```bash
cd backend
npm install
node ace migration:run
node ace db:seed
node ace serve --watch
```

Environment variables are defined in `backend/.env`. Ensure `JWT_SECRET` is set before starting the server.

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend expects the API to be available at `http://localhost:3333` by default.

## Sample Accounts

Use the following accounts to explore the application:

- Admin – `admin@example.com` / `Admin@123`
- User – `alice@example.com` / `User@123`
- User – `bob@example.com` / `User@123`
