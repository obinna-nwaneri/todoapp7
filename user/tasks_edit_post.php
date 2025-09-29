<?php
/**
 * user/tasks_edit_post.php
 * -------------------------
 * Updates an existing task owned by the current user.
 */

require_once __DIR__ . '/../partials/guard/require_login.php';
require_once __DIR__ . '/../helpers/csrf.php';
require_once __DIR__ . '/../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect('/user/dashboard.php');
}

if (!csrf_verify($_POST['csrf_token'] ?? null)) {
    $_SESSION['flash_error'] = 'Invalid form token, please try again.';
    redirect('/user/dashboard.php');
}

$id = isset($_POST['id']) ? (int) $_POST['id'] : 0;
if ($id <= 0) {
    $_SESSION['flash_error'] = 'Invalid task selected.';
    redirect('/user/dashboard.php');
}

$stmt = $pdo->prepare('SELECT user_id FROM tasks WHERE id = :id');
$stmt->execute([':id' => $id]);
$task = $stmt->fetch();

if (!$task || (int) $task['user_id'] !== current_user_id()) {
    $_SESSION['flash_error'] = 'Task not found or access denied.';
    redirect('/user/dashboard.php');
}

$title = trim($_POST['title'] ?? '');
$description = trim($_POST['description'] ?? '');
$due_date = $_POST['due_date'] ?? null;
$priority = $_POST['priority'] ?? 'low';
$status = $_POST['status'] ?? 'pending';

$valid_priorities = ['low', 'medium', 'high'];
$valid_statuses = ['pending', 'in_progress', 'completed'];

if ($title === '') {
    $_SESSION['flash_error'] = 'Task title is required.';
    redirect('/user/tasks_edit.php?id=' . $id);
}

if ($due_date === '') {
    $due_date = null;
}

if ($due_date && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $due_date)) {
    $_SESSION['flash_error'] = 'Invalid due date format.';
    redirect('/user/tasks_edit.php?id=' . $id);
}

if (!in_array($priority, $valid_priorities, true)) {
    $priority = 'low';
}

if (!in_array($status, $valid_statuses, true)) {
    $status = 'pending';
}

$stmt = $pdo->prepare('UPDATE tasks SET title = :title, description = :description, due_date = :due_date, priority = :priority, status = :status WHERE id = :id');
$stmt->execute([
    ':title' => $title,
    ':description' => $description !== '' ? $description : null,
    ':due_date' => $due_date,
    ':priority' => $priority,
    ':status' => $status,
    ':id' => $id,
]);

$_SESSION['flash_success'] = 'Task updated successfully.';
redirect('/user/dashboard.php');
