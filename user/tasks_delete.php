<?php
/**
 * user/tasks_delete.php
 * ----------------------
 * Deletes a user's own task when requested via POST.
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

$stmt = $pdo->prepare('DELETE FROM tasks WHERE id = :id AND user_id = :user_id');
$stmt->execute([
    ':id' => $id,
    ':user_id' => current_user_id(),
]);

if ($stmt->rowCount() > 0) {
    $_SESSION['flash_success'] = 'Task deleted successfully.';
} else {
    $_SESSION['flash_error'] = 'Task not found or access denied.';
}

redirect('/user/dashboard.php');
