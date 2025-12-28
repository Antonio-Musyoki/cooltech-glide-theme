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
$db = getDB();

if ($method === 'GET') {
    $id = $_GET['id'] ?? null;
    $status = $_GET['status'] ?? null;
    
    if ($id) {
        $stmt = $db->prepare("SELECT * FROM contacts WHERE id = ?");
        $stmt->execute([$id]);
        $contact = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($contact) {
            jsonResponse($contact);
        } else {
            jsonResponse(['error' => 'Contact not found'], 404);
        }
    } else {
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
        
        jsonResponse($contacts);
    }
} elseif ($method === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = $data['id'] ?? null;
    
    if (!$id) {
        jsonResponse(['error' => 'Contact ID required'], 400);
    }
    
    $status = sanitize($data['status'] ?? 'unread');
    
    $stmt = $db->prepare("UPDATE contacts SET status = ?, updated_at = NOW() WHERE id = ?");
    $stmt->execute([$status, $id]);
    
    jsonResponse(['message' => 'Contact updated successfully']);
} elseif ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    
    if (!$id) {
        jsonResponse(['error' => 'Contact ID required'], 400);
    }
    
    $stmt = $db->prepare("DELETE FROM contacts WHERE id = ?");
    $stmt->execute([$id]);
    
    jsonResponse(['message' => 'Contact deleted successfully']);
} else {
    jsonResponse(['error' => 'Method not allowed'], 405);
}
