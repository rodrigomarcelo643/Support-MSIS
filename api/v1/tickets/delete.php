<?php
/**
 * MSIS Tickets API • Delete Ticket Endpoint
 * Path: api/v1/tickets/delete.php
 * Method: POST / DELETE
 */

require_once __DIR__ . '/../connection.php';
require_once __DIR__ . '/helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    http_response_code(405);
    echo json_encode([
        'status' => 'error',
        'message' => 'Method not allowed. Use POST or DELETE.'
    ]);
    exit;
}

ensure_ticket_tables_exist($conn);

$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true) ?: $_POST;

$ticketIdentifier = trim($data['id'] ?? $data['ticket_code'] ?? '');

if (empty($ticketIdentifier)) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'Ticket ID or code is required.'
    ]);
    exit;
}

// Find ticket
$findStmt = $conn->prepare("SELECT id, ticket_code FROM tickets WHERE ticket_code = ? OR id = ? LIMIT 1");
$findStmt->bind_param("ss", $ticketIdentifier, $ticketIdentifier);
$findStmt->execute();
$findRes = $findStmt->get_result();

if ($findRes->num_rows === 0) {
    http_response_code(404);
    echo json_encode([
        'status' => 'error',
        'message' => 'Ticket not found or already deleted.'
    ]);
    exit;
}

$ticket = $findRes->fetch_assoc();
$ticketId = (int)$ticket['id'];
$ticketCode = $ticket['ticket_code'];

// Clean up physical attachment files from disk
$projectRoot = dirname(__DIR__, 3);
$attStmt = $conn->prepare("SELECT stored_name, file_path FROM ticket_attachments WHERE ticket_id = ?");
$attStmt->bind_param("i", $ticketId);
$attStmt->execute();
$attRes = $attStmt->get_result();

while ($row = $attRes->fetch_assoc()) {
    $storedName = $row['stored_name'];
    $filePath = $row['file_path'];
    $fullPath = $projectRoot . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $filePath);
    if (file_exists($fullPath) && is_file($fullPath)) {
        @unlink($fullPath);
    }
}

// Delete from tickets table
$delStmt = $conn->prepare("DELETE FROM tickets WHERE id = ?");
$delStmt->bind_param("i", $ticketId);

if (!$delStmt->execute()) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Failed to delete ticket: ' . $delStmt->error
    ]);
    exit;
}

echo json_encode([
    'status' => 'success',
    'message' => "Ticket #$ticketCode deleted successfully.",
    'deletedTicketId' => $ticketCode,
]);
