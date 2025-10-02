# DocApp Enterprise

Full-stack doctor appointment management platform featuring a NestJS backend and a React (Vite) frontend. The system supports role-based experiences for administrators, doctors, and patients, complete with JWT authentication, search, and CRUD workflows.

## Project Structure

```
.
├── backend   # NestJS + TypeORM API
└── frontend  # React + Vite single-page application
```

## Getting Started

### 1. Configure Environment Variables

```
cp backend/.env.example backend/.env
```

Update `backend/.env` if your local PostgreSQL credentials differ from the defaults:

```
PG_HOST=localhost
PG_PORT=5432
PG_USER=postgres
PG_PASSWORD=admin
PG_DB_NAME=Docapp4
JWT_SECRET=supersecret
JWT_EXPIRES_IN=15m
REFRESH_SECRET=superrefresh
REFRESH_EXPIRES_IN=7d
```

### 2. Install Dependencies

Install dependencies separately for the backend and frontend:

```
cd backend
npm install

cd ../frontend
npm install
```

### 3. Database Setup

Run the TypeORM migrations and seed data (from the `backend` directory):

```
npm run migration:run
npm run seed
```

Seeding inserts the following default users:

- **Admin:** `admin@example.com` / `admin123`
- **Doctor:** `doctor1@example.com` / `doctor123`
- **Patient:** `patient1@example.com` / `patient123`

### 4. Start the Development Servers

- Backend (NestJS):

  ```
  cd backend
  npm run start:dev
  ```

- Frontend (React + Vite):

  ```
  cd frontend
  npm run dev
  ```

The frontend expects the API at `http://localhost:3000`. Adjust `VITE_API_URL` in `frontend/.env` if you host the backend elsewhere.

## Feature Highlights

- Role-based dashboards for Admin (`/admin-panel/dashboard`), Doctor (`/doctor-panel/dashboard`), and Patient (`/patient-panel/dashboard`).
- CRUD management of doctors, patients, and appointments with search and filtering capabilities.
- Patient booking flow with symptom capture and doctor availability context.
- JWT authentication with automatic access token refresh (access + refresh tokens).
- PostgreSQL persistence with TypeORM entities, migrations, and a seed script.

## Available Scripts

### Backend

- `npm run start:dev` – start NestJS in watch mode.
- `npm run build` – compile the backend.
- `npm run migration:generate` – generate a new migration file.
- `npm run migration:run` – apply pending migrations.
- `npm run seed` – run the seed script.

### Frontend

- `npm run dev` – start the Vite dev server.
- `npm run build` – build the production bundle.
- `npm run preview` – preview the production build.
- `npm run lint` – lint the project using ESLint.

## API Overview

Key backend endpoints include:

- `POST /auth/register/doctor` – Doctor self-registration.
- `POST /auth/register/patient` – Patient self-registration.
- `POST /auth/login` – Login for any user role.
- `POST /auth/refresh` – Refresh expired access tokens.
- `GET /users/me` – Retrieve the current authenticated user profile.
- `CRUD /doctors`, `/patients`, `/appointments` – Role-aware resource management.
- `GET /search` – Unified search across doctors, patients, and appointments.

Refer to the source modules in `backend/src` for DTOs, guards, and detailed logic.

## Frontend Routing

Routes are protected based on the authenticated user role using React Router guards.

- `/login`, `/register-doctor`, `/register-patient`
- `/admin-panel/*` – Admin dashboard, doctor/patient/appointment management
- `/doctor-panel/*` – Doctor dashboard & appointments
- `/patient-panel/*` – Patient dashboard, appointments, booking

## Testing Notes

Automated tests are not included. Use the seeded accounts to explore the end-to-end experience, and the MUI-based UI to manage users and appointments interactively.

Enjoy building with DocApp Enterprise!
