<?php
require_once __DIR__ . '/../partials/guard/require_admin.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/csrf.php';
require_once __DIR__ . '/../helpers/flash.php';
require_once __DIR__ . '/../public/layout.php';

$userOptions = $pdo->query('SELECT id, username FROM users ORDER BY username ASC')->fetchAll();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user_id    = (int)($_POST['user_id'] ?? 0);
    $title      = trim($_POST['title'] ?? '');
    $description = trim($_POST['description'] ?? '');
    $due_date   = $_POST['due_date'] ?? null;
    $priority   = $_POST['priority'] ?? 'low';
    $status     = $_POST['status'] ?? 'pending';
    $csrf_token = $_POST['csrf_token'] ?? null;

    if (!verify_csrf_token($csrf_token)) {
        set_flash('danger', 'Invalid CSRF token.');
        redirect('/admin/tasks_add.php');
    }

    if ($user_id <= 0 || $title === '') {
        set_flash('danger', 'User and title are required.');
        redirect('/admin/tasks_add.php');
    }

    $userCheck = $pdo->prepare('SELECT id FROM users WHERE id = :id');
    $userCheck->execute([':id' => $user_id]);
    if (!$userCheck->fetch()) {
        set_flash('danger', 'Selected user does not exist.');
        redirect('/admin/tasks_add.php');
    }

    $stmt = $pdo->prepare('INSERT INTO tasks (user_id, title, description, due_date, priority, status) VALUES (:user_id, :title, :description, :due_date, :priority, :status)');
    $stmt->execute([
        ':user_id' => $user_id,
        ':title' => $title,
        ':description' => $description !== '' ? $description : null,
        ':due_date' => $due_date !== '' ? $due_date : null,
        ':priority' => $priority,
        ':status' => $status,
    ]);

    set_flash('success', 'Task created successfully.');
    redirect('/admin/tasks_list.php');
}

render_layout_header('Add Task');
?>
<h1 class="mb-4">Add Task</h1>
<?php include __DIR__ . '/../partials/alerts.php'; ?>
<form method="post" class="card card-body shadow-sm">
    <input type="hidden" name="csrf_token" value="<?= htmlspecialchars(generate_csrf_token()) ?>">
    <div class="mb-3">
        <label class="form-label" for="user_id">Assign to User</label>
        <select name="user_id" id="user_id" class="form-select" required>
            <option value="">Select user</option>
            <?php foreach ($userOptions as $user): ?>
                <option value="<?= htmlspecialchars($user['id']) ?>"><?= htmlspecialchars($user['username']) ?></option>
            <?php endforeach; ?>
        </select>
    </div>
    <div class="mb-3">
        <label class="form-label" for="title">Task Title</label>
        <input type="text" name="title" id="title" class="form-control" required>
    </div>
    <div class="mb-3">
        <label class="form-label" for="description">Task Description</label>
        <textarea name="description" id="description" class="form-control" rows="4"></textarea>
    </div>
    <div class="mb-3">
        <label class="form-label" for="due_date">Due Date / Deadline</label>
        <input type="date" name="due_date" id="due_date" class="form-control">
    </div>
    <div class="mb-3">
        <label class="form-label" for="priority">Priority</label>
        <select name="priority" id="priority" class="form-select">
            <option value="low">low</option>
            <option value="medium">medium</option>
            <option value="high">high</option>
        </select>
    </div>
    <div class="mb-4">
        <label class="form-label" for="status">Status</label>
        <select name="status" id="status" class="form-select">
            <option value="pending">pending</option>
            <option value="in_progress">in_progress</option>
            <option value="completed">completed</option>
        </select>
    </div>
    <div class="d-flex gap-2">
        <button type="submit" class="btn btn-primary">Create Task</button>
        <a href="/admin/tasks_list.php" class="btn btn-light">Cancel</a>
    </div>
</form>
<?php
render_layout_footer();
