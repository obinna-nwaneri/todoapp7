<?php
session_start();
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/flash.php';
require_once __DIR__ . '/../helpers/auth.php';
require_once __DIR__ . '/../helpers/csrf.php';
require_once __DIR__ . '/../public/layout.php';

if (isset($_SESSION['user_id'])) {
    if ($_SESSION['role'] === 'admin') {
        redirect('/admin/dashboard.php');
    }
    redirect('/user/dashboard.php');
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $identifier = trim($_POST['identifier'] ?? '');
    $password   = $_POST['password'] ?? '';
    $csrf_token = $_POST['csrf_token'] ?? null;

    if (!verify_csrf_token($csrf_token)) {
        set_flash('danger', 'Invalid CSRF token. Please try again.');
        redirect('/auth/login.php');
    }

    if ($identifier === '' || $password === '') {
        set_flash('danger', 'Please provide your username/email and password.');
        redirect('/auth/login.php');
    }

    $stmt = $pdo->prepare('SELECT * FROM users WHERE username = :identifier OR email = :identifier LIMIT 1');
    $stmt->execute([':identifier' => $identifier]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password'])) {
        session_regenerate_id(true);
        $_SESSION['user_id'] = (int)$user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['role'] = $user['role'];
        set_flash('success', 'Welcome back, ' . $user['username'] . '!');
        if ($user['role'] === 'admin') {
            redirect('/admin/dashboard.php');
        }
        redirect('/user/dashboard.php');
    }

    set_flash('danger', 'Invalid credentials.');
    redirect('/auth/login.php');
}

render_layout_header('Login');
include __DIR__ . '/../partials/alerts.php';
?>
<h1 class="mb-4">Login</h1>
<form method="post" class="card card-body shadow-sm">
    <input type="hidden" name="csrf_token" value="<?= htmlspecialchars(generate_csrf_token()) ?>">
    <div class="mb-3">
        <label for="identifier" class="form-label">Username or Email</label>
        <input type="text" name="identifier" id="identifier" class="form-control" required>
    </div>
    <div class="mb-4">
        <label for="password" class="form-label">Password</label>
        <input type="password" name="password" id="password" class="form-control" required>
    </div>
    <button type="submit" class="btn btn-primary">Login</button>
    <p class="mt-3 mb-0">Don't have an account? <a href="/auth/register.php">Register here</a>.</p>
</form>
<?php
render_layout_footer();
