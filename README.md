# Todo App Today

Todo App Today is a multi-user task manager built with Django, Tailwind CSS, HTMX, and Alpine.js. It supports rapid inline task updates, robust filtering, and a staff-only analytics dashboard backed by an activity log.

## Features

- Username/password authentication with registration, login, logout, and password change flows.
- Task management per user with priorities, statuses, due dates, and inline HTMX-powered actions.
- Responsive layout using Tailwind CSS (CDN) with Alpine.js enhancements for filter toggles and toast notifications.
- Activity logging for task CRUD events and auth events, powering a real-time admin dashboard with KPIs and recent activity.
- Custom staff dashboard at `/admin/dashboard/` plus full Django admin access at `/django-admin/`.

## Getting started

```bash
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
pip install django
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

1. Visit `http://127.0.0.1:8000/` to explore the landing page and sign up.
2. Log in with your new account to manage tasks at `/tasks/`.
3. Sign in as a staff/superuser and navigate to `/admin/dashboard/` for activity insights.
4. Use `/django-admin/` for full administrative control.

## Testing

Run the automated test suite:

```bash
python manage.py test
```

Enjoy productive planning with Todo App Today! 🎯
