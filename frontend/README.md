# Frontend – Enterprise Todo dashboard

React + Vite dashboard that consumes the AdonisJS API to orchestrate enterprise tasks.

## Getting started

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The app uses `VITE_API_BASE_URL` to communicate with the API (`http://localhost:3333/api` by default).

## Highlights

- Secure login flow backed by the AdonisJS access token guard.
- Executive overview cards with live counts (open, completed, due soon, personal queue).
- Multi-dimensional filters (status, priority, owner, search) with inline status updates.
- Initiative composer with due dates, priority selection, and teammate assignment.
- Team bandwidth snapshot summarising active workloads across the organisation.
- Responsive layout optimised for desktops and tablets.

Use the seeded administrator account (`admin@enterprise.todo` / `Admin@123`) to sign in.
