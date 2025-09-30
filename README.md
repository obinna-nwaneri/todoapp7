# MedBook – Doctor's Appointment System

MedBook is a full-featured scheduling platform for managing doctor–patient appointments. It offers role-based workflows for patients, doctors, and staff, with HTMX-enhanced interactions, Tailwind styling, and activity auditing.

## Features

- Patient self-service booking, rescheduling, cancellation, and history.
- Doctor availability management with automatic slot generation and conflict detection.
- Appointment lifecycle (pending → approved → completed/cancelled) with inline HTMX actions.
- Console email notifications for booking, approval/decline, cancellation, and reschedule updates.
- Custom staff dashboard with KPIs, today's schedule, and recent activity log.
- Audit logging for appointments and authentication events.

## Tech Stack

- Python 3 / Django 4.2 LTS
- SQLite (default dev database)
- Tailwind CSS (CDN), HTMX, Alpine.js
- Django authentication, sessions, CSRF protection

## Getting Started

### 1. Clone and install dependencies

```bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\\Scripts\\activate
pip install -r requirements.txt
```

### 2. Apply database migrations

```bash
python manage.py migrate
```

### 3. Create a superuser

```bash
python manage.py createsuperuser
```

### 4. Seed reference data (optional but recommended)

Populate the database with demo specialties, clinics, users, availability, and appointments:

```bash
python manage.py seed_sample_data
```

The command is idempotent—run it anytime to refresh the demo content.

**Demo accounts**

| Role        | Username     | Password   |
|-------------|--------------|------------|
| Staff admin | `medadmin`   | `admin1234`|
| Doctor      | `drstrange`  | `pass1234` |
| Doctor      | `drhouse`    | `pass1234` |
| Patient     | `patientjane`| `pass1234` |
| Patient     | `patientjohn`| `pass1234` |

### 5. Run the development server

```bash
python manage.py runserver
```

Visit <http://127.0.0.1:8000/> for the landing page.

## Usage

- **Patients** register and manage appointments via the "My appointments" area.
- **Doctors** access `/doctor/availability/` and `/doctor/appointments/` to maintain schedules and respond to requests.
- **Staff** visit `/admin/dashboard/` for KPIs and `/django-admin/` for the default Django admin.

Console email notifications appear in the terminal running the server.

## Tests

Run the automated suite:

```bash
python manage.py test
```

## Notes

- Default timezone is `Africa/Lagos` and all slots are generated using each doctor's weekly availability.
- Activity logs capture appointment lifecycle events, login/logout, and password changes.
- The project uses Django's console email backend in development; update `EMAIL_BACKEND` in `medproject/settings.py` for production mail delivery.
