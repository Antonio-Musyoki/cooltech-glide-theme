<?php
/**
 * CoolTech Refrigeration API Configuration
 * PHP 8.1+ Compatible - cPanel Hosting Ready
 * Update these values for your cPanel hosting environment
 */

// Enable error reporting for development (disable in production)
error_reporting(E_ALL);
ini_set('display_errors', '0'); // Don't display errors to users
ini_set('log_errors', '1'); // Log errors instead

// Set default timezone
date_default_timezone_set('Africa/Nairobi');

// Database configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'cooltec1_RCT2026');
define('DB_USER', 'cooltec1_anto');
define('DB_PASS', 'A007134858u#');

// Email configuration
define('ADMIN_EMAIL', 'info@cooltechrefrigeration.co.ke');

// Set JSON content type and CORS headers
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Max-Age: 86400');

// Handle OPTIONS preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Set custom error handler to return JSON errors
set_error_handler(function($severity, $message, $file, $line) {
    if (!(error_reporting() & $severity)) {
        return false;
    }
    error_log("PHP Error: {$message} in {$file} on line {$line}");
    throw new ErrorException($message, 0, $severity, $file, $line);
});

// Set exception handler to return JSON errors
set_exception_handler(function($exception) {
    error_log("Uncaught Exception: " . $exception->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Internal server error'
    ]);
    exit();
});

/**
 * Get database connection using PDO
 * @return PDO Database connection instance
 */
function getDB(): PDO {
    static $pdo = null;
    
    if ($pdo === null) {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
            ];
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            error_log("Database connection failed: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'Database connection failed'
            ]);
            exit();
        }
    }
    
    return $pdo;
}

/**
 * Send JSON response and exit
 * @param array $data Response data
 * @param int $code HTTP status code
 */
function jsonResponse(array $data, int $code = 200): void {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit();
}

/**
 * Sanitize string input for database/output
 * @param string $input Input string
 * @param int $maxLength Maximum allowed length
 * @return string Sanitized string
 */
function sanitize(string $input, int $maxLength = 255): string {
    $input = trim($input);
    $input = htmlspecialchars($input, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    return mb_substr($input, 0, $maxLength, 'UTF-8');
}

/**
 * Alias for sanitize function (backward compatibility)
 * @param string $input Input string
 * @param int $maxLength Maximum allowed length
 * @return string Sanitized string
 */
function sanitizeString(string $input, int $maxLength = 255): string {
    return sanitize($input, $maxLength);
}

/**
 * Validate email format
 * @param string $email Email address
 * @return bool Is valid email
 */
function isValidEmail(string $email): bool {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

/**
 * Get request body as JSON
 * @return array|null Decoded JSON data
 */
function getJsonInput(): ?array {
    $input = file_get_contents('php://input');
    if (empty($input)) {
        return null;
    }
    $data = json_decode($input, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        return null;
    }
    return $data;
}

/**
 * Get Authorization Bearer token from headers
 * @return string|null Token or null if not present
 */
function getBearerToken(): ?string {
    $headers = getallheaders();
    // Handle case-insensitive header names
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    
    if (empty($authHeader)) {
        return null;
    }
    
    if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        return trim($matches[1]);
    }
    
    return null;
}

/**
 * Verify admin authentication
 * @return array User data if authenticated
 */
function verifyAdminAuth(): array {
    $token = getBearerToken();
    
    if (empty($token)) {
        jsonResponse(['error' => 'Unauthorized - No token provided'], 401);
    }
    
    $db = getDB();
    $stmt = $db->prepare("
        SELECT u.id, u.username, u.name, u.email, u.role
        FROM admin_users u 
        JOIN admin_sessions s ON u.id = s.user_id 
        WHERE s.token = ? AND s.expires_at > NOW() AND u.is_active = 1
    ");
    $stmt->execute([$token]);
    $user = $stmt->fetch();
    
    if (!$user) {
        jsonResponse(['error' => 'Unauthorized - Invalid or expired token'], 401);
    }
    
    return $user;
}

/**
 * Clean expired sessions from database
 */
function cleanExpiredSessions(): void {
    try {
        $db = getDB();
        $db->exec("DELETE FROM admin_sessions WHERE expires_at < NOW()");
    } catch (Exception $e) {
        error_log("Failed to clean expired sessions: " . $e->getMessage());
    }
}
