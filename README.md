# To-Do App

A full-stack to-do application built with Django REST Framework and React. The project includes JWT-based authentication, an admin dashboard, and sample data to get started quickly.

## Features

- User registration and authentication with JSON Web Tokens (JWT)
- Task management (create, read, update, delete) scoped to the authenticated user
- Admin-specific APIs and UI for managing users and tasks across the system
- Dashboard views with task statistics for both end users and administrators
- Pre-seeded database with an admin account, two regular users, and sample tasks

## Project Structure

```
backend/   # Django project (REST API + admin)
frontend/  # React application
```

## Requirements

- Python 3.11+
- Node.js 18+
- npm or yarn

## Backend Setup

1. **Install dependencies**

   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Run migrations and seed sample data**

   ```bash
   python manage.py migrate
   python manage.py seed_data
   ```

   The seed command creates:

   - Admin user: `admin` / `adminpass123`
   - Regular users: `jane` / `janepass123`, `mike` / `mikepass123`

3. **Start the development server**

   ```bash
   python manage.py runserver
   ```

   The API will be available at `http://localhost:8000/api/`.

## Frontend Setup

1. **Install dependencies**

   ```bash
   cd frontend
   npm install
   ```

2. **Configure environment (optional)**

   The frontend defaults to calling the backend at `/api/`. If your backend runs on a different origin, create a `.env` file and set:

   ```bash
   REACT_APP_API_URL=http://localhost:8000/api/
   ```

3. **Start the React development server**

   ```bash
   npm start
   ```

   The app will be available at `http://localhost:3000/` and proxies API requests to the Django server.

## Running Tests

- Django: `python manage.py test`
- React (Jest): `npm test`

## Admin Dashboard

Visit `http://localhost:8000/admin/` and log in with the admin credentials from the seed command. The custom admin dashboard shows quick metrics for users and tasks alongside the standard Django admin functionality.

## API Overview

| Method | Endpoint             | Description                         |
| ------ | -------------------- | ----------------------------------- |
| POST   | `/api/register`      | Register a new user                 |
| POST   | `/api/login`         | Obtain JWT access/refresh tokens    |
| POST   | `/api/token/refresh` | Refresh the access token            |
| GET    | `/api/tasks`         | List tasks for the authenticated user (admins see all) |
| POST   | `/api/tasks`         | Create a task                       |
| GET    | `/api/tasks/<id>`    | Retrieve task details               |
| PUT    | `/api/tasks/<id>`    | Update a task                       |
| DELETE | `/api/tasks/<id>`    | Delete a task                       |
| GET    | `/api/dashboard`     | Summary stats for the current user  |
| GET    | `/api/admin/users`   | List all users (admin only)         |
| GET    | `/api/admin/summary` | Global task/user summary (admin only) |

## Licensing

This project is provided for demonstration purposes. Adapt and extend as needed for your own projects.
