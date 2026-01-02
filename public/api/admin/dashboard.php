<?php
/**
 * Admin Dashboard API
 * Returns statistics and recent activity
 */

require_once __DIR__ . '/../config.php';

// Verify admin authentication
verifyAdminAuth();

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'GET') {
    jsonResponse(['error' => 'Method not allowed'], 405);
}

try {
    $db = getDB();
    
    // Get total products count
    $stmt = $db->query("SELECT COUNT(*) as count FROM products");
    $totalProducts = (int)($stmt->fetch()['count'] ?? 0);
    
    // Get pending quotes count
    $stmt = $db->query("SELECT COUNT(*) as count FROM quotes WHERE status = 'pending'");
    $pendingQuotes = (int)($stmt->fetch()['count'] ?? 0);
    
    // Get pending bookings count
    $stmt = $db->query("SELECT COUNT(*) as count FROM bookings WHERE status = 'pending'");
    $pendingBookings = (int)($stmt->fetch()['count'] ?? 0);
    
    // Get unread/new contacts count
    $stmt = $db->query("SELECT COUNT(*) as count FROM contacts WHERE status IN ('new', 'unread')");
    $unreadContacts = (int)($stmt->fetch()['count'] ?? 0);
    
    // Get recent quotes (last 5)
    $stmt = $db->query("
        SELECT id, name, email, request_type as requestType, status, created_at 
        FROM quotes 
        ORDER BY created_at DESC 
        LIMIT 5
    ");
    $recentQuotes = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get recent bookings (last 5)
    $stmt = $db->query("
        SELECT id, name, service, preferred_date as preferredDate, status, created_at 
        FROM bookings 
        ORDER BY created_at DESC 
        LIMIT 5
    ");
    $recentBookings = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get recent contacts (last 5)
    $stmt = $db->query("
        SELECT id, name, email, subject, status, created_at 
        FROM contacts 
        ORDER BY created_at DESC 
        LIMIT 5
    ");
    $recentContacts = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    jsonResponse([
        'success' => true,
        'stats' => [
            'totalProducts' => $totalProducts,
            'pendingQuotes' => $pendingQuotes,
            'pendingBookings' => $pendingBookings,
            'unreadContacts' => $unreadContacts
        ],
        'recentQuotes' => $recentQuotes,
        'recentBookings' => $recentBookings,
        'recentContacts' => $recentContacts
    ]);
    
} catch (Exception $e) {
    error_log("Dashboard error: " . $e->getMessage());
    jsonResponse(['error' => 'Failed to load dashboard data'], 500);
}
