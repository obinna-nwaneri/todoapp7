<?php
/**
 * user/tasks_add_post.php
 * ------------------------
 * Handles the POST submission from the create task form.
 */

require_once __DIR__ . '/../partials/guard/require_login.php';
require_once __DIR__ . '/../helpers/csrf.php';
require_once __DIR__ . '/../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect('/user/dashboard.php');
}

if (!csrf_verify($_POST['csrf_token'] ?? null)) {
    $_SESSION['flash_error'] = 'Invalid form token, please try again.';
    redirect('/user/tasks_add.php');
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
    redirect('/user/tasks_add.php');
}

if ($due_date === '') {
    $due_date = null;
}

if ($due_date && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $due_date)) {
    $_SESSION['flash_error'] = 'Invalid due date format.';
    redirect('/user/tasks_add.php');
}

if (!in_array($priority, $valid_priorities, true)) {
    $priority = 'low';
}

if (!in_array($status, $valid_statuses, true)) {
    $status = 'pending';
}

$userId = current_user_id();

$stmt = $pdo->prepare('INSERT INTO tasks (user_id, title, description, due_date, priority, status) VALUES (:user_id, :title, :description, :due_date, :priority, :status)');
$stmt->execute([
    ':user_id' => $userId,
    ':title' => $title,
    ':description' => $description !== '' ? $description : null,
    ':due_date' => $due_date,
    ':priority' => $priority,
    ':status' => $status,
]);

$_SESSION['flash_success'] = 'Task created successfully.';
redirect('/user/dashboard.php');
