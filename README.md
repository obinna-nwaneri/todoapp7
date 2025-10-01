# Mediko Doctor Appointment Platform

A production-ready, server-rendered doctor's appointment booking and management system built with Django 5, Tailwind CSS, HTMX, and Alpine.js.

## Features
- Patient portal for booking, managing, and reviewing appointments and prescriptions
- Doctor portal for availability management, confirmations, cancellations, and patient records
- Public doctor directory with specialty filters and real-time availability via HTMX
- Admin panel with KPIs, user management, specialty/content CRUD, CSV-ready reports, and audit logging
- Notification scaffold with in-app dropdown and email/SMS extension points
- Time-zone aware scheduling (Africa/Lagos) with configurable slot length and cancellation window
- Sample data including 1 superuser, 5 verified doctors, 8 patients, specialties, appointments, FAQs, CMS pages, and announcements

## Getting started

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py loaddata sample_data.json
python manage.py runserver
```

The development server runs at `http://localhost:8000/`.

### Tailwind development
Tailwind CSS is pulled from CDN for simplicity. For production builds, replace with a compiled asset pipeline or Django Tailwind integration.

## Default accounts
- Superuser: `admin@example.com` / `Admin@123`
- Patients: `patient1@example.com` ... `patient8@example.com` (password `Patient@123`)
- Doctors: `doctor1@example.com` ... `doctor5@example.com` (password `Doctor@123`)

Doctor logins are verified and active in the sample data. New doctor registrations require admin approval.

## Tests
Run the pytest suite:

```bash
pytest
```

## Reminders
- Use `python manage.py send_reminders` as a cron hook for 24h/2h notifications (supports `--dry-run` and configurable windows).
- HTMX endpoints respond with partials for smooth UX; CSRF headers are injected automatically via a global `htmx:configRequest` listener.
- Admin actions hitting `/admin-panel/` are audited via middleware.
