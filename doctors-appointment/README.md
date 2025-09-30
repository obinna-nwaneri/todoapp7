# Doctor's Appointment System

A full-stack demo for managing doctor appointments with a Django REST API backend and a React (Vite) single-page frontend.

## Project Structure

```
doctors-appointment/
  backend/
    core/             # Django project
    appointments/     # Domain app with API, models, tests, seeders
  frontend/           # React SPA (Vite)
```

## Backend Setup

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

### (Optional) Create an admin user

```bash
python manage.py createsuperuser
```

### Seed sample data

```bash
python manage.py seed_sample
```

## Frontend Setup

```bash
cd ../frontend
npm install
npm run dev
```

Open <http://localhost:5173> for the React app. The API is served from <http://localhost:8000/api>.

## Seeded Accounts

All seeded users share the password **`Passw0rd!`**.

- Patients: `patient_tolu`, `patient_chioma`, `patient_segun`, `patient_fatima`, `patient_emeka`
- Doctors: `dr_adebayo`, `dr_okafor`, `dr_bello`

Use these credentials to explore the system quickly.
