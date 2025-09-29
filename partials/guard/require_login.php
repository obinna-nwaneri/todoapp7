<?php
/**
 * partials/guard/require_login.php
 * ---------------------------------
 * Ensures the current visitor is authenticated before accessing a page.
 */

require_once __DIR__ . '/../../helpers/auth.php';

if (!is_logged_in()) {
    $_SESSION['flash_error'] = 'Please login to access that page.';
    redirect('/auth/login.php');
}
