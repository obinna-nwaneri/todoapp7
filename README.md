# Doctor's Appointment App

This project is a full-stack scheduling portal built with Django REST Framework and React. It allows patients to request doctor appointments, record symptoms, and track approvals while providing administrators with tools to manage doctors and appointment statuses.

## Features

### Patient
- Registration and JWT-based login (sample user `user@example.com` / `user123`).
- Dashboard to view doctors, request appointments, and track upcoming/past visits.
- Ability to record symptoms when booking.
- Profile management with name updates and password change.

### Admin
- Login via the same interface using `admin@example.com` / `admin123`.
- Dedicated dashboard to manage doctors (create, edit, delete) and appointment statuses.
- View all patient bookings with captured symptoms and approve, reject, or reset them.
- Access the built-in Django admin at `/admin-panel/`.

## Tech Stack
- **Backend:** Python 3, Django, Django REST Framework, Simple JWT, SQLite.
- **Frontend:** React (Vite), React Router, Bootstrap.

## Getting Started

### Backend
```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd backend
python manage.py migrate
python manage.py runserver
```
The database seeds itself with the sample admin, patient, and two doctors during migrations.

### Frontend
```bash
cd frontend
npm install
npm run dev
```
The Vite development server proxies API requests to `http://localhost:8000`.

## Environment Variables
- `VITE_API_BASE_URL` (optional): Override the default API base URL used by the frontend.

## Testing Users
- **Patient:** `user@example.com` / `user123`
- **Admin:** `admin@example.com` / `admin123`

## Admin Interface
Visit `http://localhost:8000/admin-panel/` and sign in with the admin credentials to use Django's built-in admin site.

---

Feel free to extend the styling, add email notifications, or integrate calendar reminders to enhance the experience.
