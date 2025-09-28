<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (!empty($_SESSION['role'])) {
    if ($_SESSION['role'] === 'admin') {
        header('Location: /admin/dashboard.php');
        exit;
    }
    if ($_SESSION['role'] === 'user') {
        header('Location: /user/dashboard.php');
        exit;
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>To-Do App</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-light">
    <div class="container py-5">
        <div class="row justify-content-center">
            <div class="col-md-6">
                <div class="card shadow-sm">
                    <div class="card-body text-center">
                        <h1 class="card-title mb-4">Welcome to the To-Do App</h1>
                        <p class="mb-4">Manage your tasks efficiently. Login or register to get started.</p>
                        <a href="/auth/login.php" class="btn btn-primary me-2">Login</a>
                        <a href="/auth/register.php" class="btn btn-outline-secondary">Register</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
