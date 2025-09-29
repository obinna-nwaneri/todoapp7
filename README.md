# TaskFlow Todo Application

A full-stack to-do manager built with Django REST Framework and React. The project features JWT authentication, task management with advanced filtering, and an admin analytics dashboard.

## Project structure

```
.
├── server/   # Django REST Framework backend
└── client/   # React + Vite frontend
```

## Backend setup

```bash
cd server
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py createsuperuser  # optional for admin access
python manage.py runserver
```

### Key backend features

- JWT authentication (login, refresh, logout, password change) with [`djangorestframework-simplejwt`](https://django-rest-framework-simplejwt.readthedocs.io/)
- Per-user task CRUD operations with filters, search, ordering, and pagination
- Activity logging for security-sensitive events and task changes
- Admin panel REST endpoints exposing metrics, user lists, task management, and activity feed
- Comprehensive tests for auth and task APIs (`python manage.py test`)

## Frontend setup

```bash
cd client
npm install
npm run dev
```

Set `VITE_API_URL` in `.env` if the backend runs on a non-default host or port.

### Frontend highlights

- React Router navigation with protected/authenticated routes
- React Query data fetching, caching, and mutation management
- Tailwind CSS styling with responsive layouts
- Authentication context handling login, registration, logout, and password change flows
- Admin dashboard with metrics, user insights, activity log, and global task management
- Vitest + React Testing Library integration tests (`npm test`)

## Docker & production

You can containerize the stack by extending this repository with Dockerfiles and deployment scripts. Environment variables are sourced from `.env` files for both backend and frontend.
