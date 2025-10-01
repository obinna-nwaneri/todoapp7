Version 1

# Enterprise Todo App

Enterprise-grade task management stack featuring an AdonisJS + AdminJS backend, PostgreSQL persistence, and a React/Vite frontend dashboard.

## Stack

- **Backend**: AdonisJS 6 (TypeScript) with Lucid ORM and AdminJS integration
- **Database**: PostgreSQL (`Docapp` database, configurable via `.env`)
- **Frontend**: React 18 + Vite + React Query

## Getting Started

### Backend

```bash
cd backend
cp .env.example .env
# Update APP_KEY if necessary
npm install
node ace migration:run
node ace db:seed
npm run dev
```

The API will be available at `http://localhost:3333` with AdminJS running at `http://localhost:3333/admin`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server runs at `http://localhost:5173` and proxies API requests to the Adonis backend.

## Sample Data

The seed file provisions:

- **Enterprise Admin** (`admin@enterprise.todo`) with pre-assigned compliance tasks.
- **Jane Doe** (`jane.doe@enterprise.todo`) with sprint demo deliverables.
- **John Smith** (`john.smith@enterprise.todo`) managing migration initiatives.

Each user is seeded with representative todos to demonstrate the enterprise workflow.
