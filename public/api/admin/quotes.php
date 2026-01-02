<?php
/**
 * Admin Quotes API
 * Manage quote requests
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
 * Handle GET requests - List or get single quote
 */
function handleGet(PDO $db): void {
    $id = $_GET['id'] ?? null;
    $status = $_GET['status'] ?? null;
    
    if ($id) {
        $stmt = $db->prepare("SELECT * FROM quotes WHERE id = ?");
        $stmt->execute([(int)$id]);
        $quote = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$quote) {
            jsonResponse(['error' => 'Quote not found'], 404);
        }
        
        // Decode JSON fields
        $quote['products'] = json_decode($quote['products'] ?? '[]', true) ?: [];
        $quote['services'] = json_decode($quote['services'] ?? '[]', true) ?: [];
        
        jsonResponse(['success' => true, 'quote' => $quote]);
    }
    
    // List quotes with optional status filter
    $sql = "SELECT * FROM quotes WHERE 1=1";
    $params = [];
    
    if ($status) {
        $sql .= " AND status = ?";
        $params[] = $status;
    }
    
    $sql .= " ORDER BY created_at DESC";
    
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $quotes = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Decode JSON fields
    foreach ($quotes as &$quote) {
        $quote['products'] = json_decode($quote['products'] ?? '[]', true) ?: [];
        $quote['services'] = json_decode($quote['services'] ?? '[]', true) ?: [];
    }
    
    jsonResponse(['success' => true, 'quotes' => $quotes]);
}

/**
 * Handle PUT requests - Update quote status
 */
function handlePut(PDO $db): void {
    $data = getJsonInput();
    
    if (!$data) {
        jsonResponse(['error' => 'Invalid JSON input'], 400);
    }
    
    $id = $data['id'] ?? null;
    
    if (!$id) {
        jsonResponse(['error' => 'Quote ID is required'], 400);
    }
    
    // Check if quote exists
    $stmt = $db->prepare("SELECT id FROM quotes WHERE id = ?");
    $stmt->execute([(int)$id]);
    if (!$stmt->fetch()) {
        jsonResponse(['error' => 'Quote not found'], 404);
    }
    
    $status = sanitize($data['status'] ?? 'pending', 50);
    $adminNotes = sanitize($data['admin_notes'] ?? '', 2000);
    
    // Validate status
    $validStatuses = ['pending', 'contacted', 'quoted', 'completed', 'cancelled'];
    if (!in_array($status, $validStatuses)) {
        jsonResponse(['error' => 'Invalid status value'], 400);
    }
    
    $stmt = $db->prepare("
        UPDATE quotes 
        SET status = ?, admin_notes = ?, updated_at = NOW() 
        WHERE id = ?
    ");
    $stmt->execute([$status, $adminNotes, (int)$id]);
    
    jsonResponse([
        'success' => true,
        'message' => 'Quote updated successfully'
    ]);
}

/**
 * Handle DELETE requests - Delete quote
 */
function handleDelete(PDO $db): void {
    $id = $_GET['id'] ?? null;
    
    if (!$id) {
        jsonResponse(['error' => 'Quote ID is required'], 400);
    }
    
    // Check if quote exists
    $stmt = $db->prepare("SELECT id FROM quotes WHERE id = ?");
    $stmt->execute([(int)$id]);
    if (!$stmt->fetch()) {
        jsonResponse(['error' => 'Quote not found'], 404);
    }
    
    $stmt = $db->prepare("DELETE FROM quotes WHERE id = ?");
    $stmt->execute([(int)$id]);
    
    jsonResponse([
        'success' => true,
        'message' => 'Quote deleted successfully'
    ]);
}
