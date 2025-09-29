<?php
/**
 * admin/tasks_delete.php
 * -----------------------
 * Allows administrators to delete any task via POST.
 */

require_once __DIR__ . '/../partials/guard/require_admin.php';
require_once __DIR__ . '/../helpers/csrf.php';
require_once __DIR__ . '/../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect('/admin/tasks_list.php');
}

if (!csrf_verify($_POST['csrf_token'] ?? null)) {
    $_SESSION['flash_error'] = 'Invalid form token, please try again.';
    redirect('/admin/tasks_list.php');
}

$id = isset($_POST['id']) ? (int) $_POST['id'] : 0;
if ($id <= 0) {
    $_SESSION['flash_error'] = 'Invalid task selected.';
    redirect('/admin/tasks_list.php');
}

$stmt = $pdo->prepare('DELETE FROM tasks WHERE id = :id');
$stmt->execute([':id' => $id]);

if ($stmt->rowCount() > 0) {
    $_SESSION['flash_success'] = 'Task deleted successfully.';
} else {
    $_SESSION['flash_error'] = 'Task not found or already removed.';
}

redirect('/admin/tasks_list.php');
