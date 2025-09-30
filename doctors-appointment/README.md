# Doctor's Appointment System

Full-stack doctor's appointment scheduling platform built with Django REST Framework and a React (Vite) SPA frontend.

## Project Structure

```
doctors-appointment/
  backend/      # Django project (core) and appointments app
  frontend/     # React SPA built with Vite
```

## Backend

```
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:8000

# (Optional) Create superuser
python manage.py createsuperuser

# Seed sample data
python manage.py seed_sample
```

## Frontend

```
cd ../frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) for the React app. API at [http://localhost:8000/api](http://localhost:8000/api).

### Seeded Login Credentials

All seeded accounts use the password `Passw0rd!`.

- Patients: `patient_tolu`, `patient_chioma`, `patient_segun`, `patient_fatima`, `patient_emeka`
- Doctors: `dr_adebayo`, `dr_okafor`, `dr_bello`
