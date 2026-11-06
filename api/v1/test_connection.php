<?php
/**
 * Test Database Connection Endpoint - MSIS API v1
 * Access via: https://support.swu-som.com/api/v1/test_connection.php
 */

require_once __DIR__ . '/connection.php';

echo json_encode([
    "status" => "success",
    "message" => "MSIS Database connected successfully",
    "host" => $host,
    "database" => $dbname,
    "server_time" => date('Y-m-d H:i:s'),
    "timezone" => date_default_timezone_get(),
    "base_url" => BASE_URL
], JSON_PRETTY_PRINT);
