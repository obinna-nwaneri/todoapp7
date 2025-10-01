# Enterprise Todo App

An enterprise-grade task management platform built with AdonisJS 6, PostgreSQL, AdminJS, and a modern React + Tailwind UI. The application delivers role-based access, JWT-secured APIs, and an integrated admin back-office for managing users and todos.

## Project structure

```
.
├── backend   # AdonisJS API, AdminJS dashboard, PostgreSQL integration
└── frontend  # React + Vite client with TailwindCSS and React Query
```

---

## Backend setup (AdonisJS)

### Prerequisites
- Node.js 20+
- PostgreSQL running with the following credentials (override via `.env`):
  ```
  PG_HOST=localhost
  PG_PORT=5432
  PG_USER=postgres
  PG_PASSWORD=admin
  PG_DB_NAME=Docapp
  ```

### Install & configure
```bash
cd backend
cp .env.example .env
# Update .env if needed, then generate an APP_KEY
node ace generate:key
npm install
```

### Database
```bash
node ace migration:run
node ace db:seed
```

### Start the API
```bash
node ace serve --watch
```

The API is now available on `http://localhost:3333` with AdminJS mounted at `http://localhost:3333/admin` (admin credentials below).

### Seeded accounts
| Role  | Email               | Password   |
|-------|---------------------|------------|
| Admin | `admin@example.com` | `Admin@123`|
| User  | `alice@example.com` | `User@123` |
| User  | `bob@example.com`   | `User@123` |

---

## Frontend setup (React + Vite)

### Install & run
```bash
cd frontend
npm install
npm run dev
```

The client runs on `http://localhost:5173` and expects the backend at `http://localhost:3333`. Configure a different API origin by setting `VITE_API_URL` in `frontend/.env`.

---

## Features

### Backend
- JWT access-token authentication with role-aware policies via AdonisJS Auth + Bouncer.
- Lucid ORM models for `User` and `Todo`, including migrations and PostgreSQL enums for status/priority.
- REST API for todos and user management with admin-only enforcement.
- AdminJS embedded at `/admin` with session-protected access limited to admin users.
- Database seeder bootstrapping admin/user accounts and 10 representative todos.

### Frontend
- React Router powered navigation with guarded routes (public, authenticated, admin).
- React Query data layer, Axios API client with automatic bearer token injection.
- Tailwind CSS UI featuring responsive dashboard layout, sidebar navigation, and reusable todo components.
- User features: login/registration, personal dashboard with filters, create/edit/delete todos, profile management.
- Admin features: consolidated overview, user role management, quick access to AdminJS, and visibility into all todos.
- Toast notifications, modal confirmations, and accessible form components.

---

## Scripts

### Backend
| Command | Description |
|---------|-------------|
| `npm run dev` | Start AdonisJS in watch mode |
| `npm run build` | Compile TypeScript for production |
| `node ace migration:run` | Run database migrations |
| `node ace db:seed` | Seed database with default data |

### Frontend
| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite development server |
| `npm run build` | Build production assets |
| `npm run preview` | Preview built assets |
| `npm run lint` | Run ESLint checks |

---

## Testing the experience
1. Start the backend (`node ace serve --watch`).
2. Seed the database (`node ace db:seed`).
3. Start the frontend (`npm run dev`).
4. Sign in with:
   - Admin: `admin@example.com` / `Admin@123`
   - Standard: `alice@example.com` / `User@123`
5. Explore user dashboard features and admin management tools.

Enjoy building and scaling your enterprise todo workflows!
