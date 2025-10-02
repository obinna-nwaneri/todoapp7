# Enterprise Doctor Appointment Platform

A full-stack enterprise-grade doctor appointment management system featuring a Django REST API backend and a Vite + React frontend. The platform supports three roles (Admin, Doctor, Patient) with JWT-based authentication, advanced appointment workflows, and search/filter/pagination across all data grids.

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
- Vite 5.2.0
- React 18.2.0
- react-router-dom 6.22.3
- axios 1.6.8

## Getting Started

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_enterprise_data
python manage.py runserver
```
The API will be available at `http://localhost:8000/` and exposes REST endpoints under `/api/`.

Seeded credentials:
- Admin: `admin@example.com` / `admin123`
- Doctor: `doctor1@example.com` / `doctor123`
- Patient: `patient1@example.com` / `patient123`

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The React app runs at `http://localhost:5173/`. Update `frontend/.env` if you host the API elsewhere.

## Key Features
- **Role-based dashboards** with contextual navigation.
- **JWT Authentication** (login, refresh, profile lookup) with role-based route guards.
- **Admin Portal** for CRUD + search/filter/pagination on doctors, patients, and appointments, plus platform statistics.
- **Doctor Portal** for viewing and updating their appointments (status management and filtering).
- **Patient Portal** with appointment booking (symptom capture, double-booking prevention), management, and history views.
- **Seed command** (`seed_enterprise_data`) for bootstrapping demo data.

## Project Structure
```
backend/
  accounts/        # Custom user model, auth endpoints, seed command
  doctors/         # Doctor profiles and public directory
  patients/        # Patient profiles
  appointments/    # Appointment scheduling domain
  backend/         # Django project configuration & routers
frontend/
  src/
    pages/         # React route pages per role
    components/    # Shared UI components (e.g., ProtectedRoute)
    context/       # Auth context with token refresh handling
```

## Testing the Experience
1. Run both backend and frontend.
2. Log in using the seeded credentials to verify role-based redirects.
3. As a patient, book an appointment (symptoms must be ≥10 characters). The API enforces date/time validation and double-booking prevention.
4. As a doctor, approve or reject pending appointments.
5. As an admin, manage entities and observe statistics updates in the dashboard.

## License
This project is provided as part of an AI-generated sample. Adapt as needed for real-world deployments.
