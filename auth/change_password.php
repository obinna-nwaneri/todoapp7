<?php
/**
 * auth/change_password.php
 * -------------------------
 * Allows any authenticated user or admin to change their password.
 */

require_once __DIR__ . '/../partials/guard/require_login.php';
require_once __DIR__ . '/../helpers/csrf.php';
require_once __DIR__ . '/../config/db.php';

$errors = [];
$success = false;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!csrf_verify($_POST['csrf_token'] ?? null)) {
        $errors[] = 'Invalid form token, please try again.';
    }

    $current_password = $_POST['current_password'] ?? '';
    $new_password = $_POST['new_password'] ?? '';
    $confirm_new_password = $_POST['confirm_new_password'] ?? '';

    if ($current_password === '' || $new_password === '' || $confirm_new_password === '') {
        $errors[] = 'All fields are required.';
    }

    if ($new_password !== $confirm_new_password) {
        $errors[] = 'New passwords do not match.';
    }

    if (strlen($new_password) < 6) {
        $errors[] = 'New password should be at least 6 characters long.';
    }

    if (empty($errors)) {
        $stmt = $pdo->prepare('SELECT password FROM users WHERE id = :id');
        $stmt->execute([':id' => current_user_id()]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($current_password, $user['password'])) {
            $errors[] = 'Current password is incorrect.';
        }
    }

    if (empty($errors)) {
        $hash = password_hash($new_password, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare('UPDATE users SET password = :password WHERE id = :id');
        $stmt->execute([
            ':password' => $hash,
            ':id' => current_user_id(),
        ]);

        $success = true;
        $_SESSION['flash_success'] = 'Password updated successfully.';
        redirect(is_admin() ? '/admin/dashboard.php' : '/user/dashboard.php');
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Change Password</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-light">
    <div class="container py-5">
        <div class="row justify-content-center">
            <div class="col-lg-5">
                <div class="card shadow-sm">
                    <div class="card-body">
                        <h1 class="h3 mb-4 text-center">Change Password</h1>
                        <?php if ($errors): ?>
                            <div class="alert alert-danger">
                                <ul class="mb-0">
                                    <?php foreach ($errors as $error): ?>
                                        <li><?= htmlspecialchars($error) ?></li>
                                    <?php endforeach; ?>
                                </ul>
                            </div>
                        <?php endif; ?>
                        <form method="post" novalidate>
                            <input type="hidden" name="csrf_token" value="<?= htmlspecialchars(csrf_token()) ?>">
                            <div class="mb-3">
                                <label class="form-label">Current Password</label>
                                <input type="password" name="current_password" class="form-control" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">New Password</label>
                                <input type="password" name="new_password" class="form-control" required>
                            </div>
                            <div class="mb-4">
                                <label class="form-label">Confirm New Password</label>
                                <input type="password" name="confirm_new_password" class="form-control" required>
                            </div>
                            <div class="d-grid">
                                <button class="btn btn-primary" type="submit">Update Password</button>
                            </div>
                        </form>
                        <p class="mt-3 mb-0 text-center"><a href="<?= is_admin() ? '/admin/dashboard.php' : '/user/dashboard.php' ?>">Back to Dashboard</a></p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
