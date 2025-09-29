<?php
require_once __DIR__ . '/../partials/guard/require_login.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/csrf.php';
require_once __DIR__ . '/../helpers/flash.php';
require_once __DIR__ . '/../public/layout.php';

$userId = current_user_id();
$taskId = (int)($_GET['id'] ?? $_POST['id'] ?? 0);

$stmt = $pdo->prepare('SELECT * FROM tasks WHERE id = :id AND user_id = :user_id');
$stmt->execute([':id' => $taskId, ':user_id' => $userId]);
$task = $stmt->fetch();

if (!$task) {
    set_flash('danger', 'Task not found.');
    redirect('/user/dashboard.php');
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $title       = trim($_POST['title'] ?? '');
    $description = trim($_POST['description'] ?? '');
    $due_date    = $_POST['due_date'] ?? null;
    $priority    = $_POST['priority'] ?? 'low';
    $status      = $_POST['status'] ?? 'pending';
    $csrf_token  = $_POST['csrf_token'] ?? null;

    if (!verify_csrf_token($csrf_token)) {
        set_flash('danger', 'Invalid CSRF token.');
        redirect('/user/tasks_edit.php?id=' . urlencode($taskId));
    }

    if ($title === '') {
        set_flash('danger', 'Task title is required.');
        redirect('/user/tasks_edit.php?id=' . urlencode($taskId));
    }

    $update = $pdo->prepare('UPDATE tasks SET title = :title, description = :description, due_date = :due_date, priority = :priority, status = :status WHERE id = :id AND user_id = :user_id');
    $update->execute([
        ':title' => $title,
        ':description' => $description !== '' ? $description : null,
        ':due_date' => $due_date !== '' ? $due_date : null,
        ':priority' => $priority,
        ':status' => $status,
        ':id' => $taskId,
        ':user_id' => $userId,
    ]);

    set_flash('success', 'Task updated successfully.');
    redirect('/user/dashboard.php');
}

render_layout_header('Edit Task');
?>
<h1 class="mb-4">Edit Task</h1>
<?php include __DIR__ . '/../partials/alerts.php'; ?>
<form method="post" class="card card-body shadow-sm">
    <input type="hidden" name="csrf_token" value="<?= htmlspecialchars(generate_csrf_token()) ?>">
    <input type="hidden" name="id" value="<?= htmlspecialchars($task['id']) ?>">
    <div class="mb-3">
        <label class="form-label" for="title">Task Title</label>
        <input type="text" name="title" id="title" class="form-control" required value="<?= htmlspecialchars($task['title']) ?>">
    </div>
    <div class="mb-3">
        <label class="form-label" for="description">Task Description</label>
        <textarea name="description" id="description" class="form-control" rows="4"><?= htmlspecialchars($task['description'] ?? '') ?></textarea>
    </div>
    <div class="mb-3">
        <label class="form-label" for="due_date">Due Date / Deadline</label>
        <input type="date" name="due_date" id="due_date" class="form-control" value="<?= htmlspecialchars($_POST['due_date'] ?? ($task['due_date'] ?? '')) ?>">
    </div>
    <div class="mb-3">
        <label class="form-label" for="priority">Priority</label>
        <select name="priority" id="priority" class="form-select">
            <option value="low" <?= $task['priority'] === 'low' ? 'selected' : '' ?>>low</option>
            <option value="medium" <?= $task['priority'] === 'medium' ? 'selected' : '' ?>>medium</option>
            <option value="high" <?= $task['priority'] === 'high' ? 'selected' : '' ?>>high</option>
        </select>
    </div>
    <div class="mb-3">
        <label class="form-label" for="status">Status</label>
        <select name="status" id="status" class="form-select">
            <option value="pending" <?= $task['status'] === 'pending' ? 'selected' : '' ?>>pending</option>
            <option value="in_progress" <?= $task['status'] === 'in_progress' ? 'selected' : '' ?>>in_progress</option>
            <option value="completed" <?= $task['status'] === 'completed' ? 'selected' : '' ?>>completed</option>
        </select>
    </div>
    <div class="d-flex gap-2">
        <button type="submit" class="btn btn-primary">Update Task</button>
        <a href="/user/dashboard.php" class="btn btn-light">Cancel</a>
    </div>
</form>
<?php
render_layout_footer();
?>
