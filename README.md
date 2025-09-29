# Todo Project

A simple Django-based to-do application with user management and staff portal.

## Quick Start

```bash
python -m venv .venv
source .venv/bin/activate  # On Windows use .venv\\Scripts\\activate
pip install "Django>=4.2,<5.0"
python manage.py migrate
python manage.py seed_demo
python manage.py runserver
```

### Demo Accounts
- Backend Admin: `admin` / `admin`
- Frontend User: `jane` / `password`

Django Admin is available at `/admin` and the Staff Portal at `/staff/users/`.
