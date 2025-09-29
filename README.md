# To-Do App

This repository contains a Django 4.2 To-Do web application with a Bootstrap-powered frontend, user authentication, and a custom staff dashboard.

## Quick Start

```bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\\Scripts\\activate
pip install "Django>=4.2,<5.0"
python manage.py migrate
python manage.py seed_demo
python manage.py runserver
```

### Demo Accounts
- Frontend user: `jane` / `password`
- Staff & superuser: `admin` / `admin`
  - Django Admin: http://localhost:8000/admin
  - Custom Admin Dashboard: http://localhost:8000/admin-panel/
