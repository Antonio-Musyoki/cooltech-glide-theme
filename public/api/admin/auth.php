<?php
require_once '../config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $action = $data['action'] ?? '';
    
    if ($action === 'login') {
        $username = sanitize($data['username'] ?? '');
        $password = $data['password'] ?? '';
        
        if (empty($username) || empty($password)) {
            jsonResponse(['error' => 'Username and password are required'], 400);
        }
        
        $db = getDB();
        $stmt = $db->prepare("SELECT id, username, password_hash, name, email FROM admin_users WHERE username = ? AND is_active = 1");
        $stmt->execute([$username]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($user && password_verify($password, $user['password_hash'])) {
            // Generate session token
            $token = bin2hex(random_bytes(32));
            $expires = date('Y-m-d H:i:s', strtotime('+24 hours'));
            
            $stmt = $db->prepare("INSERT INTO admin_sessions (user_id, token, expires_at) VALUES (?, ?, ?)");
            $stmt->execute([$user['id'], $token, $expires]);
            
            // Update last login
            $stmt = $db->prepare("UPDATE admin_users SET last_login = NOW() WHERE id = ?");
            $stmt->execute([$user['id']]);
            
            unset($user['password_hash']);
            $user['token'] = $token;
            
            jsonResponse(['user' => $user]);
        } else {
            jsonResponse(['error' => 'Invalid username or password'], 401);
        }
    } elseif ($action === 'logout') {
        $token = $data['token'] ?? '';
        if ($token) {
            $db = getDB();
            $stmt = $db->prepare("DELETE FROM admin_sessions WHERE token = ?");
            $stmt->execute([$token]);
        }
        jsonResponse(['success' => true]);
    } elseif ($action === 'verify') {
        $token = $data['token'] ?? '';
        if (empty($token)) {
            jsonResponse(['error' => 'Token required'], 401);
        }
        
        $db = getDB();
        $stmt = $db->prepare("
            SELECT u.id, u.username, u.name, u.email 
            FROM admin_users u 
            JOIN admin_sessions s ON u.id = s.user_id 
            WHERE s.token = ? AND s.expires_at > NOW() AND u.is_active = 1
        ");
        $stmt->execute([$token]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($user) {
            $user['token'] = $token;
            jsonResponse(['user' => $user]);
        } else {
            jsonResponse(['error' => 'Invalid or expired token'], 401);
        }
    } else {
        jsonResponse(['error' => 'Invalid action'], 400);
    }
} else {
    jsonResponse(['error' => 'Method not allowed'], 405);
}
