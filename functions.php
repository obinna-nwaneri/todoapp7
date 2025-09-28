<?php

declare(strict_types=1);

require_once __DIR__ . '/config.php';

/**
 * Retrieve all tasks ordered by creation date.
 *
 * @return array<int, array<string, mixed>>
 */
function fetchTasks(): array
{
    $pdo = getPDO();
    $stmt = $pdo->query('SELECT * FROM tasks ORDER BY created_at DESC');

    return $stmt->fetchAll();
}

/**
 * Insert a new task into the database.
 */
function createTask(string $title, string $description, ?string $dueDate): void
{
    $pdo = getPDO();
    $stmt = $pdo->prepare('INSERT INTO tasks (title, description, due_date) VALUES (:title, :description, :due_date)');
    $stmt->execute([
        'title' => $title,
        'description' => $description,
        'due_date' => $dueDate,
    ]);
}

/**
 * Update an existing task.
 */
function updateTask(int $id, string $title, string $description, ?string $dueDate, string $status): void
{
    $pdo = getPDO();
    $stmt = $pdo->prepare('UPDATE tasks SET title = :title, description = :description, due_date = :due_date, status = :status WHERE id = :id');
    $stmt->execute([
        'title' => $title,
        'description' => $description,
        'due_date' => $dueDate,
        'status' => $status,
        'id' => $id,
    ]);
}

/**
 * Delete a task by id.
 */
function deleteTask(int $id): void
{
    $pdo = getPDO();
    $stmt = $pdo->prepare('DELETE FROM tasks WHERE id = :id');
    $stmt->execute(['id' => $id]);
}

/**
 * Toggle the completion status of a task.
 */
function toggleTaskStatus(int $id): void
{
    $pdo = getPDO();
    $stmt = $pdo->prepare('UPDATE tasks SET status = IF(status = "completed", "pending", "completed") WHERE id = :id');
    $stmt->execute(['id' => $id]);
}

/**
 * Count tasks grouped by their status.
 *
 * @return array<string, int>
 */
function taskCountsByStatus(): array
{
    $pdo = getPDO();
    $stmt = $pdo->query('SELECT status, COUNT(*) AS total FROM tasks GROUP BY status');
    $rows = $stmt->fetchAll();

    $counts = ['pending' => 0, 'completed' => 0];
    foreach ($rows as $row) {
        $status = $row['status'];
        if (array_key_exists($status, $counts)) {
            $counts[$status] = (int) $row['total'];
        }
    }

    return $counts;
}
