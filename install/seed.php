<?php
require_once __DIR__ . '/../config/db.php';

function ensure_user(PDO $pdo, string $username, string $email, string $password, string $role): int
{
    $stmt = $pdo->prepare('SELECT id FROM users WHERE username = :username OR email = :email LIMIT 1');
    $stmt->execute([':username' => $username, ':email' => $email]);
    $user = $stmt->fetch();
    if ($user) {
        return (int)$user['id'];
    }

    $hash = password_hash($password, PASSWORD_DEFAULT);
    $insert = $pdo->prepare('INSERT INTO users (username, email, password, role) VALUES (:username, :email, :password, :role)');
    $insert->execute([
        ':username' => $username,
        ':email' => $email,
        ':password' => $hash,
        ':role' => $role,
    ]);
    return (int)$pdo->lastInsertId();
}

$adminId = ensure_user($pdo, 'admin', 'admin@example.com', 'admin', 'admin');
$userId = ensure_user($pdo, 'jane', 'jane@example.com', 'password', 'user');

$taskCheck = $pdo->prepare('SELECT COUNT(*) FROM tasks WHERE user_id = :user_id');
$taskCheck->execute([':user_id' => $userId]);
if ((int)$taskCheck->fetchColumn() === 0) {
    $taskInsert = $pdo->prepare('INSERT INTO tasks (user_id, title, description, due_date, priority, status) VALUES (:user_id, :title, :description, :due_date, :priority, :status)');
    $taskInsert->execute([
        ':user_id' => $userId,
        ':title' => 'Buy groceries',
        ':description' => 'Milk, eggs, bread, and fruit',
        ':due_date' => date('Y-m-d', strtotime('+2 days')),
        ':priority' => 'medium',
        ':status' => 'pending',
    ]);
    $taskInsert->execute([
        ':user_id' => $userId,
        ':title' => 'Prepare presentation',
        ':description' => 'Slides for Monday meeting',
        ':due_date' => date('Y-m-d', strtotime('+5 days')),
        ':priority' => 'high',
        ':status' => 'in_progress',
    ]);
}

echo "Seeding complete. Admin ID: {$adminId}, User ID: {$userId}" . PHP_EOL;
