# Todo Manager

A simple Django-based to-do web application featuring user task management and a custom admin dashboard.

## Quick Start

```bash
python -m venv .venv && source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install "Django>=4.2,<5.0"
django-admin startproject todo_project .
python manage.py startapp accounts
python manage.py startapp tasks
python manage.py migrate
python manage.py seed_demo
python manage.py runserver
```

Demo accounts:

- Admin dashboard: `admin` / `admin` (custom dashboard at `/admin-panel/`, Django admin at `/admin`)
- Standard user: `jane` / `password`
