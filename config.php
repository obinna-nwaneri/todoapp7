<?php

declare(strict_types=1);

const DB_HOST = 'localhost';
const DB_NAME = 'todoapp';
const DB_USER = 'root';
const DB_PASS = '';

/**
 * Create a shared PDO connection using configuration constants.
 */
function getPDO(): PDO
{
    static $pdo = null;

    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $dsn = sprintf('mysql:host=%s;dbname=%s;charset=utf8mb4', DB_HOST, DB_NAME);
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ];

    try {
        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
    } catch (PDOException $e) {
        http_response_code(500);
        echo '<h1>Database connection error</h1>';
        echo '<p>Please check your database configuration in <code>config.php</code>.';
        echo ' Error details: ' . htmlspecialchars($e->getMessage(), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') . '</p>';
        exit;
    }

    return $pdo;
}
