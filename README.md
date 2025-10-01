# HealthPlus Doctor Appointment System

A full-stack doctor appointment booking and management platform built with an **AdonisJS** (Node.js) API, **SQLite** database, and a **React + Vite** front-end. The application supports patient bookings, doctor scheduling, medical records, notifications, and an admin analytics panel.

## Features

### Patient portal
- Secure registration and login
- Search doctors by specialty, location, and consultation type
- Book, view, cancel, and reschedule appointments
- Review medical records and prescriptions

### Doctor portal
- Manage professional profile and availability slots
- Review upcoming appointments and patient history
- Update appointment statuses
- Record visit summaries and prescriptions

### Admin console
- Dashboard with key metrics (patients, doctors, revenue, pending approvals)
- System-wide appointment overview and analytics reports
- Manage doctor/patient activation status
- Notification center for system announcements

## Project structure

```
.
├── backend/    # AdonisJS API + SQLite schema/seeders
└── frontend/   # React (Vite) single-page application
```

## Getting started

### Prerequisites
- Node.js 18+
- npm (comes with Node)

### Backend setup
```bash
cd backend
npm install
# Run migrations and seed demo data
node ace migration:run --force
node ace db:seed --files database/seeders/SampleDatum
# Start the API
npm run dev
```
The API is served at `http://localhost:3333/api` by default.

### Frontend setup
```bash
cd frontend
npm install
npm run dev
```
The Vite dev server runs on `http://localhost:5173`. Configure the API base URL via `.env`:
```
VITE_API_URL=http://localhost:3333/api
```

### Sample accounts
- Admin: `admin@healthplus.test` / `Admin@123`
- Doctor: `dr.smith@healthplus.test` / `Doctor@123`
- Patient: `john.doe@healthplus.test` / `Patient@123`

## API highlights
- `POST /api/auth/register/patient` – patient sign-up
- `POST /api/auth/register/doctor` – doctor sign-up with availability slots
- `POST /api/auth/login` – email/password login (token-based sessions)
- `GET /api/doctors` – search doctors with filters
- `POST /api/appointments` – create bookings
- `PUT /api/appointments/:id/status` – confirm/cancel/complete visits
- `GET /api/admin/dashboard` – metrics summary for admin panel

Refer to the React front-end (`frontend/src/pages`) for examples of consuming these endpoints.

## Development notes
- SQLite database stored at `backend/tmp/db.sqlite3`
- Session tokens persisted in `session_tokens` table (7-day expiration)
- Lucid models define relationships between users, doctor profiles, appointments, medical records, and notifications
- React Query handles data fetching/caching on the front-end

## License
MIT
