<?php
/**
 * MSIS Tickets API • List Tickets Endpoint
 * Path: api/v1/tickets/list.php
 * Method: GET
 */

require_once __DIR__ . '/../connection.php';
require_once __DIR__ . '/helpers.php';

// Accept GET or POST (for filters)
ensure_ticket_tables_exist($conn);

$role = trim($_GET['role'] ?? '');
$email = trim($_GET['email'] ?? '');
$status = trim($_GET['status'] ?? '');
$search = trim($_GET['search'] ?? '');
$limit = max(1, min(200, (int)($_GET['limit'] ?? 100)));
$page = max(1, (int)($_GET['page'] ?? 1));
$offset = ($page - 1) * $limit;

// Build WHERE conditions safely
$whereClauses = [];
$types = '';
$params = [];

if (!empty($role) && $role !== 'All' && $role !== 'Super Admin') {
    $whereClauses[] = "t.reporter_role = ?";
    $types .= 's';
    $params[] = $role;
}

if (!empty($email)) {
    $whereClauses[] = "LOWER(t.reporter_email) = LOWER(?)";
    $types .= 's';
    $params[] = $email;
}

if (!empty($status) && $status !== 'All') {
    $whereClauses[] = "t.status = ?";
    $types .= 's';
    $params[] = $status;
}

if (!empty($search)) {
    $whereClauses[] = "(t.ticket_code LIKE ? OR t.subject LIKE ? OR t.description LIKE ? OR t.department LIKE ? OR t.reporter_name LIKE ?)";
    $like = '%' . $search . '%';
    $types .= 'sssss';
    $params[] = $like;
    $params[] = $like;
    $params[] = $like;
    $params[] = $like;
    $params[] = $like;
}

$whereSql = !empty($whereClauses) ? 'WHERE ' . implode(' AND ', $whereClauses) : '';

// Count total
$countSql = "SELECT COUNT(*) as total FROM tickets t $whereSql";
$countStmt = $conn->prepare($countSql);
if ($countStmt && !empty($types)) {
    $countStmt->bind_param($types, ...$params);
}
if ($countStmt) {
    $countStmt->execute();
    $totalCount = (int)$countStmt->get_result()->fetch_assoc()['total'];
} else {
    $totalCount = 0;
}

// Fetch tickets with attachment counts
$sql = "
    SELECT 
        t.*,
        COUNT(a.id) as attachments_count
    FROM tickets t
    LEFT JOIN ticket_attachments a ON a.ticket_id = t.id
    $whereSql
    GROUP BY t.id
    ORDER BY t.created_at DESC
    LIMIT ? OFFSET ?
";

$types .= 'ii';
$params[] = $limit;
$params[] = $offset;

$stmt = $conn->prepare($sql);
if (!$stmt) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Query preparation failed: ' . $conn->error
    ]);
    exit;
}

$stmt->bind_param($types, ...$params);
$stmt->execute();
$result = $stmt->get_result();

$tickets = [];
$ticketIds = [];
$rows = [];

while ($row = $result->fetch_assoc()) {
    $rows[] = $row;
    $ticketIds[] = (int)$row['id'];
}

// Pre-fetch attachments for these tickets
$attachmentsByTicket = [];
if (!empty($ticketIds)) {
    $inClause = implode(',', $ticketIds);
    $attResult = $conn->query("
        SELECT id, ticket_id, original_name, stored_name, file_url, file_size, is_image, created_at 
        FROM ticket_attachments 
        WHERE ticket_id IN ($inClause)
        ORDER BY id ASC
    ");
    if ($attResult) {
        while ($att = $attResult->fetch_assoc()) {
            $tId = (int)$att['ticket_id'];
            if (!isset($attachmentsByTicket[$tId])) {
                $attachmentsByTicket[$tId] = [];
            }
            $attachmentsByTicket[$tId][] = [
                'id' => (int)$att['id'],
                'name' => $att['original_name'],
                'storedName' => $att['stored_name'],
                'url' => $att['file_url'],
                'size' => (int)$att['file_size'],
                'isImage' => (bool)$att['is_image'],
            ];
        }
    }
}

foreach ($rows as $row) {
    $tId = (int)$row['id'];
    $ticketAttachments = $attachmentsByTicket[$tId] ?? [];
    $tickets[] = format_ticket_record($row, $ticketAttachments);
}

// Compute role counts for badges
$roleCountsRes = $conn->query("
    SELECT reporter_role, COUNT(*) as count 
    FROM tickets 
    GROUP BY reporter_role
");
$counts = [
    'total' => 0,
    'student' => 0,
    'faculty' => 0,
    'secretary' => 0,
    'admin' => 0,
];

if ($roleCountsRes) {
    while ($r = $roleCountsRes->fetch_assoc()) {
        $c = (int)$r['count'];
        $counts['total'] += $c;
        $roleKey = strtolower($r['reporter_role']);
        if (isset($counts[$roleKey])) {
            $counts[$roleKey] = $c;
        }
    }
}

echo json_encode([
    'status' => 'success',
    'total' => $totalCount,
    'page' => $page,
    'limit' => $limit,
    'counts' => $counts,
    'tickets' => $tickets,
]);
