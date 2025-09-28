<?php
require_once __DIR__ . '/../partials/guard/require_admin.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/csrf.php';
require_once __DIR__ . '/../helpers/flash.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect('/admin/users_list.php');
}

$csrf_token = $_POST['csrf_token'] ?? null;
$userId = (int)($_POST['id'] ?? 0);

if (!verify_csrf_token($csrf_token)) {
    set_flash('danger', 'Invalid CSRF token.');
    redirect('/admin/users_list.php');
}

if ($userId === $_SESSION['user_id']) {
    set_flash('danger', 'You cannot delete your own account.');
    redirect('/admin/users_list.php');
}

$delete = $pdo->prepare('DELETE FROM users WHERE id = :id');
$delete->execute([':id' => $userId]);

set_flash('success', 'User deleted.');
redirect('/admin/users_list.php');
