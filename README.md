# Contact Management App

This repository contains a full-stack contact management application built with a Django REST API and a React frontend.

## Features

- JWT-secured API for listing, creating, updating, and deleting contacts
- Django admin configured for managing contacts
- React interface with login, dashboard overview, searchable contact table, and forms for adding/editing contacts
- SQLite database preloaded with sample contacts via fixtures

## Project Structure

```
backend/   # Django project (config) and contacts app
frontend/  # React + Vite single-page application
```

## Backend Setup

1. Install Python dependencies:

   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. Apply migrations and load sample data:

   ```bash
   python manage.py migrate
   python manage.py loaddata contacts/fixtures/contacts.json
   ```

3. Create an admin user for logging in:

   ```bash
   python manage.py createsuperuser
   ```

4. Run the development server:

   ```bash
   python manage.py runserver
   ```

The API will be available at `http://127.0.0.1:8000/api/`.

### API Endpoints

| Method | Endpoint              | Description                | Auth |
| ------ | -------------------- | -------------------------- | ---- |
| POST   | `/api/login`         | Obtain JWT access token    | No   |
| POST   | `/api/token/refresh` | Refresh JWT access token   | No   |
| GET    | `/api/contacts`      | List contacts              | Yes  |
| POST   | `/api/contacts`      | Create a new contact       | Yes  |
| GET    | `/api/contacts/:id`  | Retrieve contact by ID     | Yes  |
| PUT    | `/api/contacts/:id`  | Update an existing contact | Yes  |
| DELETE | `/api/contacts/:id`  | Delete a contact           | Yes  |

## Frontend Setup

1. Install Node.js dependencies (Node 18+ recommended):

   ```bash
   cd frontend
   npm install
   ```

2. Start the Vite development server:

   ```bash
   npm run dev
   ```

The frontend runs on `http://localhost:3000` and proxies API requests to the Django backend.

## Authentication Flow

- Login with the credentials created via `createsuperuser`.
- Successful login stores the JWT tokens in `localStorage`.
- Protected routes redirect to `/login` if the access token is missing.

## Running Tests

- Backend: `python manage.py test`
- Frontend: Add tests with your preferred framework (e.g., Vitest, Jest).

## License

This project is provided as-is for demonstration purposes.
