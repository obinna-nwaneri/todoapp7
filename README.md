# Enterprise To-Do Monorepo

This monorepo contains the Enterprise To-Do application with a NestJS backend and a React frontend.

## Prerequisites

- Node.js 18+
- npm 9+
- PostgreSQL 13+

## Getting Started

1. Install dependencies:

```bash
npm install
npm install --workspace backend
npm install --workspace frontend
```

2. Configure environment variables. Sample files are included at `backend/.env` and `frontend/.env`.

3. Start Postgres (optional via Docker):

```bash
docker-compose up -d
```

4. Run database migrations and seed data:

```bash
cd backend
npm run migration:run
npm run seed
```

5. Start the application (from repository root):

```bash
npm run dev
```

- Backend: http://localhost:4000
- Frontend: http://localhost:5173
- Swagger Docs: http://localhost:4000/docs

## Production Builds

```bash
npm run build
npm run start
```

## Testing

- Backend unit tests: `cd backend && npm test`
- Backend e2e tests: `cd backend && npm run test:e2e`
- Frontend tests: `cd frontend && npm test`

## Docker

A `docker-compose.yml` file is provided to run the app stack with PostgreSQL. Adjust environment variables as needed.
