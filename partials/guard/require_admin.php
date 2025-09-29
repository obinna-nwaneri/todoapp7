<?php
/**
 * partials/guard/require_admin.php
 * ---------------------------------
 * Ensures the current visitor is authenticated as an administrator.
 */

require_once __DIR__ . '/require_login.php';

if (!is_admin()) {
    $_SESSION['flash_error'] = 'You are not authorized to access that page.';
    redirect('/user/dashboard.php');
}
