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

if ($method === 'POST') {
    if (!isset($_FILES['image'])) {
        jsonResponse(['error' => 'No image file uploaded'], 400);
    }
    
    $file = $_FILES['image'];
    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    $maxSize = 5 * 1024 * 1024; // 5MB
    
    // Validate file type
    if (!in_array($file['type'], $allowedTypes)) {
        jsonResponse(['error' => 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP'], 400);
    }
    
    // Validate file size
    if ($file['size'] > $maxSize) {
        jsonResponse(['error' => 'File too large. Maximum size: 5MB'], 400);
    }
    
    // Generate unique filename
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = uniqid('product_') . '_' . time() . '.' . $extension;
    
    // Create uploads directory if it doesn't exist
    $uploadDir = '../../uploads/products/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }
    
    $uploadPath = $uploadDir . $filename;
    
    if (move_uploaded_file($file['tmp_name'], $uploadPath)) {
        // Return the public URL
        $publicUrl = '/uploads/products/' . $filename;
        jsonResponse([
            'url' => $publicUrl,
            'filename' => $filename,
            'message' => 'Image uploaded successfully'
        ]);
    } else {
        jsonResponse(['error' => 'Failed to upload image'], 500);
    }
} elseif ($method === 'DELETE') {
    $filename = $_GET['filename'] ?? '';
    
    if (empty($filename)) {
        jsonResponse(['error' => 'Filename required'], 400);
    }
    
    // Sanitize filename to prevent directory traversal
    $filename = basename($filename);
    $filePath = '../../uploads/products/' . $filename;
    
    if (file_exists($filePath)) {
        if (unlink($filePath)) {
            jsonResponse(['message' => 'Image deleted successfully']);
        } else {
            jsonResponse(['error' => 'Failed to delete image'], 500);
        }
    } else {
        jsonResponse(['error' => 'Image not found'], 404);
    }
} else {
    jsonResponse(['error' => 'Method not allowed'], 405);
}
