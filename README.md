# Doctor/Patient Appointment System

A full-stack scheduling platform built with Django REST Framework and React that enables clinics to manage doctors, patients, availability, and appointments with role-based dashboards.

## Features

- **Authentication & RBAC**: Email-based login using JWT with custom roles (Admin, Doctor, Patient), registration for doctors/patients, password reset, and admin account control.
- **Profiles & Availability**: Manage doctor and patient profiles, doctor recurring availability rules, and administrative time blocks.
- **Appointment Workflow**: Patients book with required symptoms, validation against availability & conflicts, lifecycle status transitions (Pending → Approved/Rejected/Cancelled → Completed), and cancellation policies.
- **Dashboards**: Role-specific dashboards for KPIs, upcoming schedules, pending approvals, and quick actions.
- **Search & Filtering**: Paginated, searchable lists of users and appointments with status/date filters and CSV export for admins.
- **Notifications & Reminders**: Console email notifications on booking/status changes and reminder management command.
- **Audit Logging**: Automatic logging of key security and admin actions.
- **Seed Data**: Preloaded users and appointments via management command for instant demos.

## Tech Stack

- **Backend**: Python 3.12, Django 5.1.1, Django REST Framework, JWT auth, SQLite
- **Frontend**: React 18 with Vite, Axios, React Router

## Getting Started

### Backend

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_data  # creates demo admin/doctor/patient + sample appointments
python manage.py runserver
```

**Seeded credentials**

| Role   | Email                 | Password   |
| ------ | --------------------- | ---------- |
| Admin  | `admin@example.com`   | `admin123` |
| Doctor | `doctor1@example.com` | `doctor123`|
| Patient| `patient1@example.com`| `patient123`|

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Vite serves the SPA at `http://localhost:5173` and talks to the backend running on `http://localhost:8000` (configurable via `frontend/.env`).

## API Highlights

- `POST /api/auth/login` + `GET /api/auth/me` – authenticate and fetch current user
- `POST /api/auth/register/{doctor|patient}` – self-service registration
- `GET /api/admin/dashboard` – admin KPI metrics
- `GET /api/admin/appointments/export` – CSV export of filtered appointments
- `GET /api/public/doctors` – public doctor catalogue for booking flow
- `POST /api/patient/appointments/` – patient booking with symptom validation
- `PATCH /api/doctor/appointments/<id>/` – doctor status updates
- `POST /api/patient/appointments/<id>/cancel/` – cancellation respecting policy window
- `python manage.py send_reminders` – send 24h/2h reminders (console email output)

## Project Structure

```
backend/             Django project & settings
accounts/            Custom user model, auth endpoints
appointments/        Scheduling models, serializers, viewsets
core/                Audit logs, global settings, utilities
doctors/             Doctor profiles & availability
patients/            Patient profiles
frontend/            React SPA (Vite) for dashboards & booking
```

## Development Notes

- REST responses are paginated (page size 10) and support `search`/`ordering` query parameters.
- Appointment validation enforces availability windows, unique doctor time slots, and symptom length requirements (≥10 chars).
- Notifications default to console email; integrate a real provider by changing `EMAIL_BACKEND` in `backend/settings.py`.
- Global cancellation/reminder settings are stored in `core.GlobalSetting` and exposed via helpers in `core.utils`.

## Licensing

Provided for demonstration purposes.
