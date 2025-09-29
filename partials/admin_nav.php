<?php
/**
 * partials/admin_nav.php
 * -----------------------
 * Shared navigation bar for admin pages.
 */

require_once __DIR__ . '/../helpers/auth.php';
?>
<nav class="navbar navbar-expand-lg navbar-dark bg-dark mb-0">
    <div class="container">
        <a class="navbar-brand" href="/admin/dashboard.php">Todo Admin</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#adminNav" aria-controls="adminNav" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="adminNav">
            <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                <li class="nav-item"><a class="nav-link" href="/admin/dashboard.php">Dashboard</a></li>
                <li class="nav-item"><a class="nav-link" href="/admin/users_list.php">Users</a></li>
                <li class="nav-item"><a class="nav-link" href="/admin/tasks_list.php">Tasks</a></li>
            </ul>
            <div class="d-flex align-items-center">
                <span class="text-light me-3">Admin: <strong><?= htmlspecialchars($_SESSION['username']) ?></strong></span>
                <a class="btn btn-outline-light btn-sm me-2" href="/auth/change_password.php">Change Password</a>
                <a class="btn btn-warning btn-sm" href="/auth/logout.php">Logout</a>
            </div>
        </div>
    </div>
</nav>
