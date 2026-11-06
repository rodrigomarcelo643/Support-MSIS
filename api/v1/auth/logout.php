<?php
/**
 * Logout Endpoint
 * Path: api/v1/auth/logout.php
 */

require_once __DIR__ . '/../connection.php';

echo json_encode([
    'status' => 'success',
    'message' => 'Session logged out successfully'
]);
