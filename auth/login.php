<?php
/**
 * auth/login.php
 * ----------------
 * Shared login form for both standard users and administrators.
 */

require_once __DIR__ . '/../helpers/auth.php';
require_once __DIR__ . '/../helpers/csrf.php';
require_once __DIR__ . '/../config/db.php';

if (is_logged_in()) {
    redirect('/');
}

$errors = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!csrf_verify($_POST['csrf_token'] ?? null)) {
        $errors[] = 'Invalid form token, please try again.';
    }

    $identity = trim($_POST['identity'] ?? '');
    $password = $_POST['password'] ?? '';

    if ($identity === '' || $password === '') {
        $errors[] = 'Please provide your username/email and password.';
    }

    if (empty($errors)) {
        $stmt = $pdo->prepare('SELECT * FROM users WHERE username = :identity OR email = :identity LIMIT 1');
        $stmt->execute([':identity' => $identity]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password'])) {
            session_regenerate_id(true);
            $_SESSION['user_id'] = (int) $user['id'];
            $_SESSION['username'] = $user['username'];
            $_SESSION['role'] = $user['role'];
            $_SESSION['flash_success'] = 'Welcome back, ' . htmlspecialchars($user['username']) . '!';

            if ($user['role'] === 'admin') {
                redirect('/admin/dashboard.php');
            }

            redirect('/user/dashboard.php');
        } else {
            $errors[] = 'Invalid credentials provided.';
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-light">
    <div class="container py-5">
        <div class="row justify-content-center">
            <div class="col-lg-5">
                <div class="card shadow-sm">
                    <div class="card-body">
                        <h1 class="h3 mb-4 text-center">Sign In</h1>
                        <?php include __DIR__ . '/../partials/alerts.php'; ?>
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
                                <label class="form-label">Username or Email</label>
                                <input type="text" name="identity" class="form-control" required value="<?= htmlspecialchars($_POST['identity'] ?? '') ?>">
                            </div>
                            <div class="mb-4">
                                <label class="form-label">Password</label>
                                <input type="password" name="password" class="form-control" required>
                            </div>
                            <div class="d-grid">
                                <button class="btn btn-primary" type="submit">Login</button>
                            </div>
                        </form>
                        <p class="mt-3 mb-0 text-center">Need an account? <a href="/auth/register.php">Register here</a>.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
