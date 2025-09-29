<?php
/**
 * admin/tasks_edit.php
 * ---------------------
 * Allows administrators to edit any task and reassign it to another user.
 */

require_once __DIR__ . '/../partials/guard/require_admin.php';
require_once __DIR__ . '/../helpers/csrf.php';
require_once __DIR__ . '/../config/db.php';

$id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
if ($id <= 0) {
    $_SESSION['flash_error'] = 'Invalid task selected.';
    redirect('/admin/tasks_list.php');
}

$stmt = $pdo->prepare('SELECT * FROM tasks WHERE id = :id');
$stmt->execute([':id' => $id]);
$task = $stmt->fetch();

if (!$task) {
    $_SESSION['flash_error'] = 'Task not found.';
    redirect('/admin/tasks_list.php');
}

$users = $pdo->query('SELECT id, username FROM users ORDER BY username ASC')->fetchAll();
$errors = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!csrf_verify($_POST['csrf_token'] ?? null)) {
        $errors[] = 'Invalid form token, please try again.';
    }

    $title = trim($_POST['title'] ?? '');
    $description = trim($_POST['description'] ?? '');
    $due_date = $_POST['due_date'] ?? null;
    $priority = $_POST['priority'] ?? $task['priority'];
    $status = $_POST['status'] ?? $task['status'];
    $user_id = isset($_POST['user_id']) ? (int) $_POST['user_id'] : $task['user_id'];

    if ($title === '') {
        $errors[] = 'Task title is required.';
    }

    if ($due_date === '') {
        $due_date = null;
    }

    if ($due_date && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $due_date)) {
        $errors[] = 'Invalid due date format.';
    }

    if (!in_array($priority, ['low', 'medium', 'high'], true)) {
        $priority = 'low';
    }

    if (!in_array($status, ['pending', 'in_progress', 'completed'], true)) {
        $status = 'pending';
    }

    $userExists = $pdo->prepare('SELECT id FROM users WHERE id = :id');
    $userExists->execute([':id' => $user_id]);
    if (!$userExists->fetch()) {
        $errors[] = 'Selected user does not exist.';
    }

    if (empty($errors)) {
        $stmt = $pdo->prepare('UPDATE tasks SET user_id = :user_id, title = :title, description = :description, due_date = :due_date, priority = :priority, status = :status WHERE id = :id');
        $stmt->execute([
            ':user_id' => $user_id,
            ':title' => $title,
            ':description' => $description !== '' ? $description : null,
            ':due_date' => $due_date,
            ':priority' => $priority,
            ':status' => $status,
            ':id' => $task['id'],
        ]);

        $_SESSION['flash_success'] = 'Task updated successfully.';
        redirect('/admin/tasks_list.php');
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Edit Task</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-light">
<?php include __DIR__ . '/../partials/admin_nav.php'; ?>
<div class="container py-4">
    <div class="row justify-content-center">
        <div class="col-lg-6">
            <div class="card shadow-sm">
                <div class="card-body">
                    <h1 class="h4 mb-4">Edit Task</h1>
                    <?php if ($errors): ?>
                        <div class="alert alert-danger">
                            <ul class="mb-0">
                                <?php foreach ($errors as $error): ?>
                                    <li><?= htmlspecialchars($error) ?></li>
                                <?php endforeach; ?>
                            </ul>
                        </div>
                    <?php endif; ?>
                    <form method="post" novalidate>
                        <input type="hidden" name="csrf_token" value="<?= htmlspecialchars(csrf_token()) ?>">
                        <div class="mb-3">
                            <label class="form-label">Assign to User</label>
                            <select name="user_id" class="form-select">
                                <?php foreach ($users as $user): ?>
                                    <option value="<?= (int) $user['id'] ?>" <?= ($task['user_id'] == $user['id'] ? 'selected' : '') ?>><?= htmlspecialchars($user['username']) ?></option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Task Title</label>
                            <input type="text" name="title" class="form-control" required value="<?= htmlspecialchars($_POST['title'] ?? $task['title']) ?>">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Task Description</label>
                            <textarea name="description" class="form-control" rows="4"><?= htmlspecialchars($_POST['description'] ?? $task['description']) ?></textarea>
                        </div>
                        <div class="row g-3">
                            <div class="col-md-6">
                                <label class="form-label">Due Date</label>
                                <input type="date" name="due_date" class="form-control" value="<?= htmlspecialchars($_POST['due_date'] ?? $task['due_date']) ?>">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Priority</label>
                                <select name="priority" class="form-select">
                                    <?php $priorityValue = $_POST['priority'] ?? $task['priority']; ?>
                                    <option value="low" <?= $priorityValue === 'low' ? 'selected' : '' ?>>Low</option>
                                    <option value="medium" <?= $priorityValue === 'medium' ? 'selected' : '' ?>>Medium</option>
                                    <option value="high" <?= $priorityValue === 'high' ? 'selected' : '' ?>>High</option>
                                </select>
                            </div>
                        </div>
                        <div class="mt-3">
                            <label class="form-label">Status</label>
                            <?php $statusValue = $_POST['status'] ?? $task['status']; ?>
                            <select name="status" class="form-select">
                                <option value="pending" <?= $statusValue === 'pending' ? 'selected' : '' ?>>Pending</option>
                                <option value="in_progress" <?= $statusValue === 'in_progress' ? 'selected' : '' ?>>In Progress</option>
                                <option value="completed" <?= $statusValue === 'completed' ? 'selected' : '' ?>>Completed</option>
                            </select>
                        </div>
                        <div class="d-flex justify-content-between align-items-center mt-4">
                            <a href="/admin/tasks_list.php" class="btn btn-link">Cancel</a>
                            <button class="btn btn-primary" type="submit">Update Task</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
