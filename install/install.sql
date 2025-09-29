-- install/install.sql
-- --------------------
-- Creates the todo_app database schema and seeds placeholder rows. Passwords
-- are finalized by running install/seed.php after importing this script.

CREATE DATABASE IF NOT EXISTS todo_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE todo_app;

DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(120) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('user','admin') NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    due_date DATE NULL,
    priority ENUM('low','medium','high') NOT NULL DEFAULT 'low',
    status ENUM('pending','in_progress','completed') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tasks_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO users (id, username, email, password, role) VALUES
(1, 'admin', 'admin@example.com', 'PLACEHOLDER_PASSWORD', 'admin'),
(2, 'jane', 'jane@example.com', 'PLACEHOLDER_PASSWORD', 'user')
ON DUPLICATE KEY UPDATE username = VALUES(username);

INSERT INTO tasks (id, user_id, title, description, due_date, priority, status) VALUES
(1, 2, 'Buy groceries', 'Milk, bread, and eggs for the week.', CURDATE(), 'medium', 'pending'),
(2, 2, 'Finish project report', 'Compile the final project summary and send to the manager.', DATE_ADD(CURDATE(), INTERVAL 3 DAY), 'high', 'in_progress')
ON DUPLICATE KEY UPDATE title = VALUES(title);
