<?php
// Database configuration
// Adjust these values to match your MySQL credentials.
$DB_HOST = getenv('DB_HOST') ?: '127.0.0.1';
$DB_NAME = getenv('DB_NAME') ?: 'todoapp7';
$DB_USER = getenv('DB_USER') ?: 'root';
$DB_PASS = getenv('DB_PASS') ?: '';

try {
    $dsn = sprintf('mysql:host=%s;dbname=%s;charset=utf8mb4', $DB_HOST, $DB_NAME);
    $pdo = new PDO($dsn, $DB_USER, $DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    die('Database connection failed: ' . htmlspecialchars($e->getMessage()));
}

session_start();

/**
 * Ensure that at least one administrator account exists.
 */
function ensureDefaultAdmin(PDO $pdo): void
{
    $stmt = $pdo->prepare('SELECT COUNT(*) FROM users WHERE is_admin = 1');
    try {
        $stmt->execute();
        $count = (int) $stmt->fetchColumn();
    } catch (PDOException $e) {
        // Tables might not be created yet; silently return.
        return;
    }

    if ($count === 0) {
        $passwordHash = password_hash('admin', PASSWORD_DEFAULT);
        $insert = $pdo->prepare('INSERT INTO users (username, email, password_hash, is_admin) VALUES (:username, :email, :password_hash, 1)');
        $insert->execute([
            ':username' => 'admin',
            ':email' => 'admin@example.com',
            ':password_hash' => $passwordHash,
        ]);
    }
}

ensureDefaultAdmin($pdo);
