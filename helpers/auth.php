<?php
// Authentication helper functions

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

/**
 * Determine if a user is currently logged in.
 */
function is_logged_in(): bool
{
    return isset($_SESSION['user_id']);
}

/**
 * Determine if the current user is an administrator.
 */
function is_admin(): bool
{
    return isset($_SESSION['role']) && $_SESSION['role'] === 'admin';
}

/**
 * Retrieve the current user ID.
 */
function current_user_id(): ?int
{
    return $_SESSION['user_id'] ?? null;
}

/**
 * Redirect helper that terminates script execution after sending headers.
 */
function redirect(string $path): void
{
    header('Location: ' . $path);
    exit;
}
