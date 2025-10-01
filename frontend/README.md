# Enterprise Todo Frontend

React + Vite single page application for the Enterprise Todo platform. The UI offers login, self-service registration, dashboard metrics, and task management features.

## Available Scripts

```bash
# Install dependencies
yarn install # or npm install / pnpm install

# Start the development server
npm run dev

# Build for production
npm run build

# Preview the production build
npm run preview
```

## Environment Variables

Create a `.env` file in this folder (or use `.env.local`) with the API base URL:

```bash
VITE_API_URL=http://localhost:3333/api
```

## Features

- Tailwind CSS styling with responsive layout.
- Authentication forms that integrate with the AdonisJS API.
- Dashboard summary cards and AdminJS quick link.
- Task creation, status updates, and deletion with role-aware permissions.
- Automatic token persistence via `localStorage`.
