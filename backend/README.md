# Enterprise Todo API

AdonisJS 4 API that powers the Enterprise Todo application with PostgreSQL persistence, JWT authentication, role-based authorization, AdminJS back office, and Lucid models.

## Getting Started

```bash
cd backend
npm install
cp .env.example .env

# Run database migrations
node ace migration:run

# Seed initial users and tasks
node ace db:seed

# Start the API (port 3333 by default)
npm run dev

# Start the AdminJS panel (port 3334 by default)
npm run start:admin
```

## Environment

`.env.example` ships with PostgreSQL defaults:

```
PG_HOST=localhost
PG_PORT=5432
PG_USER=postgres
PG_PASSWORD=admin
PG_DB_NAME=Docapp3
APP_KEY=your-secret-app-key
ADMIN_PANEL_EMAIL=admin@enterprise.local
ADMIN_PANEL_PASSWORD=Admin123!
```

## Seeded Accounts

| Role       | Email                       | Password     |
| ---------- | --------------------------- | ------------ |
| Admin      | admin@enterprise.local      | Admin123!    |
| Team Lead  | teamlead@enterprise.local   | TeamLead123! |
| User       | user@enterprise.local       | User123!     |

Admins can activate/deactivate users, update roles, and review all tasks through the AdminJS UI or the REST API. Team leads can assign tasks to themselves or others, while standard users can manage personal tasks.
