<?php
/**
 * admin/tasks_list.php
 * ---------------------
 * Lists all tasks with filtering options for administrators.
 */

require_once __DIR__ . '/../partials/guard/require_admin.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/csrf.php';

$users = $pdo->query('SELECT id, username FROM users ORDER BY username ASC')->fetchAll();

$userFilter = isset($_GET['user_id']) ? (int) $_GET['user_id'] : 0;
$statusFilter = $_GET['status'] ?? '';
$priorityFilter = $_GET['priority'] ?? '';

$conditions = [];
$params = [];

if ($userFilter > 0) {
    $conditions[] = 't.user_id = :user_id';
    $params[':user_id'] = $userFilter;
}

if ($statusFilter && in_array($statusFilter, ['pending', 'in_progress', 'completed'], true)) {
    $conditions[] = 't.status = :status';
    $params[':status'] = $statusFilter;
}

if ($priorityFilter && in_array($priorityFilter, ['low', 'medium', 'high'], true)) {
    $conditions[] = 't.priority = :priority';
    $params[':priority'] = $priorityFilter;
}

$where = $conditions ? 'WHERE ' . implode(' AND ', $conditions) : '';

$sql = "SELECT t.*, u.username FROM tasks t INNER JOIN users u ON t.user_id = u.id {$where} ORDER BY t.due_date IS NULL, t.due_date ASC, t.created_at DESC";
$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$tasks = $stmt->fetchAll();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Manage Tasks</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
<?php include __DIR__ . '/../partials/admin_nav.php'; ?>
<div class="container py-4">
    <?php include __DIR__ . '/../partials/alerts.php'; ?>
    <h1 class="h3 mb-4">Tasks</h1>
    <form class="row g-3 mb-4" method="get">
        <div class="col-md-3">
            <label class="form-label">User</label>
            <select name="user_id" class="form-select">
                <option value="0">All Users</option>
                <?php foreach ($users as $user): ?>
                    <option value="<?= (int) $user['id'] ?>" <?= $userFilter === (int) $user['id'] ? 'selected' : '' ?>><?= htmlspecialchars($user['username']) ?></option>
                <?php endforeach; ?>
            </select>
        </div>
        <div class="col-md-3">
            <label class="form-label">Status</label>
            <select name="status" class="form-select">
                <option value="">All</option>
                <option value="pending" <?= $statusFilter === 'pending' ? 'selected' : '' ?>>Pending</option>
                <option value="in_progress" <?= $statusFilter === 'in_progress' ? 'selected' : '' ?>>In Progress</option>
                <option value="completed" <?= $statusFilter === 'completed' ? 'selected' : '' ?>>Completed</option>
            </select>
        </div>
        <div class="col-md-3">
            <label class="form-label">Priority</label>
            <select name="priority" class="form-select">
                <option value="">All</option>
                <option value="low" <?= $priorityFilter === 'low' ? 'selected' : '' ?>>Low</option>
                <option value="medium" <?= $priorityFilter === 'medium' ? 'selected' : '' ?>>Medium</option>
                <option value="high" <?= $priorityFilter === 'high' ? 'selected' : '' ?>>High</option>
            </select>
        </div>
        <div class="col-md-3 align-self-end">
            <button class="btn btn-outline-secondary" type="submit">Apply</button>
            <a class="btn btn-link" href="/admin/tasks_list.php">Reset</a>
        </div>
    </form>
    <div class="table-responsive">
        <table class="table table-striped align-middle">
            <thead>
                <tr>
                    <th>Title</th>
                    <th>User</th>
                    <th>Due</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <?php if (!$tasks): ?>
                    <tr>
                        <td colspan="6" class="text-center text-muted">No tasks found.</td>
                    </tr>
                <?php endif; ?>
                <?php foreach ($tasks as $task): ?>
                    <tr>
                        <td><?= htmlspecialchars($task['title']) ?></td>
                        <td><?= htmlspecialchars($task['username']) ?></td>
                        <td><?= $task['due_date'] ? htmlspecialchars($task['due_date']) : '<span class="text-muted">No due date</span>' ?></td>
                        <td><span class="badge bg-<?= $task['priority'] === 'high' ? 'danger' : ($task['priority'] === 'medium' ? 'warning text-dark' : 'secondary') ?>"><?= htmlspecialchars(ucfirst($task['priority'])) ?></span></td>
                        <td><?= htmlspecialchars(ucfirst(str_replace('_', ' ', $task['status']))) ?></td>
                        <td class="d-flex gap-2">
                            <a class="btn btn-sm btn-outline-primary" href="/admin/tasks_edit.php?id=<?= (int) $task['id'] ?>">Edit</a>
                            <form method="post" action="/admin/tasks_delete.php" onsubmit="return confirm('Delete this task?');">
                                <input type="hidden" name="csrf_token" value="<?= htmlspecialchars(csrf_token()) ?>">
                                <input type="hidden" name="id" value="<?= (int) $task['id'] ?>">
                                <button class="btn btn-sm btn-outline-danger" type="submit">Delete</button>
                            </form>
                        </td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</div>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
