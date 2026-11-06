<?php
/**
 * MSIS Tickets API • Setup Tables & Healthcheck
 * Path: api/v1/tickets/setup.php
 */

require_once __DIR__ . '/../connection.php';
require_once __DIR__ . '/helpers.php';

try {
    ensure_ticket_tables_exist($conn);

    // Verify tables
    $tables = [];
    $res = $conn->query("SHOW TABLES LIKE 'ticket%'");
    while ($row = $res->fetch_array()) {
        $tables[] = $row[0];
    }

    $ticketsCount = 0;
    if (in_array('tickets', $tables)) {
        $countRes = $conn->query("SELECT COUNT(*) FROM tickets");
        $ticketsCount = (int)$countRes->fetch_row()[0];
    }

    echo json_encode([
        'status' => 'success',
        'message' => 'Ticket database tables initialized and verified successfully.',
        'tables_found' => $tables,
        'existing_tickets_count' => $ticketsCount,
        'upload_directory' => 'uploads/tickets',
        'upload_dir_writable' => is_writable(dirname(__DIR__, 3) . '/uploads/tickets'),
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Table setup error: ' . $e->getMessage()
    ]);
}
