# Doctor Appointment API

This project provides a simple RESTful API for managing doctors, patients, and appointments using Node.js, Express, Sequelize, and SQLite.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Seed the database with sample data:
   ```bash
   npm run seed
   ```
3. Start the development server:
   ```bash
   npm start
   ```

The API will be available at `http://localhost:3000`.

## Available Endpoints

- `GET /api/doctors` – List all doctors
- `POST /api/doctors` – Create a doctor
- `GET /api/patients` – List all patients
- `POST /api/patients` – Create a patient
- `GET /api/appointments` – List appointments with doctor and patient details
- `POST /api/appointments` – Create an appointment
- `PUT /api/appointments/:id` – Update an appointment
- `DELETE /api/appointments/:id` – Cancel an appointment

All responses are returned in JSON format.
