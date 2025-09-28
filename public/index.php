<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../includes/functions.php';

if (isLoggedIn()) {
    redirect(isAdmin() ? 'admin.php' : 'dashboard.php');
}

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';

    if ($username === '' || $password === '') {
        $error = 'Please enter both username and password.';
    } else {
        $stmt = $pdo->prepare('SELECT id, username, password_hash, is_admin FROM users WHERE username = :username OR email = :username LIMIT 1');
        $stmt->execute([':username' => $username]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password_hash'])) {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];
            $_SESSION['is_admin'] = (bool)$user['is_admin'];

            redirect($user['is_admin'] ? 'admin.php' : 'dashboard.php');
        } else {
            $error = 'Invalid credentials. Please try again.';
        }
    }
}

$pageTitle = 'Login';
include __DIR__ . '/../includes/header.php';
?>
<div class="row justify-content-center">
    <div class="col-md-6">
        <div class="card card-shadow">
            <div class="card-body p-4">
                <h1 class="h3 mb-3 text-center"><i class="fa-solid fa-right-to-bracket me-2"></i>Login</h1>
                <?php if ($error): ?>
                    <div class="alert alert-danger" role="alert">
                        <?= h($error) ?>
                    </div>
                <?php endif; ?>
                <form method="post" class="needs-validation" novalidate>
                    <div class="mb-3">
                        <label for="username" class="form-label">Username or Email</label>
                        <input type="text" class="form-control" id="username" name="username" required>
                    </div>
                    <div class="mb-3">
                        <label for="password" class="form-label">Password</label>
                        <input type="password" class="form-control" id="password" name="password" required>
                    </div>
                    <div class="d-grid">
                        <button type="submit" class="btn btn-primary"><i class="fa-solid fa-right-to-bracket me-2"></i>Login</button>
                    </div>
                </form>
                <p class="mt-3 text-center">Don't have an account? <a href="register.php">Register here</a>.</p>
                <div class="alert alert-info mt-3" role="alert">
                    <strong>Admin credentials:</strong> admin / admin
                </div>
            </div>
        </div>
    </div>
</div>
<?php include __DIR__ . '/../includes/footer.php'; ?>
