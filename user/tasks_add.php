<?php
require_once __DIR__ . '/../partials/guard/require_login.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/csrf.php';
require_once __DIR__ . '/../helpers/flash.php';
require_once __DIR__ . '/../public/layout.php';

$userId = current_user_id();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $title       = trim($_POST['title'] ?? '');
    $description = trim($_POST['description'] ?? '');
    $due_date    = $_POST['due_date'] ?? null;
    $priority    = $_POST['priority'] ?? 'low';
    $status      = $_POST['status'] ?? 'pending';
    $user_id     = (int)($_POST['user_id'] ?? 0);
    $csrf_token  = $_POST['csrf_token'] ?? null;

    if (!verify_csrf_token($csrf_token)) {
        set_flash('danger', 'Invalid CSRF token. Please try again.');
        redirect('/user/tasks_add.php');
    }

    if ($user_id !== $userId) {
        set_flash('danger', 'Invalid user.');
        redirect('/user/dashboard.php');
    }

    if ($title === '') {
        set_flash('danger', 'Task title is required.');
        redirect('/user/tasks_add.php');
    }

    $stmt = $pdo->prepare('INSERT INTO tasks (user_id, title, description, due_date, priority, status) VALUES (:user_id, :title, :description, :due_date, :priority, :status)');
    $stmt->execute([
        ':user_id' => $userId,
        ':title' => $title,
        ':description' => $description !== '' ? $description : null,
        ':due_date' => $due_date !== '' ? $due_date : null,
        ':priority' => $priority,
        ':status' => $status,
    ]);

    set_flash('success', 'Task created successfully.');
    redirect('/user/dashboard.php');
}

render_layout_header('Add Task');
?>
<h1 class="mb-4">Add Task</h1>
<?php include __DIR__ . '/../partials/alerts.php'; ?>
<form method="post" class="card card-body shadow-sm">
    <input type="hidden" name="csrf_token" value="<?= htmlspecialchars(generate_csrf_token()) ?>">
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
    <div class="mb-3">
        <label class="form-label" for="status">Status</label>
        <select name="status" id="status" class="form-select">
            <option value="pending">pending</option>
            <option value="in_progress">in_progress</option>
            <option value="completed">completed</option>
        </select>
    </div>
    <input type="hidden" name="user_id" value="<?= htmlspecialchars($userId) ?>">
    <div class="d-flex gap-2">
        <button type="submit" class="btn btn-primary">Save Task</button>
        <a href="/user/dashboard.php" class="btn btn-light">Cancel</a>
    </div>
</form>
<?php
render_layout_footer();
