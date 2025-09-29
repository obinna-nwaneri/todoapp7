<?php
require_once __DIR__ . '/../partials/guard/require_admin.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/csrf.php';
require_once __DIR__ . '/../helpers/flash.php';
require_once __DIR__ . '/../public/layout.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username   = trim($_POST['username'] ?? '');
    $email      = trim($_POST['email'] ?? '');
    $role       = $_POST['role'] ?? 'user';
    $password   = $_POST['password'] ?? '';
    $confirm    = $_POST['confirm_password'] ?? '';
    $csrf_token = $_POST['csrf_token'] ?? null;

    if (!verify_csrf_token($csrf_token)) {
        set_flash('danger', 'Invalid CSRF token.');
        redirect('/admin/users_add.php');
    }

    if ($username === '' || $email === '' || $password === '' || $confirm === '') {
        set_flash('danger', 'All fields are required.');
        redirect('/admin/users_add.php');
    }

    if (!in_array($role, ['user', 'admin'], true)) {
        set_flash('danger', 'Invalid role selected.');
        redirect('/admin/users_add.php');
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        set_flash('danger', 'Invalid email address.');
        redirect('/admin/users_add.php');
    }

    if ($password !== $confirm) {
        set_flash('danger', 'Passwords do not match.');
        redirect('/admin/users_add.php');
    }

    $stmt = $pdo->prepare('SELECT id FROM users WHERE username = :username OR email = :email LIMIT 1');
    $stmt->execute([':username' => $username, ':email' => $email]);
    if ($stmt->fetch()) {
        set_flash('danger', 'Username or email already in use.');
        redirect('/admin/users_add.php');
    }

    $hash = password_hash($password, PASSWORD_DEFAULT);
    $insert = $pdo->prepare('INSERT INTO users (username, email, password, role) VALUES (:username, :email, :password, :role)');
    $insert->execute([
        ':username' => $username,
        ':email' => $email,
        ':password' => $hash,
        ':role' => $role,
    ]);

    set_flash('success', 'User created successfully.');
    redirect('/admin/users_list.php');
}

render_layout_header('Add User');
?>
<h1 class="mb-4">Add User</h1>
<?php include __DIR__ . '/../partials/alerts.php'; ?>
<form method="post" class="card card-body shadow-sm">
    <input type="hidden" name="csrf_token" value="<?= htmlspecialchars(generate_csrf_token()) ?>">
    <div class="mb-3">
        <label class="form-label" for="username">Username</label>
        <input type="text" class="form-control" name="username" id="username" required>
    </div>
    <div class="mb-3">
        <label class="form-label" for="email">Email</label>
        <input type="email" class="form-control" name="email" id="email" required>
    </div>
    <div class="mb-3">
        <label class="form-label" for="role">Role</label>
        <select name="role" id="role" class="form-select">
            <option value="user">User</option>
            <option value="admin">Admin</option>
        </select>
    </div>
    <div class="mb-3">
        <label class="form-label" for="password">Temporary Password</label>
        <input type="password" class="form-control" name="password" id="password" required>
    </div>
    <div class="mb-4">
        <label class="form-label" for="confirm_password">Confirm Password</label>
        <input type="password" class="form-control" name="confirm_password" id="confirm_password" required>
    </div>
    <div class="d-flex gap-2">
        <button type="submit" class="btn btn-primary">Create User</button>
        <a href="/admin/users_list.php" class="btn btn-light">Cancel</a>
    </div>
</form>
<?php
render_layout_footer();
