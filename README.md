# Todo App

A responsive PHP/MySQL Todo application with a Bootstrap front end. Users can manage their personal tasks while administrators have access to a dedicated dashboard protected by a sample login (`admin`/`admin`).

## Features

- Task CRUD (create, read, update, delete) operations from the public interface
- Responsive Bootstrap 5 UI with Font Awesome icons and jQuery-powered modals
- Track task status (pending/completed) and due dates
- Admin dashboard for managing tasks, including statistics and quick actions
- Flash messaging for user feedback

## Requirements

- PHP 8.1+
- MySQL 5.7+
- Web server capable of running PHP applications (Apache/Nginx or PHP built-in server)

## Installation

1. Clone the repository and install the dependencies (none required beyond PHP extensions `pdo` and `pdo_mysql`).
2. Import the database schema:

   ```bash
   mysql -u root -p < database.sql
   ```

   Adjust the credentials as needed for your environment.

3. Update the database connection settings in [`config.php`](config.php) to match your MySQL credentials.
4. Serve the application (for example with PHP's built-in server):

   ```bash
   php -S localhost:8000
   ```

5. Visit `http://localhost:8000/index.php` for the public todo list.
6. Visit `http://localhost:8000/admin/login.php` and use the credentials `admin` / `admin` to access the admin dashboard.

## Project Structure

```
├── admin
│   ├── dashboard.php   # Admin dashboard with CRUD operations
│   ├── login.php       # Sample login (admin/admin)
│   └── logout.php      # Destroy the admin session
├── config.php          # Database configuration
├── database.sql        # MySQL schema
├── functions.php       # Shared database helper functions
├── index.php           # Public todo interface
└── README.md
```

## Security Notes

- The admin login is intentionally simple for demonstration. Replace with a secure authentication system before using in production.
- Configure proper error handling and SSL/TLS in production environments.
