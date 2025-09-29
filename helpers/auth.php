<?php
/**
 * helpers/auth.php
 * -----------------
 * Contains reusable authentication helper functions for session state.
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

function is_logged_in(): bool
{
    return !empty($_SESSION['user_id']);
}

function is_admin(): bool
{
    return isset($_SESSION['role']) && $_SESSION['role'] === 'admin';
}

function current_user_id(): ?int
{
    return isset($_SESSION['user_id']) ? (int)$_SESSION['user_id'] : null;
}

function redirect(string $path): void
{
    header('Location: ' . $path);
    exit;
}
