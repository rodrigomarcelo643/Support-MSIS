-- ==============================================================================
-- MSIS Support • Default Super Admin Seed Script
-- Medical Student Information System (MSIS)
-- Southwestern University PHINMA • School of Medicine
-- ==============================================================================
-- Table: it_support_ticket_user
-- Role: Super Admin (Developer of the system to monitor tickets, update progress, etc.)
-- ==============================================================================

SET NAMES utf8mb4;

-- Ensure it_support_ticket_user table exists
CREATE TABLE IF NOT EXISTS `it_support_ticket_user` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(150) NOT NULL COMMENT 'Full name of administrator / developer',
  `email` VARCHAR(191) NOT NULL COMMENT 'Unique institutional or Google email',
  `password` VARCHAR(255) NOT NULL COMMENT 'Bcrypt-hashed password for authentication',
  `role` ENUM('Super Admin', 'Admin') NOT NULL DEFAULT 'Super Admin' COMMENT 'Security role authorization tier',
  `department` VARCHAR(120) NOT NULL DEFAULT 'MSIS Development & IT Systems' COMMENT 'Designated unit or department',
  `avatar_url` VARCHAR(500) DEFAULT NULL COMMENT 'Profile photo or avatar image URL',
  `status` ENUM('active', 'inactive', 'suspended') NOT NULL DEFAULT 'active',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_it_support_user_email` (`email`),
  KEY `idx_it_support_user_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ON DUPLICATE KEY UPDATE
  `name` = VALUES(`name`),
  `password` = VALUES(`password`),
  `role` = VALUES(`role`),
  `department` = VALUES(`department`),
  `status` = VALUES(`status`);
