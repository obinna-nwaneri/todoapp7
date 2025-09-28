<?php
require_once __DIR__ . '/../partials/guard/require_login.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/csrf.php';
require_once __DIR__ . '/../helpers/flash.php';
require_once __DIR__ . '/../public/layout.php';

$userId = current_user_id();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $current    = $_POST['current_password'] ?? '';
    $new        = $_POST['new_password'] ?? '';
    $confirm    = $_POST['confirm_new_password'] ?? '';
    $csrf_token = $_POST['csrf_token'] ?? null;

    if (!verify_csrf_token($csrf_token)) {
        set_flash('danger', 'Invalid CSRF token. Please try again.');
        redirect('/auth/change_password.php');
    }

    if ($current === '' || $new === '' || $confirm === '') {
        set_flash('danger', 'All fields are required.');
        redirect('/auth/change_password.php');
    }

    if ($new !== $confirm) {
        set_flash('danger', 'New passwords do not match.');
        redirect('/auth/change_password.php');
    }

    $stmt = $pdo->prepare('SELECT password FROM users WHERE id = :id LIMIT 1');
    $stmt->execute([':id' => $userId]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($current, $user['password'])) {
        set_flash('danger', 'Current password is incorrect.');
        redirect('/auth/change_password.php');
    }

    $hash = password_hash($new, PASSWORD_DEFAULT);
    $update = $pdo->prepare('UPDATE users SET password = :password WHERE id = :id');
    $update->execute([':password' => $hash, ':id' => $userId]);

    set_flash('success', 'Password updated successfully.');
    if (is_admin()) {
        redirect('/admin/dashboard.php');
    }
    redirect('/user/dashboard.php');
}

render_layout_header('Change Password');
?>
<h1 class="mb-4">Change Password</h1>
<?php include __DIR__ . '/../partials/alerts.php'; ?>
<form method="post" class="card card-body shadow-sm">
    <input type="hidden" name="csrf_token" value="<?= htmlspecialchars(generate_csrf_token()) ?>">
    <div class="mb-3">
        <label for="current_password" class="form-label">Current Password</label>
        <input type="password" name="current_password" id="current_password" class="form-control" required>
    </div>
    <div class="mb-3">
        <label for="new_password" class="form-label">New Password</label>
        <input type="password" name="new_password" id="new_password" class="form-control" required>
    </div>
    <div class="mb-4">
        <label for="confirm_new_password" class="form-label">Confirm New Password</label>
        <input type="password" name="confirm_new_password" id="confirm_new_password" class="form-control" required>
    </div>
    <button type="submit" class="btn btn-primary">Update Password</button>
</form>
<?php
render_layout_footer();
