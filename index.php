<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
require_once __DIR__ . '/helpers/auth.php';

if (is_logged_in()) {
    if (is_admin()) {
        redirect('/admin/dashboard.php');
    }
    redirect('/user/dashboard.php');
}

require_once __DIR__ . '/public/layout.php';
render_layout_header('Welcome to Todo App');
include __DIR__ . '/partials/alerts.php';
?>

<div class="text-center py-5">
    <h1 class="display-5 fw-bold mb-3">Welcome to the Todo App</h1>
    <p class="lead mb-4">Manage your tasks efficiently and stay organized.</p>
    <div class="d-flex justify-content-center gap-3">
        <a href="/auth/login.php" class="btn btn-primary btn-lg">Login</a>
        <a href="/auth/register.php" class="btn btn-outline-light btn-lg">Register</a>
    </div>
</div>
<?php
render_layout_footer();
