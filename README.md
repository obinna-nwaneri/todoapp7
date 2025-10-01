# Doctor Appointment System

This project provides a full-stack doctor's appointment management platform consisting of a NestJS REST API with a SQLite database and a React admin interface inspired by Django Admin.

## Project Structure

- `backend/` – NestJS API using TypeORM and SQLite. Includes role-based authentication, CRUD endpoints, and database seeding.
- `frontend/` – React admin panel built with Vite, React Router, Axios, and Bootstrap.

## Getting Started

### Backend

```bash
cd backend
npm install
npm run seed   # seeds the SQLite database with sample data
npm run start:dev
```

The API runs on `http://localhost:3000` by default.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The admin panel runs on `http://localhost:5173`.

### Default Credentials

```
admin@example.com / password123
john@example.com / password123
mary@example.com / password123
alan@example.com / password123
jane@example.com / password123
michael@example.com / password123
sarah@example.com / password123
```

Doctor and patient accounts are limited to authentication and can be extended to add role-specific UIs as needed. The admin account has full CRUD access through the API and dashboard.

## API Overview

- `POST /auth/login`
- `GET/POST/PUT/DELETE /doctors`
- `GET/POST/PUT/DELETE /patients`
- `GET/POST/PUT/DELETE /appointments`
- `GET /admin/stats`

All endpoints (except login) require a valid JWT issued during authentication.

## Technologies

- **Backend:** NestJS, TypeORM, Passport JWT, SQLite
- **Frontend:** React, React Router, Axios, Bootstrap, Vite

## Seeding

Run `npm run seed` inside `backend/` whenever you want to reset the database to the provided sample data.
