# DocScheduler

A demo doctor's appointment application built with Django, HTMX, Tailwind CSS, and Alpine.js.

## Features

- Patient self-registration, login, and dashboard
- Appointment booking with symptom capture and live updates powered by HTMX
- Upcoming and past appointment management with inline status labels
- Profile management with password updates
- Admin panel at `/admin-panel` with appointment approvals, doctor CRUD, and patient overview

## Quickstart

```bash
python manage.py migrate
python manage.py runserver
```

Seeded accounts:

- Patient — `patient1` / `patient123`
- Admin — `admin` / `admin123`

Visit `http://localhost:8000/` for the patient experience or `http://localhost:8000/admin-panel/` for the admin dashboard.
