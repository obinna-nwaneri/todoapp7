<?php
require_once __DIR__ . '/../partials/guard/require_admin.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/csrf.php';
require_once __DIR__ . '/../public/layout.php';

$statusFilter = $_GET['status'] ?? '';
$priorityFilter = $_GET['priority'] ?? '';
$userFilter = $_GET['user'] ?? '';

$query = 'SELECT tasks.*, users.username FROM tasks JOIN users ON tasks.user_id = users.id WHERE 1=1';
$params = [];

if ($statusFilter !== '') {
    $query .= ' AND tasks.status = :status';
    $params[':status'] = $statusFilter;
}

if ($priorityFilter !== '') {
    $query .= ' AND tasks.priority = :priority';
    $params[':priority'] = $priorityFilter;
}

if ($userFilter !== '') {
    $query .= ' AND tasks.user_id = :user_id';
    $params[':user_id'] = (int)$userFilter;
}

$query .= ' ORDER BY tasks.due_date IS NULL, tasks.due_date ASC, tasks.created_at DESC';
$stmt = $pdo->prepare($query);
$stmt->execute($params);
$tasks = $stmt->fetchAll();

$userOptions = $pdo->query('SELECT id, username FROM users ORDER BY username ASC')->fetchAll();

render_layout_header('Manage Tasks');
?>
<div class="d-flex justify-content-between align-items-center mb-3">
    <h1 class="h3">All Tasks</h1>
    <a href="/admin/tasks_add.php" class="btn btn-primary">Add Task</a>
</div>
<?php include __DIR__ . '/../partials/alerts.php'; ?>
<form method="get" class="row g-2 mb-4">
    <div class="col-md-3">
        <label class="form-label">User</label>
        <select name="user" class="form-select">
            <option value="">All Users</option>
            <?php foreach ($userOptions as $user): ?>
                <option value="<?= htmlspecialchars($user['id']) ?>" <?= (string)$user['id'] === $userFilter ? 'selected' : '' ?>><?= htmlspecialchars($user['username']) ?></option>
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
    <div class="col-md-3 d-flex align-items-end">
        <button type="submit" class="btn btn-outline-secondary me-2">Filter</button>
        <a href="/admin/tasks_list.php" class="btn btn-light">Reset</a>
    </div>
</form>
<div class="table-responsive">
    <table class="table table-striped align-middle">
        <thead>
            <tr>
                <th>Title</th>
                <th>User</th>
                <th>Due Date</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            <?php if (empty($tasks)): ?>
                <tr><td colspan="6" class="text-center">No tasks found.</td></tr>
            <?php else: ?>
                <?php foreach ($tasks as $task): ?>
                    <tr>
                        <td><?= htmlspecialchars($task['title']) ?></td>
                        <td><?= htmlspecialchars($task['username']) ?></td>
                        <td><?= htmlspecialchars($task['due_date'] ?? '—') ?></td>
                        <td class="text-capitalize"><?= htmlspecialchars($task['priority']) ?></td>
                        <td class="text-capitalize"><?= htmlspecialchars(str_replace('_', ' ', $task['status'])) ?></td>
                        <td>
                            <a href="/admin/tasks_edit.php?id=<?= urlencode($task['id']) ?>" class="btn btn-sm btn-outline-primary">Edit</a>
                            <form action="/admin/tasks_delete.php" method="post" class="d-inline" onsubmit="return confirm('Delete this task?');">
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
