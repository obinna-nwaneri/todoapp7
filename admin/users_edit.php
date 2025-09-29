<?php
/**
 * admin/users_edit.php
 * ---------------------
 * Enables administrators to update user details and optionally reset passwords.
 */

require_once __DIR__ . '/../partials/guard/require_admin.php';
require_once __DIR__ . '/../helpers/csrf.php';
require_once __DIR__ . '/../config/db.php';

$id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
if ($id <= 0) {
    $_SESSION['flash_error'] = 'Invalid user selected.';
    redirect('/admin/users_list.php');
}

$stmt = $pdo->prepare('SELECT id, username, email, role FROM users WHERE id = :id');
$stmt->execute([':id' => $id]);
$user = $stmt->fetch();

if (!$user) {
    $_SESSION['flash_error'] = 'User not found.';
    redirect('/admin/users_list.php');
}

$errors = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!csrf_verify($_POST['csrf_token'] ?? null)) {
        $errors[] = 'Invalid form token, please try again.';
    }

    $username = trim($_POST['username'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $role = $_POST['role'] ?? $user['role'];
    $password = $_POST['password'] ?? '';
    $confirm = $_POST['confirm'] ?? '';

    if ($username === '' || $email === '') {
        $errors[] = 'Username and email are required.';
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors[] = 'Please provide a valid email address.';
    }

    if ($password !== '') {
        if ($password !== $confirm) {
            $errors[] = 'New passwords do not match.';
        } elseif (strlen($password) < 6) {
            $errors[] = 'Password must be at least 6 characters long.';
        }
    }

    if (!in_array($role, ['user', 'admin'], true)) {
        $role = $user['role'];
    }

    if (empty($errors)) {
        $stmt = $pdo->prepare('SELECT id FROM users WHERE (username = :username OR email = :email) AND id <> :id LIMIT 1');
        $stmt->execute([':username' => $username, ':email' => $email, ':id' => $user['id']]);
        if ($stmt->fetch()) {
            $errors[] = 'Another user already uses that username or email.';
        }
    }

    if (empty($errors)) {
        $stmt = $pdo->prepare('UPDATE users SET username = :username, email = :email, role = :role WHERE id = :id');
        $stmt->execute([
            ':username' => $username,
            ':email' => $email,
            ':role' => $role,
            ':id' => $user['id'],
        ]);

        if ($password !== '') {
            $hash = password_hash($password, PASSWORD_DEFAULT);
            $updatePassword = $pdo->prepare('UPDATE users SET password = :password WHERE id = :id');
            $updatePassword->execute([
                ':password' => $hash,
                ':id' => $user['id'],
            ]);
        }

        $_SESSION['flash_success'] = 'User updated successfully.';
        redirect('/admin/users_list.php');
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Edit User</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-light">
<?php include __DIR__ . '/../partials/admin_nav.php'; ?>
<div class="container py-4">
    <div class="row justify-content-center">
        <div class="col-lg-6">
            <div class="card shadow-sm">
                <div class="card-body">
                    <h1 class="h4 mb-4">Edit User</h1>
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
                            <label class="form-label">Username</label>
                            <input type="text" name="username" class="form-control" required value="<?= htmlspecialchars($_POST['username'] ?? $user['username']) ?>">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Email</label>
                            <input type="email" name="email" class="form-control" required value="<?= htmlspecialchars($_POST['email'] ?? $user['email']) ?>">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Role</label>
                            <select name="role" class="form-select">
                                <option value="user" <?= ($_POST['role'] ?? $user['role']) === 'user' ? 'selected' : '' ?>>User</option>
                                <option value="admin" <?= ($_POST['role'] ?? $user['role']) === 'admin' ? 'selected' : '' ?>>Admin</option>
                            </select>
                        </div>
                        <hr>
                        <h2 class="h5">Reset Password (optional)</h2>
                        <div class="mb-3">
                            <label class="form-label">New Password</label>
                            <input type="password" name="password" class="form-control">
                        </div>
                        <div class="mb-4">
                            <label class="form-label">Confirm New Password</label>
                            <input type="password" name="confirm" class="form-control">
                        </div>
                        <div class="d-flex justify-content-between align-items-center">
                            <a href="/admin/users_list.php" class="btn btn-link">Cancel</a>
                            <button class="btn btn-primary" type="submit">Save Changes</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
