<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../includes/functions.php';

requireLogin();

if (!isAdmin()) {
    setFlash('error', 'You do not have permission to access the admin area.');
    redirect('dashboard.php');
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';

    if ($action === 'reset_password') {
        $userId = (int)($_POST['user_id'] ?? 0);
        if ($userId === (int)$_SESSION['user_id']) {
            setFlash('error', 'You cannot reset your own password from the admin panel.');
            redirect('admin.php');
        }

        $stmt = $pdo->prepare('SELECT username FROM users WHERE id = :id');
        $stmt->execute([':id' => $userId]);
        $user = $stmt->fetch();
        if (!$user) {
            setFlash('error', 'User not found.');
            redirect('admin.php');
        }

        $newPassword = substr(bin2hex(random_bytes(6)), 0, 12);
        $hash = password_hash($newPassword, PASSWORD_DEFAULT);
        $update = $pdo->prepare('UPDATE users SET password_hash = :password_hash WHERE id = :id');
        $update->execute([':password_hash' => $hash, ':id' => $userId]);

        setFlash('success', 'Password reset for ' . $user['username'] . '. New password: ' . $newPassword);
        redirect('admin.php');
    }

    if ($action === 'delete_user') {
        $userId = (int)($_POST['user_id'] ?? 0);
        if ($userId === (int)$_SESSION['user_id']) {
            setFlash('error', 'You cannot delete your own account.');
            redirect('admin.php');
        }

        $delete = $pdo->prepare('DELETE FROM users WHERE id = :id');
        $delete->execute([':id' => $userId]);
        setFlash('success', 'User deleted successfully.');
        redirect('admin.php');
    }
}

$flashSuccess = getFlash('success');
$flashError = getFlash('error');

$usersStmt = $pdo->query('SELECT id, username, email, is_admin, created_at FROM users ORDER BY created_at DESC');
$users = $usersStmt->fetchAll();

$tasksStmt = $pdo->query('SELECT t.id, t.title, t.description, t.deadline, t.status, t.created_at, u.username FROM tasks t JOIN users u ON t.user_id = u.id ORDER BY t.created_at DESC');
$allTasks = $tasksStmt->fetchAll();

$pageTitle = 'Admin Dashboard';
include __DIR__ . '/../includes/header.php';
?>
<div class="row g-4">
    <div class="col-lg-6">
        <div class="card card-shadow">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h2 class="h5 mb-0"><i class="fa-solid fa-users me-2"></i>Users</h2>
                </div>
                <?php if ($flashSuccess): ?>
                    <div class="alert alert-success" role="alert">
                        <?= h($flashSuccess) ?>
                    </div>
                <?php endif; ?>
                <?php if ($flashError): ?>
                    <div class="alert alert-danger" role="alert">
                        <?= h($flashError) ?>
                    </div>
                <?php endif; ?>
                <div class="table-responsive">
                    <table class="table table-striped align-middle">
                        <thead>
                            <tr>
                                <th>Username</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th class="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($users as $user): ?>
                                <tr>
                                    <td><?= h($user['username']) ?></td>
                                    <td><?= h($user['email']) ?></td>
                                    <td>
                                        <?php if ($user['is_admin']): ?>
                                            <span class="badge bg-primary">Admin</span>
                                        <?php else: ?>
                                            <span class="badge bg-secondary">User</span>
                                        <?php endif; ?>
                                    </td>
                                    <td class="text-end">
                                        <?php if (!$user['is_admin']): ?>
                                            <form method="post" class="d-inline">
                                                <input type="hidden" name="action" value="reset_password">
                                                <input type="hidden" name="user_id" value="<?= (int)$user['id'] ?>">
                                                <button type="submit" class="btn btn-sm btn-outline-warning me-1" title="Reset password" onclick="return confirm('Reset password for <?= h($user['username']) ?>?');">
                                                    <i class="fa-solid fa-key"></i>
                                                </button>
                                            </form>
                                            <form method="post" class="d-inline" onsubmit="return confirm('Delete user <?= h($user['username']) ?>? This will remove all associated tasks.');">
                                                <input type="hidden" name="action" value="delete_user">
                                                <input type="hidden" name="user_id" value="<?= (int)$user['id'] ?>">
                                                <button type="submit" class="btn btn-sm btn-outline-danger" title="Delete user">
                                                    <i class="fa-solid fa-user-xmark"></i>
                                                </button>
                                            </form>
                                        <?php else: ?>
                                            <span class="text-muted small">No actions</span>
                                        <?php endif; ?>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
    <div class="col-lg-6">
        <div class="card card-shadow h-100">
            <div class="card-body">
                <h2 class="h5 mb-3"><i class="fa-solid fa-tasks me-2"></i>All Tasks</h2>
                <div class="table-responsive" style="max-height: 500px; overflow-y: auto;">
                    <table class="table table-striped align-middle">
                        <thead>
                            <tr>
                                <th>Task</th>
                                <th>User</th>
                                <th>Status</th>
                                <th>Deadline</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($allTasks as $task): ?>
                                <tr>
                                    <td>
                                        <strong><?= h($task['title']) ?></strong>
                                        <?php if ($task['description']): ?>
                                            <p class="mb-0 text-muted small"><?= nl2br(h($task['description'])) ?></p>
                                        <?php endif; ?>
                                    </td>
                                    <td><?= h($task['username']) ?></td>
                                    <td>
                                        <?php if ($task['status'] === 'completed'): ?>
                                            <span class="badge bg-success status-badge">Completed</span>
                                        <?php else: ?>
                                            <span class="badge bg-secondary status-badge">Pending</span>
                                        <?php endif; ?>
                                    </td>
                                    <td>
                                        <?php if (!empty($task['deadline'])): ?>
                                            <?= h(date('M d, Y', strtotime($task['deadline']))) ?>
                                        <?php else: ?>
                                            <span class="text-muted">No deadline</span>
                                        <?php endif; ?>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                            <?php if (!$allTasks): ?>
                                <tr>
                                    <td colspan="4" class="text-center text-muted">No tasks created yet.</td>
                                </tr>
                            <?php endif; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</div>
<?php include __DIR__ . '/../includes/footer.php'; ?>
