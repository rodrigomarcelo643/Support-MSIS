<?php
/**
 * MSIS Tickets API • Create / Report Ticket Endpoint
 * Path: api/v1/tickets/create.php
 * Method: POST (multipart/form-data or application/json)
 */

require_once __DIR__ . '/../connection.php';
require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/mailer.php';

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'status' => 'error',
        'message' => 'Method not allowed. Use POST.'
    ]);
    exit;
}

// Ensure database tables exist
ensure_ticket_tables_exist($conn);

// 1. Parse Input Data (supports multipart/form-data or JSON)
$contentType = $_SERVER['CONTENT_TYPE'] ?? '';
$isJson = strpos($contentType, 'application/json') !== false;

if ($isJson) {
    $rawInput = file_get_contents('php://input');
    $data = json_decode($rawInput, true) ?: [];
} else {
    $data = $_POST;
}

$subject = trim($data['subject'] ?? '');
$description = trim($data['description'] ?? '');
$department = trim($data['department'] ?? 'MSIS Department');
$reporterRole = trim($data['reporter_role'] ?? $data['category'] ?? 'Student');
$reporterId = trim($data['reporter_id'] ?? '');
$reporterEmail = trim($data['reporter_email'] ?? '');
$reporterName = trim($data['reporter_name'] ?? '');
$priority = trim($data['priority'] ?? 'Medium');

// Normalize role
$allowedRoles = ['Student', 'Faculty', 'Secretary', 'Admin', 'Super Admin'];
if (!in_array($reporterRole, $allowedRoles)) {
    $reporterRole = 'Student';
}

// Fallbacks for reporter identity
if (empty($reporterId)) {
    $reporterId = 'usr_' . substr(md5($reporterEmail ?: uniqid('', true)), 0, 12);
}
if (empty($reporterEmail)) {
    $reporterEmail = strtolower($reporterRole) . '@msis.edu';
}
if (empty($reporterName)) {
    $reporterName = 'MSIS ' . $reporterRole;
}

// Validation
if (empty($subject)) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'Subject is required.'
    ]);
    exit;
}

if (empty($description)) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'Description is required.'
    ]);
    exit;
}

// 2. Generate Unique Ticket Code (e.g. TK-83015)
$ticketCode = '';
for ($i = 0; $i < 5; $i++) {
    $candidateCode = 'TK-' . rand(10000, 99999);
    $checkStmt = $conn->prepare("SELECT id FROM tickets WHERE ticket_code = ? LIMIT 1");
    $checkStmt->bind_param("s", $candidateCode);
    $checkStmt->execute();
    $checkRes = $checkStmt->get_result();
    if ($checkRes->num_rows === 0) {
        $ticketCode = $candidateCode;
        break;
    }
}
if (empty($ticketCode)) {
    $ticketCode = 'TK-' . time();
}

$clientIp = get_client_ip();
$userAgent = $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown';

// 3. Insert into `tickets` table
$stmt = $conn->prepare("
    INSERT INTO tickets (
        ticket_code, reporter_id, reporter_email, reporter_name, reporter_role,
        department, subject, description, status, priority, ip_address, user_agent, created_at
    ) VALUES (
        ?, ?, ?, ?, ?,
        ?, ?, ?, 'In Progress', ?, ?, ?, NOW()
    )
");

if (!$stmt) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Failed to prepare ticket insertion: ' . $conn->error
    ]);
    exit;
}

$stmt->bind_param(
    "sssssssssss",
    $ticketCode,
    $reporterId,
    $reporterEmail,
    $reporterName,
    $reporterRole,
    $department,
    $subject,
    $description,
    $priority,
    $clientIp,
    $userAgent
);

if (!$stmt->execute()) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Failed to save ticket: ' . $stmt->error
    ]);
    exit;
}

$ticketId = $stmt->insert_id;

// 4. Handle File Uploads (Images, Screenshots, Documents)
$savedAttachments = [];
$projectRoot = dirname(__DIR__, 3); // c:\xampp\htdocs\SupportMSIS
$uploadDir = $projectRoot . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'tickets';

if (!is_dir($uploadDir)) {
    @mkdir($uploadDir, 0755, true);
}

// Determine Host URL for public fetching
$protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https://' : 'http://';
$host = $_SERVER['HTTP_HOST'] ?? 'localhost';
$baseUrl = defined('BASE_URL') ? rtrim(BASE_URL, '/') : ($protocol . $host);

// Process $_FILES uploads (multipart/form-data)
$filesToProcess = [];

if (!empty($_FILES)) {
    foreach ($_FILES as $key => $fileData) {
        if (is_array($fileData['name'])) {
            // Multiple files array e.g. files[]
            $count = count($fileData['name']);
            for ($idx = 0; $idx < $count; $idx++) {
                if ($fileData['error'][$idx] === UPLOAD_ERR_OK) {
                    $filesToProcess[] = [
                        'name' => $fileData['name'][$idx],
                        'tmp_name' => $fileData['tmp_name'][$idx],
                        'size' => $fileData['size'][$idx],
                        'type' => $fileData['type'][$idx],
                    ];
                }
            }
        } else {
            // Single file
            if ($fileData['error'] === UPLOAD_ERR_OK) {
                $filesToProcess[] = [
                    'name' => $fileData['name'],
                    'tmp_name' => $fileData['tmp_name'],
                    'size' => $fileData['size'],
                    'type' => $fileData['type'],
                ];
            }
        }
    }
}

// Also process base64 files if submitted via JSON
if (!empty($data['base64_files']) && is_array($data['base64_files'])) {
    foreach ($data['base64_files'] as $b64) {
        $name = $b64['name'] ?? ('attachment_' . uniqid() . '.png');
        $rawB64 = $b64['data'] ?? '';
        if (strpos($rawB64, 'base64,') !== false) {
            $rawB64 = explode('base64,', $rawB64)[1];
        }
        $decoded = base64_decode($rawB64);
        if ($decoded !== false) {
            $tmpPath = tempnam(sys_get_temp_dir(), 'msis_');
            file_put_contents($tmpPath, $decoded);
            $filesToProcess[] = [
                'name' => $name,
                'tmp_name' => $tmpPath,
                'size' => strlen($decoded),
                'type' => $b64['type'] ?? 'image/png',
                'is_temp' => true
            ];
        }
    }
}

// Save each file and record in `ticket_attachments`
foreach ($filesToProcess as $file) {
    $origName = sanitize_filename($file['name']);
    $ext = strtolower(pathinfo($origName, PATHINFO_EXTENSION)) ?: 'dat';
    
    // Allowed file types
    $allowedExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'txt', 'log', 'csv'];
    if (!in_array($ext, $allowedExts)) {
        continue; // Skip disallowed extensions
    }

    $storedName = strtolower($ticketCode) . '_' . time() . '_' . rand(100, 999) . '.' . $ext;
    $targetPath = $uploadDir . DIRECTORY_SEPARATOR . $storedName;
    
    $success = false;
    if (!empty($file['is_temp'])) {
        $success = @rename($file['tmp_name'], $targetPath);
        if (!$success && file_exists($file['tmp_name'])) {
            $success = @copy($file['tmp_name'], $targetPath);
            @unlink($file['tmp_name']);
        }
    } else {
        $success = @move_uploaded_file($file['tmp_name'], $targetPath);
    }

    if ($success) {
        $relativePath = 'uploads/tickets/' . $storedName;
        // Direct fetchable image URL
        $fileUrl = $baseUrl . '/' . $relativePath;
        $isImage = in_array($ext, ['jpg', 'jpeg', 'png', 'gif', 'webp']) ? 1 : 0;
        $fileSize = (int)$file['size'];
        $fileMime = $file['type'] ?: mime_content_type($targetPath) ?: 'application/octet-stream';

        $attStmt = $conn->prepare("
            INSERT INTO ticket_attachments (
                ticket_id, ticket_code, original_name, stored_name, file_path, file_url,
                file_type, file_size, is_image, uploaded_by_id, uploaded_by_email, created_at
            ) VALUES (
                ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?, NOW()
            )
        ");

        if ($attStmt) {
            $attStmt->bind_param(
                "issssssisss",
                $ticketId,
                $ticketCode,
                $origName,
                $storedName,
                $relativePath,
                $fileUrl,
                $fileMime,
                $fileSize,
                $isImage,
                $reporterId,
                $reporterEmail
            );
            $attStmt->execute();

            $savedAttachments[] = [
                'id' => $attStmt->insert_id,
                'name' => $origName,
                'storedName' => $storedName,
                'url' => $fileUrl,
                'path' => $relativePath,
                'size' => $fileSize,
                'isImage' => (bool)$isImage,
            ];
        }
    }
}

// 5. Add Entry into `ticket_audit_logs`
$auditAction = 'TICKET_SUBMITTED';
$auditNotes = 'Ticket created with ' . count($savedAttachments) . ' attachment(s).';
$auditStmt = $conn->prepare("
    INSERT INTO ticket_audit_logs (
        ticket_id, action, new_status, performed_by_id, performed_by_email, performed_by_role, notes, ip_address, created_at
    ) VALUES (
        ?, ?, 'In Progress', ?, ?, ?, ?, ?, NOW()
    )
");
if ($auditStmt) {
    $auditStmt->bind_param(
        "issssss",
        $ticketId,
        $auditAction,
        $reporterId,
        $reporterEmail,
        $reporterRole,
        $auditNotes,
        $clientIp
    );
    $auditStmt->execute();
}

// 6. Dispatch Level 1 (Intake) Confirmation Email via root PHPMailer
$emailNotification = send_ticket_progress_notification(
    [
        'id' => $ticketId,
        'ticket_code' => $ticketCode,
        'subject' => $subject,
        'description' => $description,
        'department' => $department,
        'reporter_role' => $reporterRole,
        'reporter_name' => $reporterName,
        'reporter_email' => $reporterEmail,
    ],
    'In Progress',
    null,
    [
        'name' => 'MSIS Intake System'
    ]
);

// 7. Return Clean JSON Response
$formattedTicket = [
    'id' => $ticketCode,
    'numericId' => $ticketId,
    'category' => $reporterRole === 'Super Admin' ? 'Admin' : $reporterRole,
    'department' => $department,
    'subject' => $subject,
    'description' => $description,
    'status' => 'In Progress',
    'priority' => $priority,
    'attachmentsCount' => count($savedAttachments),
    'attachments' => $savedAttachments,
    'submittedAt' => 'Just now',
    'createdAt' => date('Y-m-d H:i:s'),
    'reporterId' => $reporterId,
    'reporterName' => $reporterName,
    'reporterEmail' => $reporterEmail,
    'supportMessage' => null,
];

http_response_code(201);
echo json_encode([
    'status' => 'success',
    'message' => 'Ticket filed successfully.',
    'ticket' => $formattedTicket,
    'email_notification' => $emailNotification
]);
