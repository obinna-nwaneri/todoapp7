# Doctor's Appointment System

A full-stack doctor appointment scheduling platform built with Django REST Framework and React. It supports JWT authentication, role-based dashboards for admins, doctors and patients, availability management, and smart booking rules that prevent overlaps or off-slot appointments.

## Project Structure

```
doctors-appointment/
  backend/
    core/            # Django project
    appointments/    # Domain app
    manage.py
    requirements.txt
  frontend/
    index.html
    src/
    package.json
  README.md
```

## Backend Setup (Django + DRF)

```bash
cd doctors-appointment/backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver 0.0.0.0:8000
```

### Seed sample data

```bash
python manage.py seed_sample
```

The seed command creates sample specialties, doctors (with weekday availability), patients and a curated set of appointments across different statuses.

### Running tests

```bash
python manage.py test
```

## Frontend Setup (React + Vite)

```bash
cd doctors-appointment/frontend
npm install
npm run dev
```

The development server runs at [http://localhost:5173](http://localhost:5173) and expects the API at `http://localhost:8000/api`.

## Features

- Patient self-service registration and JWT-based authentication
- Role-aware dashboards for patients, doctors and administrators
- Doctor availability management with automatic slot generation
- Appointment booking with validation against overlapping times and availability
- Doctor schedule management with status workflows (Pending → Confirmed → Completed/Cancelled)
- Admin overview with quick stats and recent activity
- React Query powered data fetching with automatic token refresh handling

## Environment

- Time zone: **Africa/Lagos (UTC+1)**
- CORS enabled for `http://localhost:5173`
- JWT authentication via `djangorestframework-simplejwt`

Enjoy building on top of the system!
