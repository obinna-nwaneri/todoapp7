<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../../helpers/auth.php';
require_once __DIR__ . '/../../helpers/flash.php';

if (!is_logged_in()) {
    set_flash('danger', 'You must be logged in to access that page.');
    redirect('/auth/login.php');
}
