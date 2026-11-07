<?php
/**
 * MSIS Tickets API • Update Ticket Status & Support Response
 * Path: api/v1/tickets/update_status.php
 * Method: POST / PATCH
 */

require_once __DIR__ . '/../connection.php';
require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/mailer.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'PATCH') {
    http_response_code(405);
    echo json_encode([
        'status' => 'error',
        'message' => 'Method not allowed. Use POST or PATCH.'
    ]);
    exit;
}

ensure_ticket_tables_exist($conn);

$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true) ?: $_POST;

$ticketIdentifier = trim($data['id'] ?? $data['ticket_code'] ?? '');
$newStatus = trim($data['status'] ?? '');
$supportMessage = isset($data['support_message']) ? trim($data['support_message']) : null;
$adminId = trim($data['admin_id'] ?? 'usr_super_admin');
$adminName = trim($data['admin_name'] ?? 'Super Admin');
$adminEmail = trim($data['admin_email'] ?? 'admin@msis.edu');

if (empty($ticketIdentifier)) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'Ticket ID or code is required.'
    ]);
    exit;
}

$validStatuses = ['In Progress', 'Investigating', 'Dispatched', 'Resolved', 'Closed'];
if (!empty($newStatus) && !in_array($newStatus, $validStatuses)) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'Invalid status. Must be one of: ' . implode(', ', $validStatuses)
    ]);
    exit;
}

// Find existing ticket
$findStmt = $conn->prepare("SELECT * FROM tickets WHERE ticket_code = ? OR id = ? LIMIT 1");
$findStmt->bind_param("ss", $ticketIdentifier, $ticketIdentifier);
$findStmt->execute();
$findRes = $findStmt->get_result();

if ($findRes->num_rows === 0) {
    http_response_code(404);
    echo json_encode([
        'status' => 'error',
        'message' => 'Ticket not found.'
    ]);
    exit;
}

$ticket = $findRes->fetch_assoc();
$ticketId = (int)$ticket['id'];
$ticketCode = $ticket['ticket_code'];
$previousStatus = $ticket['status'];
$statusToSet = !empty($newStatus) ? $newStatus : $previousStatus;

// Build update fields
$updates = [];
$types = '';
$params = [];

$updates[] = "status = ?";
$types .= 's';
$params[] = $statusToSet;

if (in_array($statusToSet, ['Resolved', 'Closed']) && !in_array($previousStatus, ['Resolved', 'Closed'])) {
    $updates[] = "resolved_at = NOW()";
    $updates[] = "resolved_by_id = ?";
    $updates[] = "resolved_by_email = ?";
    $types .= 'ss';
    $params[] = $adminId;
    $params[] = $adminEmail;
}

if ($supportMessage !== null) {
    $updates[] = "support_message = ?";
    $updates[] = "support_responded_by_id = ?";
    $updates[] = "support_responded_by_name = ?";
    $updates[] = "support_responded_at = NOW()";
    $types .= 'sss';
    $params[] = $supportMessage;
    $params[] = $adminId;
    $params[] = $adminName;
}

$types .= 'i';
$params[] = $ticketId;

$updateSql = "UPDATE tickets SET " . implode(', ', $updates) . " WHERE id = ?";
$updateStmt = $conn->prepare($updateSql);
if (!$updateStmt) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Update statement failed: ' . $conn->error
    ]);
    exit;
}

$updateStmt->bind_param($types, ...$params);
$updateStmt->execute();

// Log status change or response in audit logs
$clientIp = get_client_ip();
$auditAction = ($previousStatus !== $statusToSet) ? 'STATUS_CHANGED' : 'SUPPORT_MESSAGE_ADDED';
$auditNotes = "Status updated from '$previousStatus' to '$statusToSet'.";
if ($supportMessage) {
    $auditNotes .= " Support message attached.";
}

$auditStmt = $conn->prepare("
    INSERT INTO ticket_audit_logs (
        ticket_id, action, previous_status, new_status, performed_by_id, performed_by_email, performed_by_role, notes, ip_address, created_at
    ) VALUES (
        ?, ?, ?, ?, ?, ?, 'Super Admin', ?, ?, NOW()
    )
");
if ($auditStmt) {
    $auditStmt->bind_param(
        "isssssss",
        $ticketId,
        $auditAction,
        $previousStatus,
        $statusToSet,
        $adminId,
        $adminEmail,
        $auditNotes,
        $clientIp
    );
    $auditStmt->execute();
}

// Fetch refreshed ticket
$refreshedStmt = $conn->prepare("SELECT * FROM tickets WHERE id = ?");
$refreshedStmt->bind_param("i", $ticketId);
$refreshedStmt->execute();
$updatedTicket = $refreshedStmt->get_result()->fetch_assoc();

// Fetch attachments
$attStmt = $conn->prepare("SELECT * FROM ticket_attachments WHERE ticket_id = ? ORDER BY id ASC");
$attStmt->bind_param("i", $ticketId);
$attStmt->execute();
$attRes = $attStmt->get_result();
$attachments = [];
while ($a = $attRes->fetch_assoc()) {
    $attachments[] = [
        'id' => (int)$a['id'],
        'name' => $a['original_name'],
        'url' => $a['file_url'],
        'size' => (int)$a['file_size'],
        'isImage' => (bool)$a['is_image'],
    ];
}

// 7. Dispatch Step-by-Step Progress Notification Email via root PHPMailer
$emailNotification = send_ticket_progress_notification(
    $updatedTicket,
    $statusToSet,
    $supportMessage,
    [
        'id' => $adminId,
        'name' => $adminName,
        'email' => $adminEmail
    ]
);

// Log email dispatch result in ticket audit logs
if (isset($emailNotification['sent'])) {
    $mailAuditAction = $emailNotification['sent'] ? 'EMAIL_NOTIFICATION_SENT' : 'EMAIL_NOTIFICATION_FAILED';
    $mailNotes = $emailNotification['sent']
        ? "Progress update email dispatched to {$updatedTicket['reporter_email']} for level '{$statusToSet}'."
        : "Failed to dispatch progress email: " . ($emailNotification['error'] ?? $emailNotification['reason'] ?? 'Unknown mail error');

    $mailAuditStmt = $conn->prepare("
        INSERT INTO ticket_audit_logs (
            ticket_id, action, previous_status, new_status, performed_by_id, performed_by_email, performed_by_role, notes, ip_address, created_at
        ) VALUES (
            ?, ?, ?, ?, ?, ?, 'System Mailer', ?, ?, NOW()
        )
    ");
    if ($mailAuditStmt) {
        $mailAuditStmt->bind_param(
            "isssssss",
            $ticketId,
            $mailAuditAction,
            $previousStatus,
            $statusToSet,
            $adminId,
            $adminEmail,
            $mailNotes,
            $clientIp
        );
        $mailAuditStmt->execute();
    }
}

echo json_encode([
    'status' => 'success',
    'message' => 'Ticket updated successfully.',
    'ticket' => format_ticket_record($updatedTicket, $attachments),
    'email_notification' => $emailNotification
]);
