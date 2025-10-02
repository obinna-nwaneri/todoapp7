# Enterprise Doctor Appointment Platform

A full-stack Next.js (App Router) application implementing an enterprise-grade doctor appointment workflow with role-based access for administrators, doctors, and patients. The platform uses PostgreSQL via Prisma ORM, credential authentication through NextAuth, and Tailwind CSS for styling.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** PostgreSQL with Prisma ORM
- **Auth:** NextAuth (Credentials provider) + bcrypt hashing
- **Validation:** Zod
- **Styling:** Tailwind CSS
- **Data fetching state:** React Query provider (optional client hooks supported)

## Getting Started

1. Copy environment variables and update if needed:

   ```bash
   cp .env.example .env
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Generate the Prisma client:

   ```bash
   npx prisma generate
   ```

4. Apply the database schema (adjust the migration name if you prefer another identifier):

   ```bash
   npx prisma migrate dev --name init
   ```

5. Seed the database with baseline users (admin/doctor/patient) and sample appointments:

   ```bash
   npm run db:seed
   ```

6. Start the development server:

   ```bash
   npm run dev
   ```

The application is available at [http://localhost:3000](http://localhost:3000).

## Seeded Access Credentials

| Role  | Email                 | Password   | Redirect                                  |
|-------|-----------------------|------------|--------------------------------------------|
| Admin | `admin@example.com`   | `admin123` | `/admin-panel/dashboard`                   |
| Doctor| `doctor1@example.com` | `doctor123`| `/doctor-panel/dashboard`                  |
| Patient| `patient1@example.com`| `patient123`| `/patient-panel/dashboard`               |

## Key Features

### Authentication & Authorization
- Credentials-based login with bcrypt hashing.
- NextAuth JWT sessions enriched with user id and role for easy server-side checks.
- Middleware-enforced route protection and server-side guards for all panel and API routes.

### Role-Specific Panels
- **Admin Panel** (`/admin-panel`): Dashboard stats, doctor/patient CRUD with search, appointment management with filters and status updates.
- **Doctor Panel** (`/doctor-panel`): Upcoming appointments overview, full appointment table with filtering and inline status transitions (approve/reject/complete).
- **Patient Panel** (`/patient-panel`): Dashboard showing upcoming & past visits, appointment management (edit/cancel pending), dedicated booking flow with doctor selection.

### API Surface
All APIs live under `/app/api/*` with route handlers and Zod validation.
- Public doctor directory for booking (`/api/public/doctors`).
- Authentication endpoints for doctor/patient registration, session inspection, and NextAuth credential login.
- Admin/Doctor/Patient namespaces for data management, each enforcing ownership/role rules and returning paginated results.

### Data Integrity
- Prisma schema enforces a composite unique index on `(doctorId, date, time)` to prevent double bookings.
- CRUD operations guard against status transitions (e.g., only pending appointments can be modified/cancelled by patients).
- All API payloads validated with Zod to provide descriptive error responses.

### Developer Experience
- Tailwind-based component system with reusable data table and panel layout.
- React Query provider ready for client-side enhancements.
- Seed script and npm helpers (`db:generate`, `db:migrate`, `db:push`, `db:seed`).

## Project Structure Highlights

```
app/
  admin-panel/...
  doctor-panel/...
  patient-panel/...
  api/...              # Route handlers for REST APIs
components/
  admin/, doctor/, patient/, ui/
lib/                    # Prisma client, auth configuration, validation helpers
prisma/
  schema.prisma        # Database schema
  seed.ts              # Database seeding script
```

## Testing the Workflow
1. **Admin** logs in and manages records from `/admin-panel` (create/edit/delete doctors, patients, appointments).
2. **Doctor** reviews their queue, updates statuses (approve/reject/complete) from `/doctor-panel/appointments`.
3. **Patient** books a new appointment, edits/cancels pending ones, and views history via `/patient-panel`.

Feel free to customize styles, expand forms, or integrate additional data visualizations as needed for your organization.
