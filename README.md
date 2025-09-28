# Todo App 7

A simple task management web application built with PHP 8, MySQL, Bootstrap 5, and jQuery. The app supports user registration, authentication, personal task management, and an admin dashboard for managing users and overseeing tasks.

## Features

- User registration and login with hashed passwords.
- Default admin account (username `admin`, password `admin`).
- CRUD operations on tasks including deadlines and completion status.
- Responsive UI using Bootstrap 5 and Font Awesome icons.
- Admin dashboard to view all users, reset user passwords, and delete accounts.
- Admin view of all tasks created by users.

## Requirements

- PHP 8.1+
- MySQL 5.7+
- Web server capable of running PHP applications (Apache, Nginx, etc.)

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd todoapp7
   ```

2. **Configure the database**
   - Create a new MySQL database (default name: `todoapp7`).
   - Import the schema:
     ```bash
     mysql -u <user> -p todoapp7 < db/schema.sql
     ```

3. **Configure database credentials**
   - Update the values in `config.php` to match your MySQL credentials.
   - Alternatively, set the environment variables `DB_HOST`, `DB_NAME`, `DB_USER`, and `DB_PASS` before running the application.

4. **Run the application**
   - Point your web server's document root to the `public/` directory, or use PHP's built-in server:
     ```bash
     php -S localhost:8000 -t public
     ```
   - Visit `http://localhost:8000` in your browser.

## Default Credentials

- Admin username: `admin`
- Admin password: `admin`

The application will automatically create the default admin account on first run if it does not exist.

## Project Structure

```
├── db/
│   └── schema.sql
├── includes/
│   ├── footer.php
│   ├── functions.php
│   └── header.php
├── public/
│   ├── admin.php
│   ├── assets/
│   │   └── css/
│   │       └── styles.css
│   ├── dashboard.php
│   ├── index.php
│   ├── logout.php
│   └── register.php
├── config.php
└── README.md
```

## Security Notes

- Passwords are hashed using PHP's `password_hash` before being stored in the database.
- Sessions are used to manage authentication states. Ensure session storage is configured correctly on your server.
- Update the default admin password after initial setup from the admin panel by resetting the password or directly in the database.

## License

This project is provided as-is without any specific license.
