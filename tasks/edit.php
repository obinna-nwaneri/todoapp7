<?php
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../config/db.php';

ensure_role('user');

$taskId = (int)($_GET['id'] ?? $_POST['id'] ?? 0);

if ($taskId <= 0) {
    header('Location: /user/dashboard.php?error=' . urlencode('Invalid task selected.'));
    exit;
}

$stmt = $pdo->prepare('SELECT id, title, description, status FROM tasks WHERE id = :id AND user_id = :user_id');
$stmt->execute([':id' => $taskId, ':user_id' => $_SESSION['user_id']]);
$task = $stmt->fetch();

if (!$task) {
    header('Location: /user/dashboard.php?error=' . urlencode('Task not found.'));
    exit;
}

$errors = [];
$title = $task['title'];
$description = $task['description'];
$status = $task['status'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $title = trim($_POST['title'] ?? '');
    $description = trim($_POST['description'] ?? '');
    $status = $_POST['status'] ?? 'pending';

    if ($title === '') {
        $errors[] = 'Title is required.';
    }

    if (!in_array($status, ['pending', 'completed'], true)) {
        $status = 'pending';
    }

    if (!$errors) {
        $updateStmt = $pdo->prepare('UPDATE tasks SET title = :title, description = :description, status = :status WHERE id = :id AND user_id = :user_id');
        $updateStmt->execute([
            ':title' => $title,
            ':description' => $description,
            ':status' => $status,
            ':id' => $taskId,
            ':user_id' => $_SESSION['user_id'],
        ]);

        header('Location: /user/dashboard.php?message=' . urlencode('Task updated successfully.'));
        exit;
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Edit Task - To-Do App</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-light">
<div class="container py-5">
    <div class="row justify-content-center">
        <div class="col-md-8 col-lg-6">
            <div class="card shadow-sm">
                <div class="card-body">
                    <h2 class="card-title mb-4">Edit Task</h2>
                    <?php if ($errors): ?>
                        <div class="alert alert-danger">
                            <ul class="mb-0">
                                <?php foreach ($errors as $error): ?>
                                    <li><?php echo sanitize_output($error); ?></li>
                                <?php endforeach; ?>
                            </ul>
                        </div>
                    <?php endif; ?>
                    <form method="post" novalidate id="taskForm">
                        <input type="hidden" name="id" value="<?php echo (int)$task['id']; ?>">
                        <div class="mb-3">
                            <label for="title" class="form-label">Title</label>
                            <input type="text" class="form-control" id="title" name="title" value="<?php echo sanitize_output($title); ?>" required>
                            <div class="invalid-feedback">Please provide a task title.</div>
                        </div>
                        <div class="mb-3">
                            <label for="description" class="form-label">Description</label>
                            <textarea class="form-control" id="description" name="description" rows="4"><?php echo sanitize_output($description); ?></textarea>
                        </div>
                        <div class="mb-3">
                            <label for="status" class="form-label">Status</label>
                            <select class="form-select" id="status" name="status">
                                <option value="pending" <?php echo $status === 'pending' ? 'selected' : ''; ?>>Pending</option>
                                <option value="completed" <?php echo $status === 'completed' ? 'selected' : ''; ?>>Completed</option>
                            </select>
                        </div>
                        <div class="d-flex justify-content-between">
                            <a href="/user/dashboard.php" class="btn btn-secondary">Back</a>
                            <button type="submit" class="btn btn-primary">Update Task</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>
<script>
    (function () {
        'use strict';
        const form = document.getElementById('taskForm');
        form.addEventListener('submit', function (event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        });
    })();
</script>
</body>
</html>
