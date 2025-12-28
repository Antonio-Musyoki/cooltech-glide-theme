<?php
require_once '../config.php';

// Verify admin authentication
function verifyAdmin() {
    $headers = getallheaders();
    $token = $headers['Authorization'] ?? '';
    $token = str_replace('Bearer ', '', $token);
    
    if (empty($token)) {
        jsonResponse(['error' => 'Unauthorized'], 401);
    }
    
    $db = getDB();
    $stmt = $db->prepare("
        SELECT u.id FROM admin_users u 
        JOIN admin_sessions s ON u.id = s.user_id 
        WHERE s.token = ? AND s.expires_at > NOW() AND u.is_active = 1
    ");
    $stmt->execute([$token]);
    
    if (!$stmt->fetch()) {
        jsonResponse(['error' => 'Unauthorized'], 401);
    }
}

verifyAdmin();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $db = getDB();
    
    // Get total products
    $stmt = $db->query("SELECT COUNT(*) as count FROM products");
    $totalProducts = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
    
    // Get pending quotes
    $stmt = $db->query("SELECT COUNT(*) as count FROM quotes WHERE status = 'pending'");
    $pendingQuotes = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
    
    // Get pending bookings
    $stmt = $db->query("SELECT COUNT(*) as count FROM bookings WHERE status = 'pending'");
    $pendingBookings = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
    
    // Get unread contacts
    $stmt = $db->query("SELECT COUNT(*) as count FROM contacts WHERE status = 'unread'");
    $unreadContacts = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
    
    // Get recent quotes
    $stmt = $db->query("SELECT id, name, product_type, status, created_at FROM quotes ORDER BY created_at DESC LIMIT 5");
    $recentQuotes = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get recent bookings
    $stmt = $db->query("SELECT id, name, service_type, status, preferred_date, created_at FROM bookings ORDER BY created_at DESC LIMIT 5");
    $recentBookings = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get recent contacts
    $stmt = $db->query("SELECT id, name, subject, status, created_at FROM contacts ORDER BY created_at DESC LIMIT 5");
    $recentContacts = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    jsonResponse([
        'stats' => [
            'totalProducts' => (int)$totalProducts,
            'pendingQuotes' => (int)$pendingQuotes,
            'pendingBookings' => (int)$pendingBookings,
            'unreadContacts' => (int)$unreadContacts
        ],
        'recentQuotes' => $recentQuotes,
        'recentBookings' => $recentBookings,
        'recentContacts' => $recentContacts
    ]);
} else {
    jsonResponse(['error' => 'Method not allowed'], 405);
}
