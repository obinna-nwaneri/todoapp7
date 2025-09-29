<?php
/**
 * user/tasks_edit.php
 * --------------------
 * Allows a logged-in user to edit a task they own.
 */

require_once __DIR__ . '/../partials/guard/require_login.php';
require_once __DIR__ . '/../helpers/csrf.php';
require_once __DIR__ . '/../config/db.php';

$id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
if ($id <= 0) {
    $_SESSION['flash_error'] = 'Invalid task selected.';
    redirect('/user/dashboard.php');
}

$stmt = $pdo->prepare('SELECT * FROM tasks WHERE id = :id AND user_id = :user_id');
$stmt->execute([':id' => $id, ':user_id' => current_user_id()]);
$task = $stmt->fetch();

if (!$task) {
    $_SESSION['flash_error'] = 'Task not found or access denied.';
    redirect('/user/dashboard.php');
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
    <div class="container py-5">
        <div class="row justify-content-center">
            <div class="col-lg-6">
                <div class="card shadow-sm">
                    <div class="card-body">
                        <h1 class="h3 mb-4">Edit Task</h1>
                        <form method="post" action="/user/tasks_edit_post.php" novalidate>
                            <input type="hidden" name="csrf_token" value="<?= htmlspecialchars(csrf_token()) ?>">
                            <input type="hidden" name="id" value="<?= (int) $task['id'] ?>">
                            <input type="hidden" name="user_id" value="<?= (int) current_user_id() ?>">
                            <div class="mb-3">
                                <label class="form-label">Task Title</label>
                                <input type="text" name="title" class="form-control" required value="<?= htmlspecialchars($task['title']) ?>">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Task Description</label>
                                <textarea name="description" class="form-control" rows="4"><?= htmlspecialchars($task['description'] ?? '') ?></textarea>
                            </div>
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <label class="form-label">Due Date</label>
                                    <input type="date" name="due_date" class="form-control" value="<?= htmlspecialchars($task['due_date']) ?>">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Priority</label>
                                    <select name="priority" class="form-select">
                                        <option value="low" <?= $task['priority'] === 'low' ? 'selected' : '' ?>>Low</option>
                                        <option value="medium" <?= $task['priority'] === 'medium' ? 'selected' : '' ?>>Medium</option>
                                        <option value="high" <?= $task['priority'] === 'high' ? 'selected' : '' ?>>High</option>
                                    </select>
                                </div>
                            </div>
                            <div class="mt-3">
                                <label class="form-label">Status</label>
                                <select name="status" class="form-select">
                                    <option value="pending" <?= $task['status'] === 'pending' ? 'selected' : '' ?>>Pending</option>
                                    <option value="in_progress" <?= $task['status'] === 'in_progress' ? 'selected' : '' ?>>In Progress</option>
                                    <option value="completed" <?= $task['status'] === 'completed' ? 'selected' : '' ?>>Completed</option>
                                </select>
                            </div>
                            <div class="d-flex justify-content-between align-items-center mt-4">
                                <a href="/user/dashboard.php" class="btn btn-link">Cancel</a>
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
