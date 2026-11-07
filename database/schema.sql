-- ==============================================================================
-- MSIS Support • Database Schema
-- Medical Systems & Information Services (MSIS)
-- Southwestern University PHINMA • School of Medicine
-- ==============================================================================
-- Character Set: utf8mb4 (Supports complete Unicode, international names & emojis)
-- Timezone: +08:00 (Asia/Manila)
-- ==============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------------------------
-- 1. Table: tickets
-- Purpose: Primary record for all reported technical defects, bugs, and requests.
-- Includes full tracking telemetry of the authenticated reporter (ID, email, name, role).
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tickets` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `ticket_code` VARCHAR(32) NOT NULL COMMENT 'Formatted reference code e.g. TK-83002',
  
  -- Reporter Telemetry & Audit Tracking
  `reporter_id` VARCHAR(64) NOT NULL COMMENT 'Unique user ID of the logged-in reporter',
  `reporter_email` VARCHAR(191) NOT NULL COMMENT 'Institutional email (e.g. @swu.phinmaed.com)',
  `reporter_name` VARCHAR(150) NOT NULL COMMENT 'Full name of the logged-in user at submission',
  `reporter_role` ENUM('Student', 'Faculty', 'Secretary', 'Admin', 'Super Admin') NOT NULL DEFAULT 'Student',
  `department` VARCHAR(120) DEFAULT 'General' COMMENT 'Academic/Administrative department or unit',
  
  -- Issue Details
  `subject` VARCHAR(255) NOT NULL COMMENT 'Concise summary of the reported issue',
  `description` TEXT NOT NULL COMMENT 'Detailed reproduction steps, errors, and context',
  
  -- Status & Triage Management (Only Super Admin can mutate status & reply)
  `status` ENUM('In Progress', 'Investigating', 'Dispatched', 'Resolved', 'Closed') NOT NULL DEFAULT 'In Progress',
  `priority` ENUM('Low', 'Medium', 'High', 'Critical') NOT NULL DEFAULT 'Medium',
  `assigned_technician_id` VARCHAR(64) DEFAULT NULL,
  `assigned_technician_name` VARCHAR(150) DEFAULT NULL,
  
  -- Optional Super Admin / Support Message Response
  `support_message` TEXT DEFAULT NULL COMMENT 'Optional response message from Super Admin or Support visible to reporter',
  `support_responded_by_id` VARCHAR(64) DEFAULT NULL COMMENT 'Super Admin ID who provided the response',
  `support_responded_by_name` VARCHAR(150) DEFAULT NULL COMMENT 'Super Admin Name who provided the response',
  `support_responded_at` DATETIME DEFAULT NULL COMMENT 'Timestamp when Super Admin replied',
  `technician_notes` TEXT DEFAULT NULL COMMENT 'Internal technical diagnostics',
  
  -- Resolution Audit
  `resolved_at` DATETIME DEFAULT NULL,
  `resolved_by_id` VARCHAR(64) DEFAULT NULL,
  `resolved_by_email` VARCHAR(191) DEFAULT NULL,
  
  -- Device & Network Telemetry
  `ip_address` VARCHAR(45) DEFAULT NULL COMMENT 'Client IP address (IPv4 or IPv6)',
  `user_agent` TEXT DEFAULT NULL COMMENT 'Client browser and device user agent string',
  
  -- Timestamps
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_ticket_code` (`ticket_code`),
  KEY `idx_reporter_email` (`reporter_email`),
  KEY `idx_reporter_id` (`reporter_id`),
  KEY `idx_reporter_role` (`reporter_role`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 2. Table: ticket_attachments
-- Purpose: Records all uploaded image screenshots, error logs, and diagnostic files.
-- Directly links each file to its ticket and records its physical path and fetchable URL.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `ticket_attachments` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `ticket_id` BIGINT UNSIGNED NOT NULL COMMENT 'Foreign key to tickets.id',
  `ticket_code` VARCHAR(32) NOT NULL COMMENT 'Direct reference code e.g. TK-83002',
  
  -- File Metadata
  `original_name` VARCHAR(255) NOT NULL COMMENT 'Original file name uploaded by user',
  `stored_name` VARCHAR(255) NOT NULL COMMENT 'Sanitized unique name stored on disk',
  `file_path` VARCHAR(500) NOT NULL COMMENT 'Relative storage path: uploads/tickets/...',
  `file_url` VARCHAR(500) NOT NULL COMMENT 'Direct fetchable URL for <img> tags and downloads',
  `file_type` VARCHAR(100) NOT NULL COMMENT 'MIME type e.g. image/png, image/jpeg, application/pdf',
  `file_size` BIGINT UNSIGNED NOT NULL COMMENT 'File size in bytes',
  `is_image` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1 if image (renderable directly in UI), 0 otherwise',
  
  -- Upload Audit Tracking
  `uploaded_by_id` VARCHAR(64) NOT NULL COMMENT 'User ID who uploaded the file',
  `uploaded_by_email` VARCHAR(191) NOT NULL COMMENT 'Email of uploader',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  KEY `idx_ticket_id` (`ticket_id`),
  KEY `idx_ticket_code` (`ticket_code`),
  KEY `idx_uploaded_by_email` (`uploaded_by_email`),
  CONSTRAINT `fk_ticket_attachments_ticket` 
    FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 3. Table: ticket_audit_logs
-- Purpose: Comprehensive audit trail of every status transition, assignment, or update.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `ticket_audit_logs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `ticket_id` BIGINT UNSIGNED NOT NULL,
  `action` VARCHAR(60) NOT NULL COMMENT 'e.g. TICKET_SUBMITTED, STATUS_CHANGED, COMMENT_ADDED',
  `previous_status` VARCHAR(32) DEFAULT NULL,
  `new_status` VARCHAR(32) DEFAULT NULL,
  `performed_by_id` VARCHAR(64) NOT NULL,
  `performed_by_email` VARCHAR(191) NOT NULL,
  `performed_by_role` VARCHAR(32) NOT NULL,
  `notes` TEXT DEFAULT NULL,
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  KEY `idx_audit_ticket_id` (`ticket_id`),
  KEY `idx_audit_created_at` (`created_at`),
  CONSTRAINT `fk_ticket_audit_ticket` 
    FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 4. Table: it_support_ticket_user
-- Purpose: Holds IT support users, system developers, and administrators.
-- Contains default Super Admin credentials and institutional profiles for monitoring
-- submitted tickets, triaging status, updating progress, and replying to users.
-- ------------------------------------------------------------------------------
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

SET FOREIGN_KEY_CHECKS = 1;
