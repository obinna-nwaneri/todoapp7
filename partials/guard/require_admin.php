<?php
require_once __DIR__ . '/require_login.php';

if (!is_admin()) {
    set_flash('danger', 'Administrator access required.');
    redirect('/user/dashboard.php');
}
