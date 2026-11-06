<?php
/**
 * Public Authentication Configuration Endpoint
 * Safely exposes non-secret frontend configs (Google Client ID, Redirect URI)
 * dynamically loaded from Hostinger's .env file.
 * Path: api/v1/auth/config.php
 */

require_once __DIR__ . '/../connection.php';

header("Content-Type: application/json; charset=UTF-8");

echo json_encode([
    'status' => 'success',
    'google_client_id' => GOOGLE_CLIENT_ID,
    'google_redirect_uri' => GOOGLE_REDIRECT_URI
]);
exit;
