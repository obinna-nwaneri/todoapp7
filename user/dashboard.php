<?php
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../config/db.php';

ensure_role('user');

$userId = $_SESSION['user_id'];

$stmt = $pdo->prepare('SELECT id, title, description, status, created_at FROM tasks WHERE user_id = :user_id ORDER BY created_at DESC');
$stmt->execute([':user_id' => $userId]);
$tasks = $stmt->fetchAll();

$message = $_GET['message'] ?? '';
$error = $_GET['error'] ?? '';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>User Dashboard - To-Do App</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
<nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container-fluid">
        <a class="navbar-brand" href="#">To-Do App</a>
        <div class="d-flex">
            <span class="navbar-text text-white me-3">Hello, <?php echo sanitize_output($_SESSION['username']); ?></span>
            <a class="btn btn-outline-light" href="/logout.php">Logout</a>
        </div>
    </div>
</nav>
<div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
        <h2>Your Tasks</h2>
        <a href="/tasks/add.php" class="btn btn-primary">Add Task</a>
    </div>
    <?php if ($message): ?>
        <div class="alert alert-success alert-dismissible fade show" role="alert">
            <?php echo sanitize_output($message); ?>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    <?php endif; ?>
    <?php if ($error): ?>
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
            <?php echo sanitize_output($error); ?>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    <?php endif; ?>
    <div class="table-responsive">
        <table class="table table-striped align-middle">
            <thead class="table-dark">
                <tr>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Created At</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <?php if ($tasks): ?>
                    <?php foreach ($tasks as $task): ?>
                        <tr>
                            <td><?php echo sanitize_output($task['title']); ?></td>
                            <td><?php echo nl2br(sanitize_output($task['description'])); ?></td>
                            <td>
                                <span class="badge <?php echo $task['status'] === 'completed' ? 'bg-success' : 'bg-warning text-dark'; ?>">
                                    <?php echo sanitize_output(ucfirst($task['status'])); ?>
                                </span>
                            </td>
                            <td><?php echo sanitize_output(date('Y-m-d H:i', strtotime($task['created_at']))); ?></td>
                            <td>
                                <a href="/tasks/edit.php?id=<?php echo (int)$task['id']; ?>" class="btn btn-sm btn-outline-primary me-1">Edit</a>
                                <form action="/tasks/delete.php" method="post" class="d-inline" onsubmit="return confirm('Are you sure you want to delete this task?');">
                                    <input type="hidden" name="id" value="<?php echo (int)$task['id']; ?>">
                                    <button type="submit" class="btn btn-sm btn-outline-danger">Delete</button>
                                </form>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                <?php else: ?>
                    <tr>
                        <td colspan="5" class="text-center">No tasks found. Start by adding a new task.</td>
                    </tr>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
</div>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
