# Enterprise Doctor's Appointment Application

This project is a full-stack enterprise appointment management platform for clinics, featuring dedicated portals for administrators, doctors, and patients. The backend is built with Django REST Framework and JWT authentication, while the frontend is implemented with React, React Router, and Material UI.

## Features

- **Role-based authentication** with JWT tokens (Admin, Doctor, Patient) and automatic redirects to dedicated dashboards.
- **Admin panel** for managing doctors, patients, appointments, statistics, and role assignments (available at `/admin-panel`).
- **Doctor portal** with appointment filtering, status updates (approve, reject, complete), and schedule management.
- **Patient portal** for booking, updating, cancelling, and reviewing appointments including symptoms capture.
- **Search and filter** capabilities across entities and dashboards.
- **Seed script** to populate initial admin, doctor, patient accounts and sample appointments.

## Technology Stack

- **Backend:** Python 3, Django 4, Django REST Framework, Simple JWT, SQLite
- **Frontend:** React 18 (Vite), React Router, Material UI, Axios

## Getting Started

### Backend setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_data  # Creates default admin/doctor/patient users and sample appointments
python manage.py runserver 0.0.0.0:8000
```

Default accounts:

| Role   | Email                | Password   |
|--------|----------------------|------------|
| Admin  | admin@example.com    | admin123   |
| Doctor | doctor1@example.com  | doctor123  |
| Patient| patient1@example.com | patient123 |

The Django admin console is available at `http://localhost:8000/admin-panel/`.

### Frontend setup

```bash
cd frontend
npm install
npm run dev
```

The React application expects the backend to be available at `http://localhost:8000/api/`. Set `VITE_API_URL` in a `.env` file within the `frontend` directory if you need a different API base URL.

### Running tests

- **Backend:** `python manage.py test`
- **Frontend:** `npm run build`

## API Overview

The primary API endpoints are located under `/api/`:

- `auth/login/` – JWT authentication
- `auth/register/doctor/` – Doctor self-registration
- `auth/register/patient/` – Patient self-registration
- `auth/me/` – Retrieve the authenticated user and redirect target
- `doctors/`, `patients/`, `appointments/` – CRUD endpoints with filtering and search
- `dashboard/admin/`, `dashboard/doctor/`, `dashboard/patient/` – Role-specific summaries

Refer to the source code for detailed serializers, permissions, and viewset behaviour.

## Seeding data

Re-run `python manage.py seed_data` whenever you need to restore the default accounts and sample appointments.

## License

This project is provided as-is for demonstration purposes.
