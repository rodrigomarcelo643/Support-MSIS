<?php
/**
 * Vanilla PHP Database Connection - MSIS API v1
 * Configured for Hostinger deployment (Base URL: https://support.swu-som.com/)
 */

// Restrict direct browser/public access - only permit inclusion by other API scripts
if (isset($_SERVER['SCRIPT_FILENAME']) && realpath(__FILE__) === realpath($_SERVER['SCRIPT_FILENAME'])) {
    http_response_code(403);
    header("Content-Type: application/json; charset=UTF-8");
    echo json_encode([
        "status" => "error",
        "message" => "Direct access prohibited"
    ]);
    exit;
}

// Error handling settings for production API
ini_set("display_errors", 0);
error_reporting(E_ALL);

// Base application URL
if (!defined('BASE_URL')) {
    define('BASE_URL', 'https://support.swu-som.com/');
}

// -------------------------------------------------------------
// Load Root Environment Variables (.env)
// Targeted to fetch from the root public_html directory
// -------------------------------------------------------------
$docRoot = !empty($_SERVER['DOCUMENT_ROOT']) ? rtrim($_SERVER['DOCUMENT_ROOT'], '/\\') : null;
$envPaths = array_values(array_unique(array_filter([
    $docRoot ? $docRoot . '/.env' : null,              // public_html/.env (Hostinger webroot)
    $docRoot ? dirname($docRoot) . '/.env' : null,     // domain root/.env (one level above public_html)
    dirname(__DIR__, 2) . '/.env',                     // public_html/.env (relative to api/v1/)
    dirname(__DIR__, 3) . '/.env',                     // Domain root (if api is 2 levels deep)
    dirname(__DIR__) . '/.env',                        // api/.env
    __DIR__ . '/.env'                                  // api/v1/.env
])));

$envConfig = [];
foreach ($envPaths as $envPath) {
    if (file_exists($envPath) && ($lines = @file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES)) !== false) {
        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line) || strpos($line, '#') === 0) continue;
            if (strpos($line, '=') !== false) {
                list($key, $val) = explode('=', $line, 2);
                $key = trim($key);
                $val = trim($val);
                $val = trim($val, "\"'");
                // Remove inline comments
                if (strpos($val, '#') !== false && strpos($line, '"') === false && strpos($line, "'") === false) {
                    $val = trim(explode('#', $val)[0]);
                }
                $envConfig[$key] = $val;
                if (!isset($_ENV[$key])) $_ENV[$key] = $val;
                if (!isset($_SERVER[$key])) $_SERVER[$key] = $val;
            }
        }
        break;
    }
}

// Google Integration Credentials (Loaded from root .env or server environment)
$googleClientId = $envConfig['VITE_GOOGLE_CLIENT_ID']
    ?? $envConfig['GOOGLE_CLIENT_ID']
    ?? getenv('VITE_GOOGLE_CLIENT_ID')
    ?? getenv('GOOGLE_CLIENT_ID')
    ?? '';

$googleClientSecret = $envConfig['GOOGLE_CLIENT_SECRET'] 
    ?? $envConfig['VITE_GOOGLE_CLIENT_SECRET']
    ?? getenv('GOOGLE_CLIENT_SECRET') 
    ?? '';

$googleRedirectUri = $envConfig['VITE_GOOGLE_REDIRECT_URI']
    ?? $envConfig['GOOGLE_REDIRECT_URI']
    ?? getenv('VITE_GOOGLE_REDIRECT_URI')
    ?? getenv('GOOGLE_REDIRECT_URI')
    ?? 'https://support.swu-som.com/auth/google/callback';

if (!defined('GOOGLE_CLIENT_ID')) {
    define('GOOGLE_CLIENT_ID', $googleClientId);
}
if (!defined('GOOGLE_CLIENT_SECRET')) {
    define('GOOGLE_CLIENT_SECRET', $googleClientSecret);
}
if (!defined('GOOGLE_REDIRECT_URI')) {
    define('GOOGLE_REDIRECT_URI', $googleRedirectUri);
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

// Database Credentials (Fetched dynamically from root public_html .env using VITE_DB_*)
$host = $envConfig['VITE_DB_HOST']
    ?? $envConfig['DB_HOST']
    ?? getenv('VITE_DB_HOST')
    ?? getenv('DB_HOST')
    ?? '127.0.0.1'; // 127.0.0.1 avoids Unix socket resolution issues

$dbname = $envConfig['VITE_DB_DATABASE']
    ?? $envConfig['DB_DATABASE']
    ?? $envConfig['DB_NAME']
    ?? getenv('VITE_DB_DATABASE')
    ?? getenv('DB_DATABASE')
    ?? '';

$username = $envConfig['VITE_DB_USERNAME']
    ?? $envConfig['DB_USERNAME']
    ?? $envConfig['DB_USER']
    ?? getenv('VITE_DB_USERNAME')
    ?? getenv('DB_USERNAME')
    ?? '';

$password = $envConfig['VITE_DB_PASSWORD']
    ?? $envConfig['DB_PASSWORD']
    ?? $envConfig['DB_PASS']
    ?? getenv('VITE_DB_PASSWORD')
    ?? getenv('DB_PASSWORD')
    ?? '';

// Validate that database credentials exist in .env
if (empty($dbname) || empty($username)) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Database configuration error: VITE_DB_DATABASE and VITE_DB_USERNAME are required in the root public_html .env file."
    ]);
    exit;
}

// Establish mysqli connection with safe exception handling
try {
    mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
    $conn = new mysqli($host, $username, $password, $dbname);
    
    // Set character set to utf8mb4 for unicode and emojis support
    $conn->set_charset("utf8mb4");

    // Set timezone to Philippines (Asia/Manila)
    date_default_timezone_set('Asia/Manila');
    @$conn->query("SET time_zone = '+08:00'");
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Database connection failed: " . $e->getMessage()
    ]);
    exit;
}
