# Enterprise Doctor Appointment Platform

This project is a full-stack doctors appointment management platform built with **Next.js 15.5.4**, **React 18.2**, **Prisma 6.16**, and **PostgreSQL 14+**. It implements role-based dashboards for administrators, doctors, and patients, along with self-service registration, credential authentication, and route-handler powered APIs.

## Tech Stack
- Next.js App Router (15.5.4)
- React 18.2 / React DOM 18.2
- Prisma ORM & CLI 6.16
- next-auth 4.24 (Credentials provider)
- bcrypt 5.1 for password hashing
- Zod 3.23 for validation
- Axios 1.7 (available for extensions)
- PostgreSQL 14+

## Getting Started
1. Install dependencies:
   ```bash
   npm install
   ```
2. Generate the Prisma client:
   ```bash
   npx prisma generate
   ```
3. Create the development database and apply the initial schema:
   ```bash
   npx prisma migrate dev --name init
   ```
4. Seed baseline data (admin/doctor/patient accounts and sample appointments):
   ```bash
   npx ts-node prisma/seed.ts
   ```
   or compile first and run with `node dist/prisma/seed.js`.
5. Start the development server:
   ```bash
   npm run dev
   ```
6. Visit [http://localhost:3000](http://localhost:3000) and authenticate using one of the seeded users:
   - `admin@example.com` / `admin123`
   - `doctor1@example.com` / `doctor123`
   - `patient1@example.com` / `patient123`

## Environment Configuration
Create a `.env` based on `.env.example`:
```env
PG_HOST=localhost
PG_PORT=5432
PG_USER=postgres
PG_PASSWORD=admin
PG_DB_NAME=Docapp4
DATABASE_URL="postgresql://${PG_USER}:${PG_PASSWORD}@${PG_HOST}:${PG_PORT}/${PG_DB_NAME}?schema=public"
NEXTAUTH_SECRET="set-a-strong-random-string"
NEXTAUTH_URL="http://localhost:3000"
```

## Features
- Credential-based login with next-auth and Prisma
- Role-aware dashboards with navigation shortcuts
- Admin CRUD for doctors, patients, and appointments with search and pagination
- Doctor and patient panels to manage and book appointments
- Route handler APIs with ownership enforcement and Zod validation
- Toast-style feedback for create/update/delete operations
- Seeded data for immediate QA

## Development Notes
- All APIs live under `app/api/**` (App Router route handlers)
- Prisma schema follows the provided domain model with enums for roles and appointment status
- Passwords are hashed with bcrypt using 10 salt rounds
- Client components use the built-in fetch API to interact with route handlers

## Testing
At the moment this project ships without automated tests. Manual QA can be performed by running `npm run dev` and exercising the flows described above.
