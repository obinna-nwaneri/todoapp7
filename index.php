<?php
/**
 * index.php
 * ----------
 * Landing page for the Todo application. Redirects authenticated users to the
 * appropriate dashboard and shows quick start instructions otherwise.
 *
 * Quick Setup:
 * 1) Import install/install.sql into MySQL.
 * 2) Update credentials in config/db.php.
 * 3) Run `php -S localhost:8000 -t .` and open http://localhost:8000
 * 4) Visit /install/seed.php once to insert seed data.
 *
 * Default logins:
 * - Admin: admin / admin
 * - User:  jane  / password
 */

require_once __DIR__ . '/helpers/auth.php';

if (is_logged_in()) {
    if (is_admin()) {
        redirect('/admin/dashboard.php');
    }

    redirect('/user/dashboard.php');
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Todo App</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-light">
    <div class="container py-5">
        <div class="row justify-content-center">
            <div class="col-lg-6">
                <div class="card shadow-sm">
                    <div class="card-body text-center">
                        <h1 class="card-title mb-4">Welcome to the Todo App</h1>
                        <p class="lead">Manage personal tasks or administrate all users with the built-in admin panel.</p>
                        <div class="d-flex gap-3 justify-content-center mt-4">
                            <a class="btn btn-primary" href="/auth/login.php">Login</a>
                            <a class="btn btn-outline-secondary" href="/auth/register.php">Register</a>
                        </div>
                    </div>
                </div>
                <div class="card shadow-sm mt-4">
                    <div class="card-body">
                        <h2 class="h5">Quick Start</h2>
                        <ol class="text-start">
                            <li>Import <code>install/install.sql</code> into MySQL.</li>
                            <li>Update connection credentials in <code>config/db.php</code>.</li>
                            <li>Run <code>php -S localhost:8000 -t .</code> and open <a href="http://localhost:8000">http://localhost:8000</a>.</li>
                            <li>Visit <code>/install/seed.php</code> once to insert demo data.</li>
                        </ol>
                        <p class="mb-0">Default accounts: admin/admin and jane/password</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
