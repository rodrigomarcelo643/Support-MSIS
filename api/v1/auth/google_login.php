<?php
/**
 * Google Authentication & Role Resolution Endpoint
 * Path: api/v1/auth/google_login.php
 * 
 * Verifies if the Google email exists in:
 * 1. users (Admin / Super Admin)
 * 2. faculties (Faculty)
 * 3. secretaries (Secretary)
 * 4. students (Student)
 * 
 * Returns detected role and user profile, or 403 Forbidden if not registered.
 */

require_once __DIR__ . '/../connection.php';

// Accept only POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'status' => 'error',
        'message' => 'Method not allowed. Use POST.'
    ]);
    exit;
}

// Parse JSON payload
$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);

$email = trim($data['email'] ?? '');
$googleName = trim($data['name'] ?? '');
$avatarUrl = trim($data['avatar_url'] ?? '');

if (empty($email)) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'Google account email is required.'
    ]);
    exit;
}

$normalizedEmail = strtolower($email);

/**
 * 1. Check `users` table (Admin only)
 */
$stmt = $conn->prepare("SELECT * FROM users WHERE LOWER(email) = ? LIMIT 1");
if ($stmt) {
    $stmt->bind_param("s", $normalizedEmail);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($row = $result->fetch_assoc()) {
        $role = !empty($row['role']) ? $row['role'] : 'Admin';
        $name = $row['name'] ?? trim(($row['first_name'] ?? '') . ' ' . ($row['last_name'] ?? '')) ?: $googleName ?: 'Administrator';
        
        $user = [
            'id' => (string)($row['id'] ?? 'usr_admin_' . uniqid()),
            'email' => $row['email'],
            'name' => $name,
            'role' => $role,
            'department' => $row['department'] ?? 'MSIS Administration',
            'avatar_url' => $avatarUrl ?: ($row['avatar_url'] ?? $row['profile_photo'] ?? null)
        ];

        echo json_encode([
            'status' => 'success',
            'message' => 'Authenticated successfully as Admin',
            'role' => $role,
            'user' => $user
        ]);
        exit;
    }
}

/**
 * 2. Check `faculties` table (Faculty)
 */
$stmt = $conn->prepare("SELECT * FROM faculties WHERE LOWER(email) = ? LIMIT 1");
if ($stmt) {
    $stmt->bind_param("s", $normalizedEmail);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($row = $result->fetch_assoc()) {
        $name = $row['name'] ?? trim(($row['first_name'] ?? '') . ' ' . ($row['last_name'] ?? '')) ?: $googleName ?: 'Faculty Member';
        
        $user = [
            'id' => (string)($row['id'] ?? 'usr_fac_' . uniqid()),
            'email' => $row['email'],
            'name' => $name,
            'role' => 'Faculty',
            'department' => $row['department'] ?? 'Academic • Faculty',
            'avatar_url' => $avatarUrl ?: ($row['avatar_url'] ?? $row['profile_photo'] ?? null)
        ];

        echo json_encode([
            'status' => 'success',
            'message' => 'Authenticated successfully as Faculty',
            'role' => 'Faculty',
            'user' => $user
        ]);
        exit;
    }
}

/**
 * 3. Check `secretaries` table (Secretary)
 */
$stmt = $conn->prepare("SELECT * FROM secretaries WHERE LOWER(email) = ? LIMIT 1");
if ($stmt) {
    $stmt->bind_param("s", $normalizedEmail);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($row = $result->fetch_assoc()) {
        $name = $row['name'] ?? trim(($row['first_name'] ?? '') . ' ' . ($row['last_name'] ?? '')) ?: $googleName ?: 'Secretary Staff';
        
        $user = [
            'id' => (string)($row['id'] ?? 'usr_sec_' . uniqid()),
            'email' => $row['email'],
            'name' => $name,
            'role' => 'Secretary',
            'department' => $row['department'] ?? 'Department • Secretary',
            'avatar_url' => $avatarUrl ?: ($row['avatar_url'] ?? $row['profile_photo'] ?? null)
        ];

        echo json_encode([
            'status' => 'success',
            'message' => 'Authenticated successfully as Secretary',
            'role' => 'Secretary',
            'user' => $user
        ]);
        exit;
    }
}

/**
 * 4. Check `students` table (Student)
 */
$stmt = $conn->prepare("SELECT * FROM students WHERE LOWER(email) = ? LIMIT 1");
if ($stmt) {
    $stmt->bind_param("s", $normalizedEmail);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($row = $result->fetch_assoc()) {
        $name = $row['name'] ?? trim(($row['first_name'] ?? '') . ' ' . ($row['last_name'] ?? '')) ?: $googleName ?: 'Student';
        $dept = $row['program'] ?? $row['course'] ?? $row['department'] ?? 'Student Portal';
        
        $user = [
            'id' => (string)($row['id'] ?? 'usr_std_' . uniqid()),
            'email' => $row['email'],
            'name' => $name,
            'role' => 'Student',
            'department' => $dept,
            'avatar_url' => $avatarUrl ?: ($row['avatar_url'] ?? $row['profile_photo'] ?? null)
        ];

        echo json_encode([
            'status' => 'success',
            'message' => 'Authenticated successfully as Student',
            'role' => 'Student',
            'user' => $user
        ]);
        exit;
    }
}

/**
 * 5. Not found in any role table -> Access Denied
 */
http_response_code(403);
echo json_encode([
    'status' => 'error',
    'message' => 'Error: Your email (' . htmlspecialchars($email) . ') is not registered in the institution.'
]);
exit;
