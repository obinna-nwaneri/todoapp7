<?php
require_once __DIR__ . '/../partials/guard/require_admin.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/csrf.php';
require_once __DIR__ . '/../helpers/flash.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect('/admin/tasks_list.php');
}

$csrf_token = $_POST['csrf_token'] ?? null;
$taskId = (int)($_POST['id'] ?? 0);

if (!verify_csrf_token($csrf_token)) {
    set_flash('danger', 'Invalid CSRF token.');
    redirect('/admin/tasks_list.php');
}

$delete = $pdo->prepare('DELETE FROM tasks WHERE id = :id');
$delete->execute([':id' => $taskId]);

set_flash('success', 'Task deleted.');
redirect('/admin/tasks_list.php');
