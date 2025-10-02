# DocConnect – Doctor's Appointment Application

DocConnect is a full-stack Django application for managing doctor appointments with dedicated dashboards for administrators, doctors, and patients. The interface is powered by Tailwind CSS, HTMX, and Alpine.js to deliver a responsive and interactive experience.

## Features

- **Role-based authentication** using Django groups for Admin, Doctor, and Patient roles.
- **Custom dashboards**
  - Admin panel (`/admin-panel/dashboard`) with statistics and CRUD tools for doctors, patients, and appointments.
  - Doctor panel (`/doctor-panel/dashboard`) with upcoming appointments, inline status updates, and live search.
  - Patient panel (`/patient-panel/dashboard`) with booking form, history, and instant search/filtering.
- **HTMX-enhanced interactions** for appointment booking, live table filtering, and inline status updates without full page refreshes.
- **Alpine.js UI helpers** for collapsible panels and toasts.
- **Sample seed data** created automatically on first migration with demo users and appointments.

## Tech Stack

- Python 3 / Django 5
- SQLite
- Tailwind CSS, HTMX, Alpine.js

## Getting Started

1. Install dependencies:
   ```bash
   pip install -r requirements.txt  # or `pip install django`
   ```
2. Apply migrations (seed data is created automatically after migrations):
   ```bash
   python manage.py migrate
   ```
3. Run the development server:
   ```bash
   python manage.py runserver
   ```
4. Visit `http://localhost:8000/` to access the login screen.

## Demo Accounts

| Role   | Username | Password    | Dashboard URL               |
|--------|----------|-------------|-----------------------------|
| Admin  | admin    | admin123    | `/admin-panel/dashboard`    |
| Doctor | doctor1  | doctor123   | `/doctor-panel/dashboard`   |
| Patient| patient1 | patient123  | `/patient-panel/dashboard`  |

## Running Tests

The project currently relies on manual verification. After starting the development server you can log in with the credentials above to explore each dashboard.
