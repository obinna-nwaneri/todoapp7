<?php

declare(strict_types=1);

session_start();

if (!($_SESSION['admin_authenticated'] ?? false)) {
    header('Location: login.php');
    exit;
}

require_once __DIR__ . '/../functions.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';

    try {
        switch ($action) {
            case 'create':
                $title = trim($_POST['title'] ?? '');
                $description = trim($_POST['description'] ?? '');
                $dueDate = $_POST['due_date'] !== '' ? $_POST['due_date'] : null;

                if ($title === '' || $description === '') {
                    throw new InvalidArgumentException('Title and description are required.');
                }

                createTask($title, $description, $dueDate);
                $_SESSION['flash'] = ['type' => 'success', 'message' => 'Task created successfully.'];
                break;
            case 'update':
                $id = (int) ($_POST['id'] ?? 0);
                $title = trim($_POST['title'] ?? '');
                $description = trim($_POST['description'] ?? '');
                $dueDate = $_POST['due_date'] !== '' ? $_POST['due_date'] : null;
                $status = $_POST['status'] ?? 'pending';

                if ($id <= 0 || $title === '' || $description === '') {
                    throw new InvalidArgumentException('All fields are required for updating a task.');
                }

                updateTask($id, $title, $description, $dueDate, $status === 'completed' ? 'completed' : 'pending');
                $_SESSION['flash'] = ['type' => 'success', 'message' => 'Task updated successfully.'];
                break;
            case 'delete':
                $id = (int) ($_POST['id'] ?? 0);
                if ($id <= 0) {
                    throw new InvalidArgumentException('Invalid task selected for deletion.');
                }

                deleteTask($id);
                $_SESSION['flash'] = ['type' => 'success', 'message' => 'Task deleted successfully.'];
                break;
            case 'toggle':
                $id = (int) ($_POST['id'] ?? 0);
                if ($id <= 0) {
                    throw new InvalidArgumentException('Invalid task selected for update.');
                }

                toggleTaskStatus($id);
                $_SESSION['flash'] = ['type' => 'success', 'message' => 'Task status updated.'];
                break;
            default:
                throw new InvalidArgumentException('Unknown action requested.');
        }
    } catch (Throwable $exception) {
        $_SESSION['flash'] = ['type' => 'danger', 'message' => $exception->getMessage()];
    }

    header('Location: ' . $_SERVER['PHP_SELF']);
    exit;
}

$tasks = fetchTasks();
$counts = taskCountsByStatus();
$flash = $_SESSION['flash'] ?? null;
unset($_SESSION['flash']);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard - Todo App</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" integrity="sha512-9usAa6m8y+Vd2r1dT1dQYxYDs2WdGEylZm4+c2R/g+kPgX9nuSUXGKmEcg2YkdE+5EYXPL3x4lrFZ9+fkDaog==" crossorigin="anonymous" referrerpolicy="no-referrer" />
</head>
<body class="bg-light">
<nav class="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
    <div class="container">
        <a class="navbar-brand" href="dashboard.php"><i class="fa-solid fa-gauge-high me-2"></i>Admin Dashboard</a>
        <div class="d-flex align-items-center text-white">
            <span class="me-3"><i class="fa-solid fa-user me-1"></i><?= htmlspecialchars((string) ($_SESSION['admin_username'] ?? 'admin'), ENT_QUOTES, 'UTF-8') ?></span>
            <a class="btn btn-outline-light" href="logout.php"><i class="fa-solid fa-right-from-bracket me-1"></i>Logout</a>
        </div>
    </div>
</nav>
<div class="container mb-5">
    <?php if ($flash): ?>
        <div class="alert alert-<?= htmlspecialchars($flash['type'], ENT_QUOTES, 'UTF-8') ?> alert-dismissible fade show" role="alert">
            <?= htmlspecialchars($flash['message'], ENT_QUOTES, 'UTF-8') ?>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    <?php endif; ?>

    <div class="row g-4 mb-4">
        <div class="col-sm-4">
            <div class="card shadow-sm border-0">
                <div class="card-body text-center">
                    <h5 class="card-title text-muted">Total Tasks</h5>
                    <p class="display-6 mb-0"><?= count($tasks) ?></p>
                </div>
            </div>
        </div>
        <div class="col-sm-4">
            <div class="card shadow-sm border-0">
                <div class="card-body text-center">
                    <h5 class="card-title text-muted">Pending</h5>
                    <p class="display-6 text-warning mb-0"><?= $counts['pending'] ?></p>
                </div>
            </div>
        </div>
        <div class="col-sm-4">
            <div class="card shadow-sm border-0">
                <div class="card-body text-center">
                    <h5 class="card-title text-muted">Completed</h5>
                    <p class="display-6 text-success mb-0"><?= $counts['completed'] ?></p>
                </div>
            </div>
        </div>
    </div>

    <div class="card shadow-sm border-0 mb-4">
        <div class="card-body">
            <h2 class="h5 mb-3">Create Task</h2>
            <form method="post" class="row g-3">
                <input type="hidden" name="action" value="create">
                <div class="col-md-6">
                    <label for="title" class="form-label">Title</label>
                    <input type="text" class="form-control" id="title" name="title" required>
                </div>
                <div class="col-md-6">
                    <label for="due_date" class="form-label">Due Date</label>
                    <input type="date" class="form-control" id="due_date" name="due_date">
                </div>
                <div class="col-12">
                    <label for="description" class="form-label">Description</label>
                    <textarea class="form-control" id="description" name="description" rows="3" required></textarea>
                </div>
                <div class="col-12 text-end">
                    <button type="submit" class="btn btn-primary"><i class="fa-solid fa-plus me-2"></i>Add Task</button>
                </div>
            </form>
        </div>
    </div>

    <div class="card shadow-sm border-0">
        <div class="card-body p-0">
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                    <thead class="table-light">
                        <tr>
                            <th scope="col">Title</th>
                            <th scope="col">Description</th>
                            <th scope="col">Due Date</th>
                            <th scope="col">Status</th>
                            <th scope="col" class="text-end">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                    <?php if ($tasks): ?>
                        <?php foreach ($tasks as $task): ?>
                            <tr data-task='<?= json_encode($task, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_AMP | JSON_HEX_QUOT) ?>'>
                                <td class="fw-semibold"><?= htmlspecialchars($task['title'], ENT_QUOTES, 'UTF-8') ?></td>
                                <td><?= nl2br(htmlspecialchars($task['description'], ENT_QUOTES, 'UTF-8')) ?></td>
                                <td><?= $task['due_date'] ? htmlspecialchars($task['due_date'], ENT_QUOTES, 'UTF-8') : '—' ?></td>
                                <td>
                                    <span class="badge <?= $task['status'] === 'completed' ? 'bg-success' : 'bg-warning text-dark' ?>">
                                        <?= ucfirst($task['status']) ?>
                                    </span>
                                </td>
                                <td class="text-end">
                                    <div class="btn-group" role="group">
                                        <form method="post" class="me-2">
                                            <input type="hidden" name="action" value="toggle">
                                            <input type="hidden" name="id" value="<?= (int) $task['id'] ?>">
                                            <button type="submit" class="btn btn-sm btn-outline-secondary" title="Toggle status">
                                                <i class="fa-solid fa-rotate"></i>
                                            </button>
                                        </form>
                                        <button type="button" class="btn btn-sm btn-outline-primary me-2 btn-edit" data-bs-toggle="modal" data-bs-target="#editTaskModal">
                                            <i class="fa-solid fa-pen"></i>
                                        </button>
                                        <form method="post" onsubmit="return confirm('Delete this task?');">
                                            <input type="hidden" name="action" value="delete">
                                            <input type="hidden" name="id" value="<?= (int) $task['id'] ?>">
                                            <button type="submit" class="btn btn-sm btn-outline-danger" title="Delete">
                                                <i class="fa-solid fa-trash"></i>
                                            </button>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    <?php else: ?>
                        <tr>
                            <td colspan="5" class="text-center py-4 text-muted">No tasks available.</td>
                        </tr>
                    <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<div class="modal fade" id="editTaskModal" tabindex="-1" aria-labelledby="editTaskModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <form method="post">
                <input type="hidden" name="action" value="update">
                <input type="hidden" name="id" id="edit-id">
                <div class="modal-header">
                    <h5 class="modal-title" id="editTaskModalLabel">Edit Task</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label for="edit-title" class="form-label">Title</label>
                        <input type="text" class="form-control" id="edit-title" name="title" required>
                    </div>
                    <div class="mb-3">
                        <label for="edit-description" class="form-label">Description</label>
                        <textarea class="form-control" id="edit-description" name="description" rows="3" required></textarea>
                    </div>
                    <div class="mb-3">
                        <label for="edit-due-date" class="form-label">Due Date</label>
                        <input type="date" class="form-control" id="edit-due-date" name="due_date">
                    </div>
                    <div class="mb-3">
                        <label for="edit-status" class="form-label">Status</label>
                        <select class="form-select" id="edit-status" name="status">
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-primary">Update Task</button>
                </div>
            </form>
        </div>
    </div>
</div>

<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
<script>
    $(function () {
        $('.btn-edit').on('click', function () {
            const row = $(this).closest('tr');
            const data = row.data('task');
            if (!data) {
                return;
            }

            $('#edit-id').val(data.id);
            $('#edit-title').val(data.title);
            $('#edit-description').val(data.description);
            $('#edit-due-date').val(data.due_date);
            $('#edit-status').val(data.status);
        });
    });
</script>
</body>
</html>
