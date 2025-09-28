<?php
require_once __DIR__ . '/../partials/guard/require_login.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../public/layout.php';
require_once __DIR__ . '/../helpers/csrf.php';

$userId = current_user_id();
$statusFilter = $_GET['status'] ?? '';
$priorityFilter = $_GET['priority'] ?? '';

$query = 'SELECT * FROM tasks WHERE user_id = :user_id';
$params = [':user_id' => $userId];

if ($statusFilter !== '') {
    $query .= ' AND status = :status';
    $params[':status'] = $statusFilter;
}

if ($priorityFilter !== '') {
    $query .= ' AND priority = :priority';
    $params[':priority'] = $priorityFilter;
}

$query .= ' ORDER BY due_date IS NULL, due_date ASC, created_at DESC';
$stmt = $pdo->prepare($query);
$stmt->execute($params);
$tasks = $stmt->fetchAll();

render_layout_header('My Tasks');
?>
<div class="d-flex justify-content-between align-items-center mb-3">
    <h1 class="h3">My Tasks</h1>
    <a href="/user/tasks_add.php" class="btn btn-primary">Add Task</a>
</div>
<?php include __DIR__ . '/../partials/alerts.php'; ?>
<form method="get" class="row g-2 mb-4">
    <div class="col-md-4">
        <label class="form-label">Status</label>
        <select name="status" class="form-select">
            <option value="">All</option>
            <option value="pending" <?= $statusFilter === 'pending' ? 'selected' : '' ?>>Pending</option>
            <option value="in_progress" <?= $statusFilter === 'in_progress' ? 'selected' : '' ?>>In Progress</option>
            <option value="completed" <?= $statusFilter === 'completed' ? 'selected' : '' ?>>Completed</option>
        </select>
    </div>
    <div class="col-md-4">
        <label class="form-label">Priority</label>
        <select name="priority" class="form-select">
            <option value="">All</option>
            <option value="low" <?= $priorityFilter === 'low' ? 'selected' : '' ?>>Low</option>
            <option value="medium" <?= $priorityFilter === 'medium' ? 'selected' : '' ?>>Medium</option>
            <option value="high" <?= $priorityFilter === 'high' ? 'selected' : '' ?>>High</option>
        </select>
    </div>
    <div class="col-md-4 d-flex align-items-end">
        <button type="submit" class="btn btn-outline-secondary me-2">Filter</button>
        <a href="/user/dashboard.php" class="btn btn-light">Reset</a>
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
        <?php if (empty($tasks)): ?>
            <tr>
                <td colspan="5" class="text-center">No tasks found.</td>
            </tr>
        <?php else: ?>
            <?php foreach ($tasks as $task): ?>
                <tr>
                    <td><?= htmlspecialchars($task['title']) ?></td>
                    <td><?= htmlspecialchars($task['due_date'] ?? '—') ?></td>
                    <td class="text-capitalize"><?= htmlspecialchars($task['priority']) ?></td>
                    <td class="text-capitalize"><?= htmlspecialchars(str_replace('_', ' ', $task['status'])) ?></td>
                    <td>
                        <a href="/user/tasks_edit.php?id=<?= urlencode($task['id']) ?>" class="btn btn-sm btn-outline-primary">Edit</a>
                        <form action="/user/tasks_delete.php" method="post" class="d-inline" onsubmit="return confirm('Delete this task?');">
                            <input type="hidden" name="csrf_token" value="<?= htmlspecialchars(generate_csrf_token()) ?>">
                            <input type="hidden" name="id" value="<?= htmlspecialchars($task['id']) ?>">
                            <button type="submit" class="btn btn-sm btn-outline-danger">Delete</button>
                        </form>
                    </td>
                </tr>
            <?php endforeach; ?>
        <?php endif; ?>
        </tbody>
    </table>
</div>
<?php
render_layout_footer();
