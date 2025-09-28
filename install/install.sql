CREATE DATABASE IF NOT EXISTS todo_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE todo_app;

DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('user','admin') NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO users (username, email, password, role) VALUES
('admin', 'admin@example.com', '$2y$12$A7vBONxkqrIeNoeydthGLuJVtlD/nhiCHZgWudCejQjsx4XNS47yK', 'admin'),
('jane', 'jane@example.com', '$2y$12$MrsyVNeCPBfaBySDX2Wv0Oif3eq3vUP8hVyVThqzDR2L6saJUnij6', 'user');

INSERT INTO tasks (user_id, title, description, due_date, priority, status) VALUES
((SELECT id FROM users WHERE username = 'jane'), 'Buy groceries', 'Milk, eggs, bread, and fruit', DATE_ADD(CURDATE(), INTERVAL 2 DAY), 'medium', 'pending'),
((SELECT id FROM users WHERE username = 'jane'), 'Prepare presentation', 'Slides for Monday meeting', DATE_ADD(CURDATE(), INTERVAL 5 DAY), 'high', 'in_progress');
