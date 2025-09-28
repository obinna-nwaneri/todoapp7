-- Database schema and seed data for To-Do App
CREATE DATABASE IF NOT EXISTS todo_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE todo_app;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('user','admin') NOT NULL DEFAULT 'user'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('pending','completed') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tasks_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO users (username, email, password, role) VALUES
('admin', 'admin@example.com', '$2y$12$Uk5rLyL3v.KZSr7FgG.eOO/VvOHG.tQ4gDPmoQHku.VI7lr2sK4ge', 'admin')
ON DUPLICATE KEY UPDATE email = VALUES(email);

INSERT INTO users (username, email, password, role) VALUES
('johndoe', 'john@example.com', '$2y$12$hCYSV56z7DWZsMeOjvJXVOmRUITA26VWP/vqvVEC/dMSRNMIWJhVu', 'user')
ON DUPLICATE KEY UPDATE email = VALUES(email);

INSERT INTO tasks (user_id, title, description, status)
SELECT id, 'Buy groceries', 'Milk, bread, eggs, and cheese', 'pending'
FROM users
WHERE username = 'johndoe'
  AND NOT EXISTS (
      SELECT 1 FROM tasks WHERE user_id = users.id AND title = 'Buy groceries'
  );

INSERT INTO tasks (user_id, title, description, status)
SELECT id, 'Workout', '30-minute run and strength training', 'completed'
FROM users
WHERE username = 'johndoe'
  AND NOT EXISTS (
      SELECT 1 FROM tasks WHERE user_id = users.id AND title = 'Workout'
  );
