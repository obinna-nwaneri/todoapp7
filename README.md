# Enterprise Doctor Appointment Application

This monorepo contains a NestJS backend and a Vite + React frontend for an enterprise-ready doctor appointment platform with role-based access for administrators, doctors, and patients.

## Getting Started

### 1. Environment configuration

```
cp .env.example backend/.env
cp frontend/.env.example frontend/.env
```

Update the values if needed (default database connection is PostgreSQL on `localhost:5432`).

### 2. Install dependencies

#### Backend
```
cd backend
npm install
```

#### Frontend
```
cd ../frontend
npm install
```

### 3. Database migrations

```
cd ../backend
npm run migration:run
```

### 4. Seed initial data

```
npm run seed
```

The seed creates:
- Admin: `admin@example.com` / `admin123`
- Doctor: `doctor1@example.com` / `doctor123`
- Patient: `patient1@example.com` / `patient123`

### 5. Run the backend

```
npm run start:dev
```

### 6. Run the frontend

```
cd ../frontend
npm run dev
```

The frontend dev server runs on [http://localhost:5173](http://localhost:5173).

## Features

- JWT authentication with refresh tokens and bcrypt password hashing.
- Role-based authorization (Admin, Doctor, Patient).
- Appointment booking with symptom capture and collision validation.
- Admin panel for managing doctors, patients, and appointments with search and filters.
- Doctor panel for managing personal appointments and updating statuses.
- Patient panel for booking, viewing, and cancelling appointments.
- Shared search endpoint with flexible filters.

## Project Structure

```
backend/
  src/
    auth/
    users/
    doctors/
    patients/
    appointments/
    search/
    common/
    migrations/
    seeds/
frontend/
  src/
    components/
    contexts/
    pages/
    router/
    services/
```

## Scripts

Backend package.json includes:
- `start:dev` – run NestJS in watch mode
- `migration:generate` – generate a new migration
- `migration:run` – apply migrations
- `seed` – populate the database with sample data

Frontend package.json includes:
- `dev` – start Vite dev server
- `build` – production build
- `preview` – preview the production build

## API Highlights

- `POST /auth/register/doctor`
- `POST /auth/register/patient`
- `POST /auth/login`
- `POST /auth/refresh`
- `GET /users/me`
- `CRUD /doctors`, `/patients`, `/appointments`
- `GET /search`

## Admin Panel

Available at `/admin-panel` routes:
- Dashboard overview
- Manage doctors, patients, appointments

## Doctor Panel

Accessible at `/doctor-panel` routes:
- Dashboard with upcoming/completed counts
- Manage appointments with quick status actions

## Patient Panel

Accessible at `/patient-panel` routes:
- Dashboard with upcoming/past counts
- View appointments and book new ones (with symptom capture)

