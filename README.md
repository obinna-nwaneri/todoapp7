# Enterprise Doctor Appointment Application

This repository contains a full-stack enterprise appointment management platform for doctors, patients, and administrators. It provides secure JWT authentication, role-based dashboards, advanced appointment workflows, and search and pagination for all resources.

## Tech Stack

### Backend
- Python 3.12+
- Django 5.1.1
- Django REST Framework 3.15.2
- SimpleJWT 5.3.1
- django-filter 24.3
- django-cors-headers 4.4.0
- SQLite (default)

### Frontend
- Node.js 18+
- React 18.2.0 with Vite 5.2.0
- react-router-dom 6.22.3
- axios 1.6.8

## Project Structure

```
backend/
  manage.py
  backend/          # Django project configuration
  accounts/         # Custom user model, auth endpoints, permissions
  doctors/          # Doctor profiles and admin/public APIs
  patients/         # Patient profiles and admin/patient APIs
  appointments/     # Appointment models and role-aware viewsets
frontend/
  src/              # React application source code
```

## Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows use venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_enterprise_data
python manage.py runserver
```

### Seeded Accounts

| Role  | Email                | Password   |
|-------|----------------------|------------|
| Admin | admin@example.com    | admin123   |
| Doctor| doctor1@example.com  | doctor123  |
| Patient| patient1@example.com| patient123 |

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Create a `.env` file based on `.env.example` to customise the API base URL if required.

## Key Features
- Custom user model with ADMIN, DOCTOR, and PATIENT roles.
- JWT authentication with login, refresh, and profile (`/api/auth/me`).
- Role-aware routers:
  - `/api/admin/` for admin dashboards, CRUD, and stats.
  - `/api/doctor/` for doctor profile management and appointment triage.
  - `/api/patient/` for patient profile management, booking, editing, and cancellation.
  - `/api/public/doctors/` for appointment discovery and search.
- Appointment validation for double-booking prevention, date checks, and symptom requirements.
- Management command `seed_enterprise_data` to bootstrap demo content.
- React dashboards for each role with search, pagination, CRUD modals, and booking workflows.

## Acceptance Tests
1. Login with each seeded user and verify redirection to the appropriate dashboard.
2. As a patient, book a new appointment with symptom notes and confirm it appears in the pending list.
3. Attempt to double-book the same doctor and slot to confirm validation errors.
4. As a doctor, update appointment statuses (approve/reject/complete) using the doctor panel.
5. As an admin, manage doctors, patients, and appointments via the admin panel with search and filters.
6. Ensure pagination controls iterate through list views in each panel.

## Development Tips
- Use the REST API under `http://localhost:8000/api`.
- Frontend development server runs at `http://localhost:5173` by default.
- When modifying authentication behaviour, update both the backend serializers/views and the React context provider to keep refresh flows aligned.
