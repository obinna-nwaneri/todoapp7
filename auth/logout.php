<?php
session_start();
require_once __DIR__ . '/../helpers/csrf.php';
require_once __DIR__ . '/../helpers/flash.php';
require_once __DIR__ . '/../helpers/auth.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $csrf_token = $_POST['csrf_token'] ?? null;
    if (!verify_csrf_token($csrf_token)) {
        set_flash('danger', 'Invalid CSRF token.');
        redirect('/auth/login.php');
    }
}

$_SESSION = [];
session_destroy();
set_flash('success', 'You have been logged out.');
redirect('/auth/login.php');
