# Docapp3 Enterprise Todo

Docapp3 is a full-stack enterprise-grade task management platform featuring a typed Express + Prisma API, AdminJS panel, and React + Tailwind dashboard.

## Prerequisites

- Node.js 20+
- npm 9+
- Docker (optional for containerized setup)
- PostgreSQL 16+

## Local Development

### Backend

```
cd app/backend
cp .env.example .env
npm install
npm run migrate
npm run seed
npm run dev
```

### Frontend

```
cd app/frontend
cp .env.example .env
npm install
npm run dev
```

## Testing

- Backend: `npm test` from `app/backend`
- Frontend: `npm test` from `app/frontend`

## Docker Quick Start

```
cd app/infra
docker compose up --build
```

## Sample Logins

- Admin: `admin@acme.com` / `Admin@123`
- User: `jane@acme.com` / `User@123`
- User: `john@acme.com` / `User@123`
