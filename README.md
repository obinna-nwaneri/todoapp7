# Doctor's Appointment App

A full-stack demo application for managing doctor appointments. Patients can register, book visits, and view appointment statuses while administrators manage doctors and approve or reject appointment requests.

## Technology stack

- **Backend:** Python 3, Django, Django REST Framework, JWT authentication
- **Database:** SQLite (default Django configuration)
- **Frontend:** React with Bootstrap 5 for styling

## Features

### Patients
- Create an account, log in, and maintain a basic profile
- Book appointments by selecting a doctor, date, time, and describing symptoms
- See upcoming and past appointments with approval/rejection badges
- Update profile details and change password

### Administrators
- Access admin portal at `/admin-panel/`
- Manage doctors (create, edit, delete)
- Review all appointments and approve or reject requests
- View the list of registered patients and their submitted symptoms

## Getting started

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

Key API endpoints live under `/api/`. JWT authentication is used for protected routes.

Seeded accounts:

- Patient — `user@example.com` / `user123`
- Admin — `admin@example.com` / `admin123`

The traditional Django admin is available at `http://localhost:8000/admin-panel/`.

### Frontend

```bash
cd frontend
npm install
npm start
```

The React UI communicates with the Django backend (proxy configured for `localhost:8000`).

## Project structure

```
backend/   # Django project (core) and appointments app with REST API
frontend/  # React single-page app for patient and admin portals
```

## Running tests

This sample project does not include automated tests. Use the provided credentials to explore the app manually.
