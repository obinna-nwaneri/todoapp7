CREATE DATABASE IF NOT EXISTS `todoapp` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `todoapp`;

CREATE TABLE IF NOT EXISTS `tasks` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `due_date` DATE DEFAULT NULL,
  `status` ENUM('pending', 'completed') NOT NULL DEFAULT 'pending',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
