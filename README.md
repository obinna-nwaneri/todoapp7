# Doctor Appointment System

A full-stack demo application for managing doctors, patients, and appointments. The backend is
powered by Node.js/Express with Sequelize + SQLite, while the frontend uses React with Vite.

## Project Structure

```
.
├── client     # React frontend
└── server     # Express backend (SQLite database)
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Backend Setup

```bash
cd server
cp .env.example .env          # adjust values if desired
npm install
npm run seed                  # populate the SQLite database with sample data
npm run dev                   # start the API on http://localhost:4000
```

The seed script creates:

- Doctors: Dr. John Smith, Dr. Mary Jones, Dr. Alan White (password `password123`)
- Patients: Jane Doe, Michael Brown, Sarah Lee (password `password123`)
- Five sample appointments across multiple statuses
- Admin login: `admin@example.com` / `admin123`

### Frontend Setup

Open a new terminal and run:

```bash
cd client
npm install
npm run dev                   # start the React dev server on http://localhost:5173
```

Set `VITE_API_URL` in a `.env` file within `client/` if the API URL differs from the default
(`http://localhost:4000/api`).

## Features

### Patients

- Self-registration and login
- Browse doctors and book appointments
- View and cancel their own appointments

### Doctors

- Login with seeded or admin-created credentials
- View upcoming appointments
- Update appointment status to completed or cancelled

### Admin

- Secure login via `/api/login`
- Dashboard cards with total doctors, patients, and appointments
- CRUD operations for doctors and patients
- Table view of every appointment across the clinic

## API Overview

| Method | Endpoint                  | Description                              |
| ------ | ------------------------- | ---------------------------------------- |
| POST   | `/api/login`              | JWT login for admin/doctor/patient roles |
| GET    | `/api/doctors`            | List doctors (public)                    |
| POST   | `/api/doctors`            | Create doctor (admin)                    |
| PUT    | `/api/doctors/:id`        | Update doctor (admin)                    |
| DELETE | `/api/doctors/:id`        | Remove doctor (admin)                    |
| GET    | `/api/patients`           | List patients (admin)                    |
| POST   | `/api/patients`           | Register patient                         |
| PUT    | `/api/patients/:id`       | Update patient (admin)                   |
| DELETE | `/api/patients/:id`       | Remove patient (admin)                   |
| GET    | `/api/appointments`       | List appointments (role-aware filter)    |
| POST   | `/api/appointments`       | Create appointment (patient)             |
| PUT    | `/api/appointments/:id`   | Update appointment (admin/doctor)        |
| DELETE | `/api/appointments/:id`   | Cancel appointment (admin/doctor/patient)|

JWT-protected routes expect an `Authorization: Bearer <token>` header.

## Testing

Run `npm test` in the respective `client` or `server` directories to execute placeholder test
scripts. The project currently relies on manual testing and the included seed data for validation.
