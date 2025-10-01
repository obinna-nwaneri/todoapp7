# Enterprise To-Do Application

A full-stack enterprise-ready to-do management platform built with Django, Django REST Framework, JWT authentication, and a React (Vite) frontend. The solution supports role-based dashboards for end users and administrators.

## Features

### Authentication
- JWT authentication powered by Django REST Framework + Simple JWT
- User registration and login flows
- Auto-seeded accounts:
  - **Admin:** `admin` / `Admin@123`
  - **User:** `johndoe` / `User@123`

### User Experience
- Personal dashboard for managing tasks (create, update, delete)
- Filter tasks by status and priority
- Upcoming tasks widget ordered by due date

### Administration
- Custom Django Admin at `/admin-panel/`
- React admin dashboard with insights and management tools
  - User and task CRUD
  - Statistics cards + task status pie chart
  - Latest registered users list

### API Endpoints
- `POST /api/auth/register/` – register a new account
- `POST /api/auth/login/` – obtain access & refresh tokens
- `POST /api/auth/token/refresh/` – refresh JWT access token
- `GET /api/auth/user/` – fetch the authenticated user profile
- `GET|POST /api/tasks/` – manage authenticated user tasks
- `GET|POST /api/admin/users/` – admin user management
- `GET|POST /api/admin/tasks/` – admin task management
- `GET /api/admin/overview/` – admin dashboard stats

## Project Structure

```
backend/        # Django project and REST API
frontend/       # React (Vite) single-page application
```

## Prerequisites
- Python 3.10+
- Node.js 18+
- npm

## Backend Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

The backend serves on `http://127.0.0.1:8000/`.

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The React application runs on `http://127.0.0.1:5173/`. API requests are proxied to the Django backend via Vite's dev server configuration.

## Running the Full Stack
1. Start the Django backend server (`python manage.py runserver`).
2. In a separate terminal, start the React dev server (`npm run dev`).
3. Visit `http://127.0.0.1:5173/` to access the app.

## Additional Notes
- CORS is configured to allow the frontend (port 5173) during development.
- JWT access tokens last for 60 minutes; refresh tokens last for 1 day.
- The admin SPA is available at `/admin-panel/dashboard` while the Django admin stays at `/admin-panel/`.
