-- ============================================================
-- SmartFinance Personal Finance Tracker - MySQL Database Schema
-- Database Name: smartfinance
-- ============================================================

CREATE DATABASE IF NOT EXISTS `smartfinance` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `smartfinance`;

-- ------------------------------------------------------------
-- 1. Users Table
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(150),
  `currency` VARCHAR(10) DEFAULT 'LKR',
  `theme` VARCHAR(20) DEFAULT 'dark',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- 2. Categories Table
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT DEFAULT NULL,
  `name` VARCHAR(100) NOT NULL,
  `type` ENUM('income', 'expense') NOT NULL,
  `icon` VARCHAR(50),
  `color` VARCHAR(20),
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- 3. Transactions Table
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `transactions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `category_id` INT DEFAULT NULL,
  `type` ENUM('income', 'expense') NOT NULL,
  `amount` DECIMAL(15, 2) NOT NULL,
  `description` TEXT,
  `date` VARCHAR(10) NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- 4. Budgets Table
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `budgets` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `category_id` INT NOT NULL,
  `amount` DECIMAL(15, 2) NOT NULL,
  `month` VARCHAR(7) NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- 5. Savings Goals Table (NEW FEATURE)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `goals` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `target_amount` DECIMAL(15, 2) NOT NULL,
  `saved_amount` DECIMAL(15, 2) DEFAULT 0.00,
  `target_date` VARCHAR(10),
  `category` VARCHAR(50) DEFAULT 'General',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- Seed Default Categories (System Level where user_id IS NULL)
-- ------------------------------------------------------------
INSERT IGNORE INTO `categories` (`id`, `user_id`, `name`, `type`, `icon`, `color`) VALUES
(1, NULL, 'Salary', 'income', '💰', '#4CAF50'),
(2, NULL, 'Freelance', 'income', '💻', '#2196F3'),
(3, NULL, 'Investment', 'income', '📈', '#9C27B0'),
(4, NULL, 'Gift', 'income', '🎁', '#FF9800'),
(5, NULL, 'Other Income', 'income', '💵', '#607D8B'),
(6, NULL, 'Food & Dining', 'expense', '🍔', '#F44336'),
(7, NULL, 'Transport', 'expense', '🚗', '#FF5722'),
(8, NULL, 'Housing', 'expense', '🏠', '#795548'),
(9, NULL, 'Utilities', 'expense', '💡', '#FFC107'),
(10, NULL, 'Healthcare', 'expense', '🏥', '#E91E63'),
(11, NULL, 'Education', 'expense', '📚', '#3F51B5'),
(12, NULL, 'Entertainment', 'expense', '🎬', '#00BCD4'),
(13, NULL, 'Shopping', 'expense', '🛒', '#8BC34A'),
(14, NULL, 'Other Expense', 'expense', '📦', '#9E9E9E');
