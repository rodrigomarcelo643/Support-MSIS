<?php
/**
 * Vanilla PHP Database Connection - MSIS API v1
 * Configured for Hostinger deployment (Base URL: https://support.swu-som.com/)
 */

// Error handling settings for production API
ini_set("display_errors", 0);
error_reporting(E_ALL);

// Base application URL
if (!defined('BASE_URL')) {
    define('BASE_URL', 'https://support.swu-som.com/');
}

// Cross-Origin Resource Sharing (CORS) Headers
$allowed_origins = [
    'https://support.swu-som.com',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'http://localhost'
];

$http_origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($http_origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: " . $http_origin);
} else {
    header("Access-Control-Allow-Origin: *");
}

header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS request
if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Database Credentials (Hostinger MySQL)
$host = "127.0.0.1"; // 127.0.0.1 avoids Unix socket errors on Hostinger
$dbname = "u886220933_msis";
$username = "u886220933_msis";
$password = "Msis12345";

// Establish mysqli connection
$conn = new mysqli($host, $username, $password, $dbname);

// Verify connection
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Database connection failed: " . $conn->connect_error
    ]);
    exit;
}

// Set character set to utf8mb4 for unicode and emojis support
$conn->set_charset("utf8mb4");

// Set timezone to Philippines (Asia/Manila)
date_default_timezone_set('Asia/Manila');
$conn->query("SET time_zone = '+08:00'");
