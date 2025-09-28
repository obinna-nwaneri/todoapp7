# User management portal

This project provides a lightweight user management portal with a Node.js/Express
backend and a vanilla JavaScript front end. Visitors can register themselves as
front-end users, while administrators can create both front-end and back-end
accounts (or additional admins) through protected APIs.

## Features

- Public user registration form exposed on the front end.
- Administrator tools to create users with `frontend`, `backend`, or `admin` roles.
- SQLite database for persistent storage with automatic schema creation.
- Simple admin token check for protecting privileged endpoints.
- User table for administrators to review existing accounts.

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. (Optional) Override the default admin token and database path:

   ```bash
   export ADMIN_TOKEN="your-secure-token"
   export DB_PATH="/absolute/path/to/users.sqlite"
   ```

   The default admin token is `changeme-admin-token`. A seed admin account is
   created on first run with the email `admin@example.com` and the same token as
   its password so you can log in immediately.

3. Start the server:

   ```bash
   npm start
   ```

4. Visit <http://localhost:3000> to use the front end.

## API overview

All endpoints return JSON.

### `POST /api/register`

Registers a front-end user.

- Request body: `{ "name": string, "email": string, "password": string }`
- Success response: `201` with `{ "message": "Registration successful." }`

### `POST /api/admin/users`

Creates a user with any role. Requires the `x-admin-token` header set to the
admin token.

- Request body: `{ "name": string, "email": string, "password": string, "role": "frontend" | "backend" | "admin" }`
- Success response: `201` with `{ "message": "User added successfully." }`

### `GET /api/users`

Lists all users with non-sensitive metadata. Requires the `x-admin-token`
header.

- Success response: `200` with an array of users sorted by creation date
  (descending).

## Development notes

- The application intentionally keeps authentication simple for demonstration
  purposes. Replace the admin token mechanism with a more robust solution
  (sessions, JWT, etc.) before using it in production.
- Passwords are stored as plain text for brevity. Integrate a password hashing
  strategy such as bcrypt if security is a concern.
