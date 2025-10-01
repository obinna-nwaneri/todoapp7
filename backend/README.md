# Backend – AdonisJS API & AdminJS console

This service exposes the Enterprise Todo API using AdonisJS 6, Lucid ORM, and the official AdminJS adapter.

## Setup

```bash
cd backend
npm install
cp .env.example .env
node ace migration:run
node ace db:seed
npm run dev
```

The HTTP server listens on `http://localhost:3333`.

### AdminJS

- URL: `http://localhost:3333/admin`
- Credentials (seeded): `admin@enterprise.todo` / `Admin@123`
- Resources: `User` and `Todo` with customised branding and automatic creator attribution for new todos.

### API overview

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/api/auth/login` | Authenticate with email/password to receive an access token. |
| `POST` | `/api/auth/logout` | Revoke the active token. |
| `GET` | `/api/me` | Return the authenticated profile. |
| `GET` | `/api/users` | List users with aggregated assignment counts. |
| `GET` | `/api/todos` | Query todos (filters: `status`, `priority`, `assignedToId`, `createdById`, `search`). |
| `POST` | `/api/todos` | Create a todo. Automatically sets `createdById` from the requester. |
| `PATCH` | `/api/todos/:id` | Update fields or status (auto-manages `completedAt`). |
| `DELETE` | `/api/todos/:id` | Delete a todo. |

### Seed data

The database seeder provisions:

- One administrator and two team members with hashed passwords.
- Four sample initiatives representing different statuses and priorities.

Run `node ace db:seed` whenever you need to restore the sample data.
