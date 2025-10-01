# Doctor Appointment System

A full-stack doctor appointment management system built with NestJS, TypeORM (SQLite), and a React frontend. It provides role-based dashboards for admins, doctors, and patients with JWT authentication.

## Features

### Backend
- NestJS REST API with JWT authentication and role-based authorization (Admin, Doctor, Patient).
- Entities for doctors, patients, and appointments using TypeORM with SQLite.
- Endpoints to manage doctors, patients, and appointments (create, list, update, cancel).
- Database seeding with sample doctors, patients, and appointments plus default credentials.

### Frontend
- React application (Vite) with React Router, Axios, and Bootstrap styling.
- Login page supporting seeded admin, doctor, and patient accounts.
- Admin dashboard with statistics, doctor/patient management, and appointment overview.
- Doctor dashboard for viewing and updating appointment statuses.
- Patient dashboard for booking and canceling appointments.
- Appointment list page with filtering by doctor, status, and date.

## Getting Started

### Backend
1. Install dependencies and run the development server:
   ```bash
   cd backend
   npm install
   npm run start:dev
   ```
2. The API will be available at `http://localhost:3000`.
3. Seeded credentials:
   - Admin: `admin@example.com` / `admin123`
   - Doctors: `john@example.com`, `mary@example.com`, `alan@example.com` (password `admin123`)
   - Patients: `jane@example.com`, `michael@example.com`, `sarah@example.com` (password `admin123`)
   - Newly created users receive password `password123` by default.

### Frontend
1. Install dependencies and start the development server:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
2. The application runs on `http://localhost:5173` and proxies API requests to the backend.

## Building
- Backend: `cd backend && npm run build`
- Frontend: `cd frontend && npm run build`

Both commands are executed in CI to ensure the project compiles successfully.
