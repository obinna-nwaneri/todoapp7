# To-Do App

This project is a simple To-Do application built with raw PHP (procedural style), MySQL, and Bootstrap 5. It provides role-based authentication with dedicated dashboards for users and administrators.

## Features

- User registration and login with secure password hashing.
- Default administrator account (username: `admin`, password: `admin`).
- User dashboard for creating, updating, and deleting personal tasks.
- Task status management (pending/completed) with a Bootstrap-based interface.
- Admin dashboard to manage users, reset passwords, delete accounts, and review all tasks.

## Requirements

- PHP 7.4+
- MySQL 5.7+
- Web server configured to serve PHP files (Apache, Nginx, etc.)

## Installation

1. Clone the repository and place the project in your web server's document root.
2. Create the database schema and seed data:

   ```sql
   SOURCE /path/to/database.sql;
   ```

   The script creates the database `todo_app`, required tables, and inserts the default admin plus a sample user (`johndoe` / `password123`) with two example tasks.

3. Update the database credentials in `config/db.php` if needed.
4. Ensure the web server points to the project directory. Visit `http://your-host/index.php` to access the application.

## File Structure

- `config/db.php` – PDO database connection.
- `includes/auth.php` – Shared session helpers.
- `auth/login.php` & `auth/register.php` – Authentication pages.
- `user/dashboard.php` – Task management for users.
- `admin/dashboard.php` – Administrative overview.
- `tasks/*.php` – Task CRUD operations.
- `database.sql` – Schema and seed data.
- `logout.php` – Session termination.

## Security Notes

- All database interactions use prepared statements to prevent SQL injection.
- Passwords are hashed with `password_hash()`.
- Sessions regenerate IDs on successful login and are destroyed on logout.

## Default Accounts

- **Admin:** `admin` / `admin`
- **Sample User:** `johndoe` / `password123`

You can register additional user accounts through the registration form.
