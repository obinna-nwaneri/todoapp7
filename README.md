# Enterprise Doctor's Appointment Application

A full-stack enterprise appointment scheduling platform built with Django REST Framework and React. The solution supports three roles (Admin, Doctor, Patient), JWT authentication, role-based dashboards, and CRUD/search workflows for doctors, patients, and appointments.

## Features

- **Role-based authentication** powered by Django and JWT tokens
- **Admin panel** available at `/admin-panel/` with Django Admin UI
- **Doctor dashboard** for managing assigned appointments, filtering, and updating statuses
- **Patient dashboard** for booking, editing, cancelling, and reviewing appointments with symptom capture
- **RESTful APIs** built using Django REST Framework with search and filtering support
- **React front end** with Material UI, protected routes, and contextual alerts
- **Database seed command** provisioning sample Admin, Doctor, Patient, and appointment data

## Getting Started

### Backend setup

```bash
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_data  # loads the sample users and appointments
python manage.py runserver
```

Sample credentials after seeding:

| Role   | Email                | Password   |
| ------ | -------------------- | ---------- |
| Admin  | `admin@example.com`  | `admin123` |
| Doctor | `doctor1@example.com`| `doctor123`|
| Patient| `patient1@example.com`| `patient123`|

### Frontend setup

```bash
cd frontend
npm install
npm run dev
```

By default, the React app expects the API at `http://localhost:8000/api`. Set `VITE_API_BASE_URL` to override.

## API Overview

| Endpoint | Description |
| -------- | ----------- |
| `POST /api/accounts/auth/register/doctor/` | Doctor self-registration |
| `POST /api/accounts/auth/register/patient/` | Patient self-registration |
| `POST /api/accounts/auth/token/` | Obtain JWT access & refresh tokens |
| `GET /api/accounts/users/me/` | Retrieve the authenticated user's profile & redirect target |
| `GET /api/doctors/` | List doctors (searchable) |
| `GET /api/patients/` | List patients (searchable) |
| `GET/POST /api/appointments/` | Appointment CRUD (filtered by role) |
| `PATCH /api/appointments/<id>/` | Update appointment status/details |

All API endpoints (except registration and token) require a Bearer token in the `Authorization` header.

## Project Structure

```
backend/
├── accounts/          # Custom user model, registration, auth utilities
├── appointments/      # Doctor/Patient/Appointment models, serializers, viewsets
├── config/            # Django project configuration
frontend/
├── src/               # React application source code
└── package.json       # Frontend dependencies and scripts
```

## Tests & Quality

- Run `python manage.py check` to validate the Django project configuration.
- Build the frontend with `npm run build` to ensure the React app compiles successfully.

## License

This project is provided as-is for demonstration purposes.
