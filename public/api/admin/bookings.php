<?php
/**
 * Admin Bookings API
 * Manage service bookings
 */

require_once __DIR__ . '/../config.php';

// Verify admin authentication
verifyAdminAuth();

$method = $_SERVER['REQUEST_METHOD'];
$db = getDB();

switch ($method) {
    case 'GET':
        handleGet($db);
        break;
    case 'PUT':
        handlePut($db);
        break;
    case 'DELETE':
        handleDelete($db);
        break;
    default:
        jsonResponse(['error' => 'Method not allowed'], 405);
}

/**
 * Handle GET requests - List or get single booking
 */
function handleGet(PDO $db): void {
    $id = $_GET['id'] ?? null;
    $status = $_GET['status'] ?? null;
    
    if ($id) {
        $stmt = $db->prepare("SELECT * FROM bookings WHERE id = ?");
        $stmt->execute([(int)$id]);
        $booking = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$booking) {
            jsonResponse(['error' => 'Booking not found'], 404);
        }
        
        jsonResponse(['success' => true, 'booking' => $booking]);
    }
    
    // List bookings with optional status filter
    $sql = "SELECT * FROM bookings WHERE 1=1";
    $params = [];
    
    if ($status) {
        $sql .= " AND status = ?";
        $params[] = $status;
    }
    
    $sql .= " ORDER BY preferred_date DESC, created_at DESC";
    
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    jsonResponse(['success' => true, 'bookings' => $bookings]);
}

/**
 * Handle PUT requests - Update booking status
 */
function handlePut(PDO $db): void {
    $data = getJsonInput();
    
    if (!$data) {
        jsonResponse(['error' => 'Invalid JSON input'], 400);
    }
    
    $id = $data['id'] ?? null;
    
    if (!$id) {
        jsonResponse(['error' => 'Booking ID is required'], 400);
    }
    
    // Check if booking exists
    $stmt = $db->prepare("SELECT id FROM bookings WHERE id = ?");
    $stmt->execute([(int)$id]);
    if (!$stmt->fetch()) {
        jsonResponse(['error' => 'Booking not found'], 404);
    }
    
    $status = sanitize($data['status'] ?? 'pending', 50);
    $adminNotes = sanitize($data['admin_notes'] ?? '', 2000);
    
    // Validate status
    $validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!in_array($status, $validStatuses)) {
        jsonResponse(['error' => 'Invalid status value'], 400);
    }
    
    $stmt = $db->prepare("
        UPDATE bookings 
        SET status = ?, admin_notes = ?, updated_at = NOW() 
        WHERE id = ?
    ");
    $stmt->execute([$status, $adminNotes, (int)$id]);
    
    jsonResponse([
        'success' => true,
        'message' => 'Booking updated successfully'
    ]);
}

/**
 * Handle DELETE requests - Delete booking
 */
function handleDelete(PDO $db): void {
    $id = $_GET['id'] ?? null;
    
    if (!$id) {
        jsonResponse(['error' => 'Booking ID is required'], 400);
    }
    
    // Check if booking exists
    $stmt = $db->prepare("SELECT id FROM bookings WHERE id = ?");
    $stmt->execute([(int)$id]);
    if (!$stmt->fetch()) {
        jsonResponse(['error' => 'Booking not found'], 404);
    }
    
    $stmt = $db->prepare("DELETE FROM bookings WHERE id = ?");
    $stmt->execute([(int)$id]);
    
    jsonResponse([
        'success' => true,
        'message' => 'Booking deleted successfully'
    ]);
}
