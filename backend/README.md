# Enterprise Todo Backend

AdonisJS v6 API for the Enterprise Todo application. Provides authentication, role-based access control, task management, and AdminJS integration.

## Getting Started

```bash
cp .env.example .env
npm install
npm run dev
```

## Database

```bash
node ace migration:run
node ace db:seed
```

AdminJS dashboard boots separately via `node ace admin:serve` (see `start/admin.ts`).
