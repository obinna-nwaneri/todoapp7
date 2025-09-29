<?php
/**
 * user/dashboard.php
 * -------------------
 * Displays a logged-in user's personal task list with simple filtering options.
 */

require_once __DIR__ . '/../partials/guard/require_login.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/csrf.php';

$status_filter = $_GET['status'] ?? '';
$priority_filter = $_GET['priority'] ?? '';

$conditions = ['user_id = :user_id'];
$params = [':user_id' => current_user_id()];

if ($status_filter && in_array($status_filter, ['pending', 'in_progress', 'completed'], true)) {
    $conditions[] = 'status = :status';
    $params[':status'] = $status_filter;
}

if ($priority_filter && in_array($priority_filter, ['low', 'medium', 'high'], true)) {
    $conditions[] = 'priority = :priority';
    $params[':priority'] = $priority_filter;
}

$where = implode(' AND ', $conditions);
$stmt = $pdo->prepare("SELECT * FROM tasks WHERE {$where} ORDER BY due_date IS NULL, due_date ASC, created_at DESC");
$stmt->execute($params);
$tasks = $stmt->fetchAll();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>User Dashboard</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
<nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container">
        <a class="navbar-brand" href="#">Todo App</a>
        <div class="d-flex align-items-center">
            <span class="text-light me-3">Logged in as <strong><?= htmlspecialchars($_SESSION['username']) ?></strong> <span class="badge bg-secondary"><?= htmlspecialchars($_SESSION['role']) ?></span></span>
            <a class="btn btn-outline-light btn-sm me-2" href="/auth/change_password.php">Change Password</a>
            <a class="btn btn-warning btn-sm" href="/auth/logout.php">Logout</a>
        </div>
    </div>
</nav>
<div class="container py-4">
    <?php include __DIR__ . '/../partials/alerts.php'; ?>
    <div class="d-flex justify-content-between align-items-center mb-3">
        <h1 class="h3 mb-0">My Tasks</h1>
        <a href="/user/tasks_add.php" class="btn btn-primary">Add Task</a>
    </div>
    <form class="row g-3 mb-4" method="get">
        <div class="col-md-4">
            <label class="form-label">Status</label>
            <select name="status" class="form-select">
                <option value="">All</option>
                <option value="pending" <?= $status_filter === 'pending' ? 'selected' : '' ?>>Pending</option>
                <option value="in_progress" <?= $status_filter === 'in_progress' ? 'selected' : '' ?>>In Progress</option>
                <option value="completed" <?= $status_filter === 'completed' ? 'selected' : '' ?>>Completed</option>
            </select>
        </div>
        <div class="col-md-4">
            <label class="form-label">Priority</label>
            <select name="priority" class="form-select">
                <option value="">All</option>
                <option value="low" <?= $priority_filter === 'low' ? 'selected' : '' ?>>Low</option>
                <option value="medium" <?= $priority_filter === 'medium' ? 'selected' : '' ?>>Medium</option>
                <option value="high" <?= $priority_filter === 'high' ? 'selected' : '' ?>>High</option>
            </select>
        </div>
        <div class="col-md-4 align-self-end">
            <button class="btn btn-outline-secondary" type="submit">Apply Filters</button>
            <a class="btn btn-link" href="/user/dashboard.php">Reset</a>
        </div>
    </form>
    <div class="table-responsive">
        <table class="table table-striped align-middle">
            <thead>
                <tr>
                    <th>Title</th>
                    <th>Due Date</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <?php if (!$tasks): ?>
                    <tr>
                        <td colspan="5" class="text-center text-muted">No tasks found.</td>
                    </tr>
                <?php endif; ?>
                <?php foreach ($tasks as $task): ?>
                    <tr>
                        <td><?= htmlspecialchars($task['title']) ?></td>
                        <td><?= $task['due_date'] ? htmlspecialchars($task['due_date']) : '<span class="text-muted">No due date</span>' ?></td>
                        <td><span class="badge bg-<?= $task['priority'] === 'high' ? 'danger' : ($task['priority'] === 'medium' ? 'warning text-dark' : 'secondary') ?>"><?= htmlspecialchars(ucfirst(str_replace('_', ' ', $task['priority']))) ?></span></td>
                        <td><?= htmlspecialchars(ucfirst(str_replace('_', ' ', $task['status']))) ?></td>
                        <td class="d-flex gap-2">
                            <a class="btn btn-sm btn-outline-primary" href="/user/tasks_edit.php?id=<?= (int) $task['id'] ?>">Edit</a>
                            <form method="post" action="/user/tasks_delete.php" onsubmit="return confirm('Delete this task?');">
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
