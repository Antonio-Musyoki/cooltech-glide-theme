<?php
/**
 * Admin Authentication API
 * Handles login, logout, and token verification
 */

require_once __DIR__ . '/../config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'POST') {
    jsonResponse(['error' => 'Method not allowed'], 405);
}

$data = getJsonInput();
if (!$data) {
    jsonResponse(['error' => 'Invalid JSON input'], 400);
}

$action = $data['action'] ?? '';

switch ($action) {
    case 'login':
        handleLogin($data);
        break;
    case 'logout':
        handleLogout($data);
        break;
    case 'verify':
        handleVerify($data);
        break;
    default:
        jsonResponse(['error' => 'Invalid action. Use: login, logout, or verify'], 400);
}

/**
 * Handle user login
 */
function handleLogin(array $data): void {
    $username = trim($data['username'] ?? '');
    $password = $data['password'] ?? '';
    
    if (empty($username) || empty($password)) {
        jsonResponse(['error' => 'Username and password are required'], 400);
    }
    
    // Rate limiting check (simple implementation)
    // In production, use a more robust solution
    
    $db = getDB();
    
    // Clean expired sessions periodically
    cleanExpiredSessions();
    
    $stmt = $db->prepare("
        SELECT id, username, password_hash, name, email, role 
        FROM admin_users 
        WHERE username = ? AND is_active = 1
    ");
    $stmt->execute([$username]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        // Use same error message to prevent username enumeration
        jsonResponse(['error' => 'Invalid username or password'], 401);
    }
    
    if (!password_verify($password, $user['password_hash'])) {
        jsonResponse(['error' => 'Invalid username or password'], 401);
    }
    
    // Generate secure session token
    $token = bin2hex(random_bytes(32));
    $expires = date('Y-m-d H:i:s', strtotime('+24 hours'));
    
    // Store session in database
    $stmt = $db->prepare("
        INSERT INTO admin_sessions (user_id, token, expires_at, ip_address, user_agent) 
        VALUES (?, ?, ?, ?, ?)
    ");
    $stmt->execute([
        $user['id'],
        $token,
        $expires,
        $_SERVER['REMOTE_ADDR'] ?? '',
        substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 255)
    ]);
    
    // Update last login timestamp
    $stmt = $db->prepare("UPDATE admin_users SET last_login = NOW() WHERE id = ?");
    $stmt->execute([$user['id']]);
    
    // Remove password hash from response
    unset($user['password_hash']);
    $user['token'] = $token;
    $user['expires_at'] = $expires;
    
    jsonResponse([
        'success' => true,
        'user' => $user
    ]);
}

/**
 * Handle user logout
 */
function handleLogout(array $data): void {
    $token = $data['token'] ?? getBearerToken();
    
    if (empty($token)) {
        jsonResponse(['success' => true, 'message' => 'Already logged out']);
    }
    
    $db = getDB();
    $stmt = $db->prepare("DELETE FROM admin_sessions WHERE token = ?");
    $stmt->execute([$token]);
    
    jsonResponse(['success' => true, 'message' => 'Logged out successfully']);
}

/**
 * Handle token verification
 */
function handleVerify(array $data): void {
    $token = $data['token'] ?? getBearerToken();
    
    if (empty($token)) {
        jsonResponse(['error' => 'Token required'], 401);
    }
    
    $db = getDB();
    $stmt = $db->prepare("
        SELECT u.id, u.username, u.name, u.email, u.role, s.expires_at
        FROM admin_users u 
        JOIN admin_sessions s ON u.id = s.user_id 
        WHERE s.token = ? AND s.expires_at > NOW() AND u.is_active = 1
    ");
    $stmt->execute([$token]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        jsonResponse(['error' => 'Invalid or expired token'], 401);
    }
    
    $user['token'] = $token;
    
    jsonResponse([
        'success' => true,
        'user' => $user
    ]);
}
