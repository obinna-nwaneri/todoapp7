<?php
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../config/db.php';

ensure_role('user');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: /user/dashboard.php');
    exit;
}

$taskId = (int)($_POST['id'] ?? 0);

if ($taskId <= 0) {
    header('Location: /user/dashboard.php?error=' . urlencode('Invalid task selected.'));
    exit;
}

$deleteStmt = $pdo->prepare('DELETE FROM tasks WHERE id = :id AND user_id = :user_id');
$deleteStmt->execute([
    ':id' => $taskId,
    ':user_id' => $_SESSION['user_id'],
]);

if ($deleteStmt->rowCount() === 0) {
    header('Location: /user/dashboard.php?error=' . urlencode('Unable to delete the task.'));
    exit;
}

header('Location: /user/dashboard.php?message=' . urlencode('Task deleted successfully.'));
exit;
