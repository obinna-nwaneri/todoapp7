# Todo App 7

A full-stack to-do management platform built with Django 4.2, Bootstrap 5, HTMX, and Alpine.js. The app offers end-user task management plus a custom staff admin dashboard with live metrics and audit logging.

## Features
- User registration, login, logout, and password change flows using Django auth.
- Personal task dashboard with HTMX-powered filtering and CRUD operations.
- Activity logging for logins, logouts, and all task/user CRUD actions.
- Custom staff dashboard at `/admin-panel/` with live metrics, activity feed, and inline task/user management.
- Seed script that creates demo accounts and tasks.

## Quick Start
```bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install "Django>=4.2,<5.0"
python manage.py migrate
python manage.py seed_demo
python manage.py runserver
```

Visit `http://127.0.0.1:8000/` to start using the app.

### Demo Credentials
- Admin: `admin` / `admin` (accesses `/admin-panel/` and Django admin `/admin`)
- User: `jane` / `password`

## Project Structure
```
todo_project/
├── accounts/        # Registration, staff dashboard, signals, and admin tools
├── tasks/           # Task models, forms, and user-facing views
├── audit/           # Activity log model and admin registration
├── templates/       # Global templates (base layout)
└── static/          # Compiled CSS/JS assets
```

## Testing
Run Django's built-in test runner or add your own tests as needed:
```bash
python manage.py test
```

## License
MIT
