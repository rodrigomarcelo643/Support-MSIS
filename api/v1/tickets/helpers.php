<?php
/**
 * MSIS Tickets API • Common Helper Functions
 * Path: api/v1/tickets/helpers.php
 */

if (!defined('BASE_URL')) {
    define('BASE_URL', 'https://support.swu-som.com/');
}

/**
 * Returns the client's real IP address
 */
function get_client_ip(): string {
    if (!empty($_SERVER['HTTP_CF_CONNECTING_IP'])) {
        return $_SERVER['HTTP_CF_CONNECTING_IP'];
    }
    if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $ips = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
        return trim($ips[0]);
    }
    return $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
}

/**
 * Sanitize filename for safe filesystem storage
 */
function sanitize_filename(string $filename): string {
    $filename = preg_replace('/[^a-zA-Z0-9_\.-]/', '_', $filename);
    $filename = preg_replace('/_+/', '_', $filename);
    return trim($filename, '_');
}

/**
 * Ensures required ticket database tables exist in MySQL
 */
function ensure_ticket_tables_exist(mysqli $conn): void {
    static $checked = false;
    if ($checked) return;

    $checkTable = $conn->query("SHOW TABLES LIKE 'tickets'");
    if ($checkTable && $checkTable->num_rows > 0) {
        $checked = true;
        return;
    }

    // Create tickets table
    $conn->query("
        CREATE TABLE IF NOT EXISTS `tickets` (
          `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
          `ticket_code` VARCHAR(32) NOT NULL,
          `reporter_id` VARCHAR(64) NOT NULL,
          `reporter_email` VARCHAR(191) NOT NULL,
          `reporter_name` VARCHAR(150) NOT NULL,
          `reporter_role` ENUM('Student', 'Faculty', 'Secretary', 'Admin', 'Super Admin') NOT NULL DEFAULT 'Student',
          `department` VARCHAR(120) DEFAULT 'General',
          `subject` VARCHAR(255) NOT NULL,
          `description` TEXT NOT NULL,
          `status` ENUM('In Progress', 'Investigating', 'Resolved', 'Dispatched') NOT NULL DEFAULT 'In Progress',
          `priority` ENUM('Low', 'Medium', 'High', 'Critical') NOT NULL DEFAULT 'Medium',
          `assigned_technician_id` VARCHAR(64) DEFAULT NULL,
          `assigned_technician_name` VARCHAR(150) DEFAULT NULL,
          `support_message` TEXT DEFAULT NULL,
          `support_responded_by_id` VARCHAR(64) DEFAULT NULL,
          `support_responded_by_name` VARCHAR(150) DEFAULT NULL,
          `support_responded_at` DATETIME DEFAULT NULL,
          `technician_notes` TEXT DEFAULT NULL,
          `resolved_at` DATETIME DEFAULT NULL,
          `resolved_by_id` VARCHAR(64) DEFAULT NULL,
          `resolved_by_email` VARCHAR(191) DEFAULT NULL,
          `ip_address` VARCHAR(45) DEFAULT NULL,
          `user_agent` TEXT DEFAULT NULL,
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
    ");

    // Create ticket_attachments table
    $conn->query("
        CREATE TABLE IF NOT EXISTS `ticket_attachments` (
          `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
          `ticket_id` BIGINT UNSIGNED NOT NULL,
          `ticket_code` VARCHAR(32) NOT NULL,
          `original_name` VARCHAR(255) NOT NULL,
          `stored_name` VARCHAR(255) NOT NULL,
          `file_path` VARCHAR(500) NOT NULL,
          `file_url` VARCHAR(500) NOT NULL,
          `file_type` VARCHAR(100) NOT NULL,
          `file_size` BIGINT UNSIGNED NOT NULL,
          `is_image` TINYINT(1) NOT NULL DEFAULT 1,
          `uploaded_by_id` VARCHAR(64) NOT NULL,
          `uploaded_by_email` VARCHAR(191) NOT NULL,
          `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (`id`),
          KEY `idx_ticket_id` (`ticket_id`),
          KEY `idx_ticket_code` (`ticket_code`),
          KEY `idx_uploaded_by_email` (`uploaded_by_email`),
          CONSTRAINT `fk_ticket_attachments_ticket` 
            FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`) 
            ON DELETE CASCADE ON UPDATE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");

    // Create ticket_audit_logs table
    $conn->query("
        CREATE TABLE IF NOT EXISTS `ticket_audit_logs` (
          `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
          `ticket_id` BIGINT UNSIGNED NOT NULL,
          `action` VARCHAR(60) NOT NULL,
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
    ");

    $checked = true;
}

/**
 * Format relative time string e.g. "Just now", "15 mins ago", "2 hours ago"
 */
function format_relative_time(?string $datetime): string {
    if (!$datetime) return 'Just now';
    $time = strtotime($datetime);
    if (!$time) return 'Just now';
    $diff = time() - $time;

    if ($diff < 60) return 'Just now';
    if ($diff < 3600) {
        $mins = max(1, floor($diff / 60));
        return $mins . ' min' . ($mins > 1 ? 's' : '') . ' ago';
    }
    if ($diff < 86400) {
        $hours = floor($diff / 3600);
        return $hours . ' hour' . ($hours > 1 ? 's' : '') . ' ago';
    }
    if ($diff < 604800) {
        $days = floor($diff / 86400);
        return $days . ' day' . ($days > 1 ? 's' : '') . ' ago';
    }
    return date('M d, Y', $time);
}

/**
 * Format ticket record for frontend consumption
 */
function format_ticket_record(array $row, array $attachments = []): array {
    return [
        'id' => $row['ticket_code'],
        'numericId' => (int)$row['id'],
        'category' => $row['reporter_role'] === 'Super Admin' ? 'Admin' : $row['reporter_role'],
        'department' => $row['department'] ?: 'General',
        'subject' => $row['subject'],
        'description' => $row['description'],
        'status' => $row['status'],
        'priority' => $row['priority'] ?? 'Medium',
        'attachmentsCount' => isset($row['attachments_count']) ? (int)$row['attachments_count'] : count($attachments),
        'attachments' => $attachments,
        'submittedAt' => format_relative_time($row['created_at']),
        'createdAt' => $row['created_at'],
        'updatedAt' => $row['updated_at'] ?? $row['created_at'],
        'reporterId' => $row['reporter_id'],
        'reporterName' => $row['reporter_name'],
        'reporterEmail' => $row['reporter_email'],
        'supportMessage' => $row['support_message'] ?? null,
        'supportRespondedByName' => $row['support_responded_by_name'] ?? null,
        'supportRespondedAt' => $row['support_responded_at'] ?? null,
    ];
}
