<?php
require_once __DIR__ . '/../partials/guard/require_login.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/csrf.php';
require_once __DIR__ . '/../helpers/flash.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect('/user/dashboard.php');
}

$csrf_token = $_POST['csrf_token'] ?? null;
$taskId = (int)($_POST['id'] ?? 0);
$userId = current_user_id();

if (!verify_csrf_token($csrf_token)) {
    set_flash('danger', 'Invalid CSRF token.');
    redirect('/user/dashboard.php');
}

$stmt = $pdo->prepare('DELETE FROM tasks WHERE id = :id AND user_id = :user_id');
$stmt->execute([':id' => $taskId, ':user_id' => $userId]);

set_flash('success', 'Task deleted.');
redirect('/user/dashboard.php');
