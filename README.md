# Doctor Appointment System

A full-stack doctor appointment management platform built with Django REST Framework and React. It supports patient registration, JWT-based authentication, doctor/patient/appointment management, and a Bootstrap-powered admin dashboard.

## Features

- Django backend with REST API endpoints for doctors, patients, and appointments
- JWT authentication via `djangorestframework-simplejwt`
- Seed fixtures for sample doctors, patients, and appointments
- React frontend with protected admin routes, dashboards, and CRUD interfaces
- SQLite database using Django ORM

## Getting Started

### Backend

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd backend
python manage.py migrate
python manage.py loaddata appointments/fixtures/sample_data.json
python manage.py createsuperuser  # optional admin access
python manage.py runserver 0.0.0.0:8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```

### Environment Notes

- The frontend expects the API at the same origin under `/api`. When running locally, configure a proxy (e.g., Vite dev server proxy) or update `frontend/src/api.js` with the backend URL.
- JWT tokens are stored in `localStorage`. Admin-only routes are protected on the client side and via DRF permissions.

## API Overview

| Method & Path | Description | Auth |
| --- | --- | --- |
| `POST /api/register` | Register a new patient | Public |
| `POST /api/login` | Obtain JWT access/refresh tokens | Public |
| `GET /api/doctors` | List doctors | Public |
| `POST /api/doctors` | Create doctor | Admin |
| `GET /api/patients` | List patients | Admin |
| `POST /api/patients` | Create patient | Authenticated |
| `GET /api/appointments` | List appointments (filter by `?doctor` / `?patient`) | Authenticated |
| `POST /api/appointments` | Create appointment | Authenticated |
| `PUT /api/appointments/:id` | Update appointment | Authenticated |
| `DELETE /api/appointments/:id` | Cancel appointment (marks as cancelled) | Authenticated |

## Sample Data

Run the `loaddata` command above to preload:

- 3 doctors across cardiology, dermatology, pediatrics
- 3 patients with contact details
- 5 appointments in scheduled, completed, and cancelled states

## License

MIT
