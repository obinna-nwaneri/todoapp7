<?php
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../config/db.php';

ensure_role('admin');

$message = '';
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    $userId = (int)($_POST['user_id'] ?? 0);

    if ($userId <= 0) {
        $error = 'Invalid user selected.';
    } else {
        if ($action === 'reset') {
            $newPassword = password_hash('password123', PASSWORD_DEFAULT);
            $stmt = $pdo->prepare('UPDATE users SET password = :password WHERE id = :id');
            $stmt->execute([':password' => $newPassword, ':id' => $userId]);
            $message = 'Password reset to "password123" for the selected user.';
        } elseif ($action === 'delete') {
            if ($userId === $_SESSION['user_id']) {
                $error = 'You cannot delete your own account.';
            } else {
                $pdo->beginTransaction();
                try {
                    $deleteTasks = $pdo->prepare('DELETE FROM tasks WHERE user_id = :user_id');
                    $deleteTasks->execute([':user_id' => $userId]);

                    $deleteUser = $pdo->prepare('DELETE FROM users WHERE id = :id');
                    $deleteUser->execute([':id' => $userId]);

                    $pdo->commit();
                    $message = 'User and associated tasks deleted successfully.';
                } catch (Exception $e) {
                    $pdo->rollBack();
                    $error = 'An error occurred while deleting the user.';
                }
            }
        }
    }
}

$usersStmt = $pdo->query('SELECT id, username, email, role FROM users ORDER BY username ASC');
$users = $usersStmt->fetchAll();

$tasksStmt = $pdo->query('SELECT t.id, t.title, t.status, t.created_at, u.username FROM tasks t INNER JOIN users u ON t.user_id = u.id ORDER BY t.created_at DESC');
$tasks = $tasksStmt->fetchAll();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard - To-Do App</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
<nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container-fluid">
        <a class="navbar-brand" href="#">Admin Panel</a>
        <div class="d-flex">
            <span class="navbar-text text-white me-3">Administrator: <?php echo sanitize_output($_SESSION['username']); ?></span>
            <a class="btn btn-outline-light" href="/logout.php">Logout</a>
        </div>
    </div>
</nav>
<div class="container py-4">
    <h2 class="mb-4">User Management</h2>
    <?php if ($message): ?>
        <div class="alert alert-success alert-dismissible fade show" role="alert">
            <?php echo sanitize_output($message); ?>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    <?php endif; ?>
    <?php if ($error): ?>
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
            <?php echo sanitize_output($error); ?>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    <?php endif; ?>
    <div class="table-responsive mb-5">
        <table class="table table-striped align-middle">
            <thead class="table-dark">
                <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($users as $user): ?>
                    <tr>
                        <td><?php echo sanitize_output($user['username']); ?></td>
                        <td><?php echo sanitize_output($user['email']); ?></td>
                        <td><span class="badge <?php echo $user['role'] === 'admin' ? 'bg-danger' : 'bg-secondary'; ?>"><?php echo sanitize_output(ucfirst($user['role'])); ?></span></td>
                        <td>
                            <form method="post" class="d-inline">
                                <input type="hidden" name="user_id" value="<?php echo (int)$user['id']; ?>">
                                <input type="hidden" name="action" value="reset">
                                <button type="submit" class="btn btn-sm btn-outline-warning" onclick="return confirm('Reset password for this user?');">Reset Password</button>
                            </form>
                            <form method="post" class="d-inline">
                                <input type="hidden" name="user_id" value="<?php echo (int)$user['id']; ?>">
                                <input type="hidden" name="action" value="delete">
                                <button type="submit" class="btn btn-sm btn-outline-danger" onclick="return confirm('Delete this user and all their tasks?');">Delete</button>
                            </form>
                        </td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>

    <h2 class="mb-3">All Tasks</h2>
    <div class="table-responsive">
        <table class="table table-striped align-middle">
            <thead class="table-dark">
                <tr>
                    <th>Title</th>
                    <th>User</th>
                    <th>Status</th>
                    <th>Created At</th>
                </tr>
            </thead>
            <tbody>
                <?php if ($tasks): ?>
                    <?php foreach ($tasks as $task): ?>
                        <tr>
                            <td><?php echo sanitize_output($task['title']); ?></td>
                            <td><?php echo sanitize_output($task['username']); ?></td>
                            <td>
                                <span class="badge <?php echo $task['status'] === 'completed' ? 'bg-success' : 'bg-warning text-dark'; ?>">
                                    <?php echo sanitize_output(ucfirst($task['status'])); ?>
                                </span>
                            </td>
                            <td><?php echo sanitize_output(date('Y-m-d H:i', strtotime($task['created_at']))); ?></td>
                        </tr>
                    <?php endforeach; ?>
                <?php else: ?>
                    <tr>
                        <td colspan="4" class="text-center">No tasks available.</td>
                    </tr>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
</div>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
