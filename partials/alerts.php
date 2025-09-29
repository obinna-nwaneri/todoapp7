<?php
/**
 * partials/alerts.php
 * --------------------
 * Displays simple Bootstrap alert messages using session-based flash storage.
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$alerts = [
    'flash_success' => 'success',
    'flash_error' => 'danger',
    'flash_info' => 'info',
];

foreach ($alerts as $key => $type) {
    if (!empty($_SESSION[$key])) {
        echo '<div class="alert alert-' . $type . ' alert-dismissible fade show" role="alert">';
        echo htmlspecialchars($_SESSION[$key]);
        echo '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>';
        echo '</div>';
        unset($_SESSION[$key]);
    }
}
