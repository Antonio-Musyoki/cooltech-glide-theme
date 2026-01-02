<?php
/**
 * Admin Contacts API
 * Manage contact form submissions
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
 * Handle GET requests - List or get single contact
 */
function handleGet(PDO $db): void {
    $id = $_GET['id'] ?? null;
    $status = $_GET['status'] ?? null;
    
    if ($id) {
        $stmt = $db->prepare("SELECT * FROM contacts WHERE id = ?");
        $stmt->execute([(int)$id]);
        $contact = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$contact) {
            jsonResponse(['error' => 'Contact not found'], 404);
        }
        
        jsonResponse(['success' => true, 'contact' => $contact]);
    }
    
    // List contacts with optional status filter
    $sql = "SELECT * FROM contacts WHERE 1=1";
    $params = [];
    
    if ($status) {
        $sql .= " AND status = ?";
        $params[] = $status;
    }
    
    $sql .= " ORDER BY created_at DESC";
    
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $contacts = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    jsonResponse(['success' => true, 'contacts' => $contacts]);
}

/**
 * Handle PUT requests - Update contact status
 */
function handlePut(PDO $db): void {
    $data = getJsonInput();
    
    if (!$data) {
        jsonResponse(['error' => 'Invalid JSON input'], 400);
    }
    
    $id = $data['id'] ?? null;
    
    if (!$id) {
        jsonResponse(['error' => 'Contact ID is required'], 400);
    }
    
    // Check if contact exists
    $stmt = $db->prepare("SELECT id FROM contacts WHERE id = ?");
    $stmt->execute([(int)$id]);
    if (!$stmt->fetch()) {
        jsonResponse(['error' => 'Contact not found'], 404);
    }
    
    $status = sanitize($data['status'] ?? 'new', 50);
    
    // Validate status
    $validStatuses = ['new', 'unread', 'read', 'replied', 'archived'];
    if (!in_array($status, $validStatuses)) {
        jsonResponse(['error' => 'Invalid status value'], 400);
    }
    
    $stmt = $db->prepare("
        UPDATE contacts 
        SET status = ?, updated_at = NOW() 
        WHERE id = ?
    ");
    $stmt->execute([$status, (int)$id]);
    
    jsonResponse([
        'success' => true,
        'message' => 'Contact updated successfully'
    ]);
}

/**
 * Handle DELETE requests - Delete contact
 */
function handleDelete(PDO $db): void {
    $id = $_GET['id'] ?? null;
    
    if (!$id) {
        jsonResponse(['error' => 'Contact ID is required'], 400);
    }
    
    // Check if contact exists
    $stmt = $db->prepare("SELECT id FROM contacts WHERE id = ?");
    $stmt->execute([(int)$id]);
    if (!$stmt->fetch()) {
        jsonResponse(['error' => 'Contact not found'], 404);
    }
    
    $stmt = $db->prepare("DELETE FROM contacts WHERE id = ?");
    $stmt->execute([(int)$id]);
    
    jsonResponse([
        'success' => true,
        'message' => 'Contact deleted successfully'
    ]);
}
