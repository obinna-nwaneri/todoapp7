<?php
/**
 * admin/users_delete.php
 * -----------------------
 * Handles deleting a user and their associated tasks from the system.
 */

require_once __DIR__ . '/../partials/guard/require_admin.php';
require_once __DIR__ . '/../helpers/csrf.php';
require_once __DIR__ . '/../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect('/admin/users_list.php');
}

if (!csrf_verify($_POST['csrf_token'] ?? null)) {
    $_SESSION['flash_error'] = 'Invalid form token, please try again.';
    redirect('/admin/users_list.php');
}

$id = isset($_POST['id']) ? (int) $_POST['id'] : 0;
if ($id <= 0) {
    $_SESSION['flash_error'] = 'Invalid user selected.';
    redirect('/admin/users_list.php');
}

if ($id === $_SESSION['user_id']) {
    $_SESSION['flash_error'] = 'You cannot delete your own account.';
    redirect('/admin/users_list.php');
}

$stmt = $pdo->prepare('DELETE FROM users WHERE id = :id');
$stmt->execute([':id' => $id]);

if ($stmt->rowCount() > 0) {
    $_SESSION['flash_success'] = 'User deleted successfully.';
} else {
    $_SESSION['flash_error'] = 'User not found or already removed.';
}

redirect('/admin/users_list.php');
