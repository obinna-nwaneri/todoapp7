# Enterprise Todo Application

This repository contains a full-stack enterprise-ready todo management platform with a Django REST API backend and a React frontend.

## Features

- **JWT authentication** with registration and login endpoints.
- **Role-based access control** with Admin and User roles.
- **Task management API** providing CRUD operations and filtering by task owner.
- **React dashboard** tailored for admins (all tasks) and regular users (own tasks only).
- **Django admin panel** for managing users and tasks directly.

## Technology Stack

- Backend: Django, Django REST Framework, SimpleJWT, SQLite
- Frontend: React (create-react-app structure), Axios, React Router

## Getting Started

### Prerequisites

- Python 3.12+
- Node.js 18+
- npm 9+

### Backend Setup

```bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\\Scripts\\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

The API will be available at `http://localhost:8000/api/`.

#### Default Accounts

| Role  | Username | Password |
|-------|----------|----------|
| Admin | admin    | admin123 |
| User  | john     | john123  |

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

The React application runs at `http://localhost:3000` and communicates with the backend API on port 8000.

### Running Tests

- Backend tests: `python manage.py test`
- Frontend tests: `npm test`

## Project Structure

```
enterprise_todo/    # Django project configuration
manage.py           # Django management entry point
tasks/              # Custom user & task management app
frontend/           # React frontend application
```

## API Overview

- `POST /api/auth/register/` – Create a new user.
- `POST /api/auth/login/` – Obtain JWT access & refresh tokens.
- `POST /api/auth/refresh/` – Refresh JWT token.
- `GET /api/auth/me/` – Retrieve the authenticated user's profile.
- `GET /api/tasks/` – List tasks (admins see all, users see their own).
- `POST /api/tasks/` – Create a new task.
- `PUT/PATCH /api/tasks/{id}/` – Update a task.
- `DELETE /api/tasks/{id}/` – Delete a task.

## Environment Variables

Default configuration works with local development defaults. Update `enterprise_todo/settings.py` to customize database, CORS, or JWT behavior.

## License

This project is provided as-is for demonstration purposes.
