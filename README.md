# Contact Management App

A full-stack contact management application featuring a Node.js/Express API with SQLite storage and a React front-end. The app supports admin authentication and CRUD operations for contacts.

## Features

- Secure admin login with JWT-based authentication.
- RESTful API built with Express.js and SQLite for persistence.
- Auto-seeded database with sample contacts for immediate testing.
- React dashboard that surfaces total contacts and recent activity.
- Interactive contacts table with search, filtering, add, edit, and delete actions.
- Form validation for creating and updating contacts.

## Project Structure

```
.
├── backend        # Express API and SQLite database
├── frontend       # React application (Vite powered)
└── .env.example   # Sample environment configuration
```

## Prerequisites

- Node.js 18+
- npm 9+

## Getting Started

### 1. Configure Environment Variables

Copy the sample environment file and adjust values as needed:

```bash
cp .env.example .env
```

The defaults create an `admin` user with password `password123` and point the frontend to the backend API.

### 2. Install Dependencies

#### Backend

```bash
cd backend
npm install
```

#### Frontend

```bash
cd ../frontend
npm install
```

### 3. Run the Applications

#### Start the API Server

```bash
cd backend
npm start
```

The server listens on [http://localhost:4000](http://localhost:4000). On first run it will initialize `database.sqlite`, create the default admin user, and seed 15 sample contacts.

#### Start the React App

In a separate terminal:

```bash
cd frontend
npm run dev
```

This launches the frontend at [http://localhost:5173](http://localhost:5173). Vite is configured to proxy API calls to the backend.

### 4. Login Credentials

Use the default admin credentials to sign in:

- **Username**: `admin`
- **Password**: `password123`

You can change these via environment variables before starting the backend.

## API Endpoints

- `POST /api/login` – Authenticate and retrieve a JWT token.
- `GET /api/contacts` – List contacts with optional `search` query parameter.
- `GET /api/contacts/:id` – Retrieve a single contact.
- `POST /api/contacts` – Create a new contact.
- `PUT /api/contacts/:id` – Update an existing contact.
- `DELETE /api/contacts/:id` – Delete a contact.

All `/api/contacts` routes require a valid `Authorization: Bearer <token>` header.

## Scripts

### Backend

- `npm start` – Run the production server.
- `npm run dev` – Start the server with automatic reload using Nodemon.

### Frontend

- `npm run dev` – Start the development server.
- `npm run build` – Create a production build.
- `npm run preview` – Preview the production build locally.

## Notes

- The database file `database.sqlite` lives in the backend directory. Delete it to reset data.
- Update `VITE_API_URL` in `.env` if running the backend on a different host or port.
- The frontend persists the JWT in `localStorage` for session continuity.
