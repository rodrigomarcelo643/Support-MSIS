<?php
/**
 * MSIS Tickets API • Get Single Ticket Details Endpoint
 * Path: api/v1/tickets/get.php
 * Method: GET
 */

require_once __DIR__ . '/../connection.php';
require_once __DIR__ . '/helpers.php';

ensure_ticket_tables_exist($conn);

$ticketIdentifier = trim($_GET['id'] ?? $_GET['ticket_code'] ?? '');

if (empty($ticketIdentifier)) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'Ticket ID is required.'
    ]);
    exit;
}

$stmt = $conn->prepare("SELECT * FROM tickets WHERE ticket_code = ? OR id = ? LIMIT 1");
$stmt->bind_param("ss", $ticketIdentifier, $ticketIdentifier);
$stmt->execute();
$res = $stmt->get_result();

if ($res->num_rows === 0) {
    http_response_code(404);
    echo json_encode([
        'status' => 'error',
        'message' => 'Ticket not found.'
    ]);
    exit;
}

$ticket = $res->fetch_assoc();
$ticketId = (int)$ticket['id'];

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
        'storedName' => $a['stored_name'],
        'url' => $a['file_url'],
        'path' => $a['file_path'],
        'size' => (int)$a['file_size'],
        'isImage' => (bool)$a['is_image'],
    ];
}

// Fetch audit trail
$auditStmt = $conn->prepare("SELECT * FROM ticket_audit_logs WHERE ticket_id = ? ORDER BY created_at ASC");
$auditStmt->bind_param("i", $ticketId);
$auditStmt->execute();
$auditRes = $auditStmt->get_result();
$auditLogs = [];
while ($log = $auditRes->fetch_assoc()) {
    $auditLogs[] = [
        'id' => (int)$log['id'],
        'action' => $log['action'],
        'previousStatus' => $log['previous_status'],
        'newStatus' => $log['new_status'],
        'performedBy' => $log['performed_by_email'],
        'performedByRole' => $log['performed_by_role'],
        'notes' => $log['notes'],
        'createdAt' => $log['created_at'],
    ];
}

echo json_encode([
    'status' => 'success',
    'ticket' => format_ticket_record($ticket, $attachments),
    'auditLogs' => $auditLogs,
]);
