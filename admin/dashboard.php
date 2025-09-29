<?php
/**
 * admin/dashboard.php
 * --------------------
 * Provides an overview of the system for administrators including quick stats.
 */

require_once __DIR__ . '/../partials/guard/require_admin.php';
require_once __DIR__ . '/../config/db.php';

$totalUsers = (int) $pdo->query('SELECT COUNT(*) FROM users')->fetchColumn();
$totalTasks = (int) $pdo->query('SELECT COUNT(*) FROM tasks')->fetchColumn();
$pendingTasks = (int) $pdo->query("SELECT COUNT(*) FROM tasks WHERE status = 'pending'")->fetchColumn();
$completedTasks = (int) $pdo->query("SELECT COUNT(*) FROM tasks WHERE status = 'completed'")->fetchColumn();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
<nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container">
        <a class="navbar-brand" href="/admin/dashboard.php">Todo Admin</a>
        <div class="d-flex align-items-center">
            <a class="btn btn-outline-light btn-sm me-2" href="/admin/users_list.php">Manage Users</a>
            <a class="btn btn-outline-light btn-sm me-2" href="/admin/tasks_list.php">Manage Tasks</a>
            <span class="text-light me-3">Admin: <strong><?= htmlspecialchars($_SESSION['username']) ?></strong></span>
            <a class="btn btn-outline-light btn-sm me-2" href="/auth/change_password.php">Change Password</a>
            <a class="btn btn-warning btn-sm" href="/auth/logout.php">Logout</a>
        </div>
    </div>
</nav>
<div class="container py-4">
    <?php include __DIR__ . '/../partials/alerts.php'; ?>
    <h1 class="h3 mb-4">Admin Overview</h1>
    <div class="row g-4">
        <div class="col-md-3">
            <div class="card text-bg-primary">
                <div class="card-body">
                    <h2 class="h5">Total Users</h2>
                    <p class="display-6 mb-0"><?= $totalUsers ?></p>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card text-bg-success">
                <div class="card-body">
                    <h2 class="h5">Total Tasks</h2>
                    <p class="display-6 mb-0"><?= $totalTasks ?></p>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card text-bg-warning text-dark">
                <div class="card-body">
                    <h2 class="h5">Pending</h2>
                    <p class="display-6 mb-0"><?= $pendingTasks ?></p>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card text-bg-secondary">
                <div class="card-body">
                    <h2 class="h5">Completed</h2>
                    <p class="display-6 mb-0"><?= $completedTasks ?></p>
                </div>
            </div>
        </div>
    </div>
</div>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
