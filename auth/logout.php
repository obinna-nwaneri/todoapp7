<?php
/**
 * auth/logout.php
 * ----------------
 * Destroys the current session and logs the user out of the application.
 */

require_once __DIR__ . '/../helpers/auth.php';

session_unset();
session_destroy();

header('Location: /auth/login.php');
exit;
