<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../includes/functions.php';

requireLogin();

$userId = (int)$_SESSION['user_id'];
$errors = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';

    if ($action === 'add_task') {
        $title = trim($_POST['title'] ?? '');
        $description = trim($_POST['description'] ?? '');
        $deadline = trim($_POST['deadline'] ?? '');

        if ($title === '') {
            $errors[] = 'Task title is required.';
        }

        if (!$errors) {
            $stmt = $pdo->prepare('INSERT INTO tasks (user_id, title, description, deadline, status) VALUES (:user_id, :title, :description, :deadline, :status)');
            $stmt->execute([
                ':user_id' => $userId,
                ':title' => $title,
                ':description' => $description,
                ':deadline' => $deadline !== '' ? $deadline : null,
                ':status' => 'pending',
            ]);
            setFlash('success', 'Task added successfully.');
            redirect('dashboard.php');
        } else {
            setFlash('error', implode(' ', $errors));
            redirect('dashboard.php');
        }
    }

    if (in_array($action, ['update_task', 'delete_task', 'toggle_status'], true)) {
        $taskId = (int)($_POST['task_id'] ?? 0);
        $stmt = $pdo->prepare('SELECT * FROM tasks WHERE id = :id AND user_id = :user_id');
        $stmt->execute([':id' => $taskId, ':user_id' => $userId]);
        $task = $stmt->fetch();

        if (!$task) {
            setFlash('error', 'Task not found.');
            redirect('dashboard.php');
        }

        if ($action === 'update_task') {
            $title = trim($_POST['title'] ?? '');
            $description = trim($_POST['description'] ?? '');
            $deadline = trim($_POST['deadline'] ?? '');

            if ($title === '') {
                setFlash('error', 'Task title is required.');
                redirect('dashboard.php');
            }

            $update = $pdo->prepare('UPDATE tasks SET title = :title, description = :description, deadline = :deadline WHERE id = :id');
            $update->execute([
                ':title' => $title,
                ':description' => $description,
                ':deadline' => $deadline !== '' ? $deadline : null,
                ':id' => $taskId,
            ]);
            setFlash('success', 'Task updated successfully.');
            redirect('dashboard.php');
        }

        if ($action === 'delete_task') {
            $delete = $pdo->prepare('DELETE FROM tasks WHERE id = :id');
            $delete->execute([':id' => $taskId]);
            setFlash('success', 'Task deleted successfully.');
            redirect('dashboard.php');
        }

        if ($action === 'toggle_status') {
            $newStatus = $task['status'] === 'completed' ? 'pending' : 'completed';
            $toggle = $pdo->prepare('UPDATE tasks SET status = :status WHERE id = :id');
            $toggle->execute([':status' => $newStatus, ':id' => $taskId]);
            setFlash('success', 'Task status updated.');
            redirect('dashboard.php');
        }
    }
}

$flashSuccess = getFlash('success');
$flashError = getFlash('error');

$stmt = $pdo->prepare('SELECT * FROM tasks WHERE user_id = :user_id ORDER BY CASE WHEN deadline IS NULL OR deadline = "" THEN 1 ELSE 0 END, deadline ASC, created_at DESC');
$stmt->execute([':user_id' => $userId]);
$tasks = $stmt->fetchAll();

$pageTitle = 'Dashboard';
include __DIR__ . '/../includes/header.php';
?>
<div class="row g-4">
    <div class="col-lg-4">
        <div class="card card-shadow h-100">
            <div class="card-body">
                <h2 class="h5 mb-3"><i class="fa-solid fa-plus me-2"></i>Add New Task</h2>
                <?php if ($flashError): ?>
                    <div class="alert alert-danger" role="alert">
                        <?= h($flashError) ?>
                    </div>
                <?php endif; ?>
                <form method="post" novalidate>
                    <input type="hidden" name="action" value="add_task">
                    <div class="mb-3">
                        <label for="title" class="form-label">Title</label>
                        <input type="text" class="form-control" id="title" name="title" required>
                    </div>
                    <div class="mb-3">
                        <label for="description" class="form-label">Description</label>
                        <textarea class="form-control" id="description" name="description" rows="3"></textarea>
                    </div>
                    <div class="mb-3">
                        <label for="deadline" class="form-label">Deadline</label>
                        <input type="date" class="form-control" id="deadline" name="deadline">
                    </div>
                    <div class="d-grid">
                        <button type="submit" class="btn btn-primary"><i class="fa-solid fa-plus me-2"></i>Add Task</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    <div class="col-lg-8">
        <div class="card card-shadow">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h2 class="h5 mb-0"><i class="fa-solid fa-list-check me-2"></i>Your Tasks</h2>
                    <?php if ($flashSuccess): ?>
                        <span class="badge bg-success status-badge"><i class="fa-solid fa-circle-check me-1"></i><?= h($flashSuccess) ?></span>
                    <?php endif; ?>
                </div>
                <?php if (!$tasks): ?>
                    <div class="alert alert-info" role="alert">
                        You have no tasks yet. Create one using the form on the left.
                    </div>
                <?php else: ?>
                    <div class="table-responsive">
                        <table class="table table-striped align-middle">
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Deadline</th>
                                    <th>Status</th>
                                    <th class="text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($tasks as $task): ?>
                                    <tr>
                                        <td>
                                            <strong><?= h($task['title']) ?></strong>
                                            <?php if ($task['description']): ?>
                                                <p class="mb-0 text-muted small"><?= nl2br(h($task['description'])) ?></p>
                                            <?php endif; ?>
                                        </td>
                                        <td>
                                            <?php if (!empty($task['deadline'])): ?>
                                                <?= h(date('M d, Y', strtotime($task['deadline']))) ?>
                                            <?php else: ?>
                                                <span class="text-muted">No deadline</span>
                                            <?php endif; ?>
                                        </td>
                                        <td>
                                            <?php if ($task['status'] === 'completed'): ?>
                                                <span class="badge bg-success status-badge"><i class="fa-solid fa-circle-check me-1"></i>Completed</span>
                                            <?php else: ?>
                                                <span class="badge bg-secondary status-badge"><i class="fa-solid fa-hourglass-half me-1"></i>Pending</span>
                                            <?php endif; ?>
                                        </td>
                                        <td class="text-end">
                                            <form method="post" class="d-inline">
                                                <input type="hidden" name="action" value="toggle_status">
                                                <input type="hidden" name="task_id" value="<?= (int)$task['id'] ?>">
                                                <button type="submit" class="btn btn-sm btn-outline-success me-1" title="Toggle status">
                                                    <i class="fa-solid fa-arrows-rotate"></i>
                                                </button>
                                            </form>
                                            <button class="btn btn-sm btn-outline-primary me-1 edit-task-btn" data-bs-toggle="modal" data-bs-target="#editTaskModal"
                                                data-id="<?= (int)$task['id'] ?>"
                                                data-title="<?= h($task['title']) ?>"
                                                data-description="<?= h($task['description']) ?>"
                                                data-deadline="<?= h($task['deadline']) ?>">
                                                <i class="fa-solid fa-pen-to-square"></i>
                                            </button>
                                            <form method="post" class="d-inline" onsubmit="return confirm('Are you sure you want to delete this task?');">
                                                <input type="hidden" name="action" value="delete_task">
                                                <input type="hidden" name="task_id" value="<?= (int)$task['id'] ?>">
                                                <button type="submit" class="btn btn-sm btn-outline-danger" title="Delete task">
                                                    <i class="fa-solid fa-trash"></i>
                                                </button>
                                            </form>
                                        </td>
                                    </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                <?php endif; ?>
            </div>
        </div>
    </div>
</div>

<div class="modal fade" id="editTaskModal" tabindex="-1" aria-labelledby="editTaskModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <form method="post" id="editTaskForm">
                <div class="modal-header">
                    <h5 class="modal-title" id="editTaskModalLabel"><i class="fa-solid fa-pen-to-square me-2"></i>Edit Task</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <input type="hidden" name="action" value="update_task">
                    <input type="hidden" name="task_id" id="edit-task-id">
                    <div class="mb-3">
                        <label for="edit-title" class="form-label">Title</label>
                        <input type="text" class="form-control" id="edit-title" name="title" required>
                    </div>
                    <div class="mb-3">
                        <label for="edit-description" class="form-label">Description</label>
                        <textarea class="form-control" id="edit-description" name="description" rows="3"></textarea>
                    </div>
                    <div class="mb-3">
                        <label for="edit-deadline" class="form-label">Deadline</label>
                        <input type="date" class="form-control" id="edit-deadline" name="deadline">
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save changes</button>
                </div>
            </form>
        </div>
    </div>
</div>
<?php
$pageScripts = '<script>$(function(){\n    $(\".edit-task-btn\").on(\"click\", function(){\n        const button = $(this);\n        $(\"#edit-task-id\").val(button.data(\"id\"));\n        $(\"#edit-title\").val(button.data(\"title\"));\n        $(\"#edit-description\").val(button.data(\"description\"));\n        const deadline = button.data(\"deadline\");\n        if(deadline){\n            $(\"#edit-deadline\").val(deadline.substring(0,10));\n        } else {\n            $(\"#edit-deadline\").val(\"\");\n        }\n    });\n});</script>';
include __DIR__ . '/../includes/footer.php';
?>
