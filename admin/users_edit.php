<?php
require_once __DIR__ . '/../partials/guard/require_admin.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/csrf.php';
require_once __DIR__ . '/../helpers/flash.php';
require_once __DIR__ . '/../public/layout.php';

$userId = (int)($_GET['id'] ?? $_POST['id'] ?? 0);
$stmt = $pdo->prepare('SELECT * FROM users WHERE id = :id');
$stmt->execute([':id' => $userId]);
$user = $stmt->fetch();

if (!$user) {
    set_flash('danger', 'User not found.');
    redirect('/admin/users_list.php');
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username   = trim($_POST['username'] ?? '');
    $email      = trim($_POST['email'] ?? '');
    $role       = $_POST['role'] ?? 'user';
    $password   = $_POST['password'] ?? '';
    $confirm    = $_POST['confirm_password'] ?? '';
    $csrf_token = $_POST['csrf_token'] ?? null;

    if (!verify_csrf_token($csrf_token)) {
        set_flash('danger', 'Invalid CSRF token.');
        redirect('/admin/users_edit.php?id=' . urlencode($userId));
    }

    if ($username === '' || $email === '') {
        set_flash('danger', 'Username and email are required.');
        redirect('/admin/users_edit.php?id=' . urlencode($userId));
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        set_flash('danger', 'Invalid email address.');
        redirect('/admin/users_edit.php?id=' . urlencode($userId));
    }

    if (!in_array($role, ['user', 'admin'], true)) {
        set_flash('danger', 'Invalid role selected.');
        redirect('/admin/users_edit.php?id=' . urlencode($userId));
    }

    $check = $pdo->prepare('SELECT id FROM users WHERE (username = :username OR email = :email) AND id != :id LIMIT 1');
    $check->execute([':username' => $username, ':email' => $email, ':id' => $userId]);
    if ($check->fetch()) {
        set_flash('danger', 'Username or email already in use by another account.');
        redirect('/admin/users_edit.php?id=' . urlencode($userId));
    }

    $pdo->beginTransaction();
    try {
        $update = $pdo->prepare('UPDATE users SET username = :username, email = :email, role = :role WHERE id = :id');
        $update->execute([
            ':username' => $username,
            ':email' => $email,
            ':role' => $role,
            ':id' => $userId,
        ]);

        if ($password !== '') {
            if ($password !== $confirm) {
                throw new RuntimeException('Passwords do not match.');
            }
            $hash = password_hash($password, PASSWORD_DEFAULT);
            $passStmt = $pdo->prepare('UPDATE users SET password = :password WHERE id = :id');
            $passStmt->execute([':password' => $hash, ':id' => $userId]);
        }

        $pdo->commit();
        set_flash('success', 'User updated successfully.');
    } catch (Throwable $e) {
        $pdo->rollBack();
        set_flash('danger', $e->getMessage());
    }

    redirect('/admin/users_edit.php?id=' . urlencode($userId));
}

render_layout_header('Edit User');
?>
<h1 class="mb-4">Edit User</h1>
<?php include __DIR__ . '/../partials/alerts.php'; ?>
<form method="post" class="card card-body shadow-sm">
    <input type="hidden" name="csrf_token" value="<?= htmlspecialchars(generate_csrf_token()) ?>">
    <input type="hidden" name="id" value="<?= htmlspecialchars($user['id']) ?>">
    <div class="mb-3">
        <label class="form-label" for="username">Username</label>
        <input type="text" class="form-control" name="username" id="username" required value="<?= htmlspecialchars($user['username']) ?>">
    </div>
    <div class="mb-3">
        <label class="form-label" for="email">Email</label>
        <input type="email" class="form-control" name="email" id="email" required value="<?= htmlspecialchars($user['email']) ?>">
    </div>
    <div class="mb-3">
        <label class="form-label" for="role">Role</label>
        <select name="role" id="role" class="form-select">
            <option value="user" <?= $user['role'] === 'user' ? 'selected' : '' ?>>User</option>
            <option value="admin" <?= $user['role'] === 'admin' ? 'selected' : '' ?>>Admin</option>
        </select>
    </div>
    <div class="mb-3">
        <label class="form-label" for="password">Reset Password (optional)</label>
        <input type="password" class="form-control" name="password" id="password">
    </div>
    <div class="mb-4">
        <label class="form-label" for="confirm_password">Confirm New Password</label>
        <input type="password" class="form-control" name="confirm_password" id="confirm_password">
    </div>
    <div class="d-flex gap-2">
        <button type="submit" class="btn btn-primary">Update User</button>
        <a href="/admin/users_list.php" class="btn btn-light">Back to list</a>
    </div>
</form>
<?php
render_layout_footer();
