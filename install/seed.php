<?php
/**
 * install/seed.php
 * -----------------
 * Populates the database with default admin/user accounts and sample tasks.
 * Run this script once after importing install.sql.
 */

require_once __DIR__ . '/../config/db.php';

$adminPassword = password_hash('admin', PASSWORD_DEFAULT);
$userPassword = password_hash('password', PASSWORD_DEFAULT);

try {
    $pdo->beginTransaction();

    $insertUser = $pdo->prepare('INSERT INTO users (id, username, email, password, role) VALUES (:id, :username, :email, :password, :role)
        ON DUPLICATE KEY UPDATE username = VALUES(username), email = VALUES(email), password = VALUES(password), role = VALUES(role)');

    $insertUser->execute([
        ':id' => 1,
        ':username' => 'admin',
        ':email' => 'admin@example.com',
        ':password' => $adminPassword,
        ':role' => 'admin',
    ]);

    $insertUser->execute([
        ':id' => 2,
        ':username' => 'jane',
        ':email' => 'jane@example.com',
        ':password' => $userPassword,
        ':role' => 'user',
    ]);

    $fetchJane = $pdo->prepare('SELECT id FROM users WHERE username = :username LIMIT 1');
    $fetchJane->execute([':username' => 'jane']);
    $janeId = (int) $fetchJane->fetchColumn();

    if ($janeId > 0) {
        $insertTask = $pdo->prepare('INSERT INTO tasks (id, user_id, title, description, due_date, priority, status) VALUES (:id, :user_id, :title, :description, :due_date, :priority, :status)
            ON DUPLICATE KEY UPDATE user_id = VALUES(user_id), title = VALUES(title), description = VALUES(description), due_date = VALUES(due_date), priority = VALUES(priority), status = VALUES(status)');

        $insertTask->execute([
            ':id' => 1,
            ':user_id' => $janeId,
            ':title' => 'Buy groceries',
            ':description' => 'Milk, bread, and eggs for the week.',
            ':due_date' => date('Y-m-d'),
            ':priority' => 'medium',
            ':status' => 'pending',
        ]);

        $insertTask->execute([
            ':id' => 2,
            ':user_id' => $janeId,
            ':title' => 'Finish project report',
            ':description' => 'Compile the final project summary and send to the manager.',
            ':due_date' => date('Y-m-d', strtotime('+3 days')),
            ':priority' => 'high',
            ':status' => 'in_progress',
        ]);
    }

    $pdo->commit();
    echo "Seed data inserted successfully.";
} catch (Exception $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo 'Error seeding database: ' . htmlspecialchars($e->getMessage());
}
