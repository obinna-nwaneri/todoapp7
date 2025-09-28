<?php
// Common authentication helper functions
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

function ensure_logged_in() {
    if (empty($_SESSION['user_id'])) {
        header('Location: /auth/login.php');
        exit;
    }
}

function ensure_role($role) {
    ensure_logged_in();
    if (empty($_SESSION['role']) || $_SESSION['role'] !== $role) {
        header('Location: /auth/login.php');
        exit;
    }
}

function sanitize_output($value) {
    return htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
}
