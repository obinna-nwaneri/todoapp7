# Todo App

A lightweight task management web application built with PHP, MySQL, Bootstrap 5, and vanilla JavaScript. The app provides both an end-user interface for managing personal tasks and an admin back office for managing users and all tasks across the system.

## Features

- User registration, login, and password management using secure password hashing
- Personal task dashboard with filtering, creation, editing, and deletion
- Administrator dashboard with system stats
- Admin CRUD for users (including admin creation) and all tasks
- CSRF protection for all POST actions and flash messaging for feedback
- PDO-based data access with prepared statements
- Database seed scripts for bootstrapping the environment

## Project Structure

```
/
├── admin/              # Admin dashboards and CRUD pages
├── auth/               # Authentication and password management
├── config/             # PDO connection setup
├── helpers/            # Auth, CSRF, and flash helpers
├── install/            # SQL schema and PHP seeder
├── partials/           # Shared UI components and guards
├── public/             # Layout template and static assets
├── user/               # Authenticated user task management
└── index.php           # Landing page
```

## Getting Started

1. Create the database schema and seed data:
   ```bash
   mysql -u root -p < install/install.sql
   ```
   Or run the PHP seeder after configuring database credentials:
   ```bash
   php install/seed.php
   ```
2. Configure your web server to serve the project root (e.g., Apache, Nginx, or PHP's built-in server).
3. Ensure the environment variables `DB_HOST`, `DB_NAME`, `DB_USER`, and `DB_PASS` are set if you need custom connection details. Defaults are `localhost`, `todo_app`, `root`, and an empty password.
4. Access the application in your browser.

### Default Accounts

- **Admin:** `admin / admin`
- **User:** `jane / password`

Enjoy managing your tasks!
