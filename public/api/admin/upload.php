<?php
/**
 * Admin File Upload API
 * Handle product image uploads
 */

require_once __DIR__ . '/../config.php';

// Verify admin authentication
verifyAdminAuth();

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'POST':
        handleUpload();
        break;
    case 'DELETE':
        handleDelete();
        break;
    default:
        jsonResponse(['error' => 'Method not allowed'], 405);
}

/**
 * Handle file upload
 */
function handleUpload(): void {
    if (!isset($_FILES['image'])) {
        jsonResponse(['error' => 'No image file uploaded'], 400);
    }
    
    $file = $_FILES['image'];
    
    // Check for upload errors
    if ($file['error'] !== UPLOAD_ERR_OK) {
        $errorMessages = [
            UPLOAD_ERR_INI_SIZE => 'File exceeds server maximum file size',
            UPLOAD_ERR_FORM_SIZE => 'File exceeds form maximum file size',
            UPLOAD_ERR_PARTIAL => 'File was only partially uploaded',
            UPLOAD_ERR_NO_FILE => 'No file was uploaded',
            UPLOAD_ERR_NO_TMP_DIR => 'Missing temporary folder',
            UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk',
            UPLOAD_ERR_EXTENSION => 'Upload stopped by extension'
        ];
        $message = $errorMessages[$file['error']] ?? 'Unknown upload error';
        jsonResponse(['error' => $message], 400);
    }
    
    // Allowed file types
    $allowedTypes = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/gif' => 'gif',
        'image/webp' => 'webp'
    ];
    
    // Validate MIME type using finfo (more secure than checking extension)
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mimeType = $finfo->file($file['tmp_name']);
    
    if (!isset($allowedTypes[$mimeType])) {
        jsonResponse(['error' => 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP'], 400);
    }
    
    // Validate file size (5MB max)
    $maxSize = 5 * 1024 * 1024;
    if ($file['size'] > $maxSize) {
        jsonResponse(['error' => 'File too large. Maximum size: 5MB'], 400);
    }
    
    // Generate unique filename
    $extension = $allowedTypes[$mimeType];
    $filename = 'product_' . uniqid() . '_' . time() . '.' . $extension;
    
    // Create uploads directory if it doesn't exist
    $uploadDir = __DIR__ . '/../../uploads/products/';
    if (!is_dir($uploadDir)) {
        if (!mkdir($uploadDir, 0755, true)) {
            jsonResponse(['error' => 'Failed to create upload directory'], 500);
        }
    }
    
    $uploadPath = $uploadDir . $filename;
    
    // Move uploaded file
    if (!move_uploaded_file($file['tmp_name'], $uploadPath)) {
        jsonResponse(['error' => 'Failed to save uploaded file'], 500);
    }
    
    // Set proper permissions
    chmod($uploadPath, 0644);
    
    // Return public URL
    $publicUrl = '/uploads/products/' . $filename;
    
    jsonResponse([
        'success' => true,
        'url' => $publicUrl,
        'filename' => $filename,
        'message' => 'Image uploaded successfully'
    ]);
}

/**
 * Handle file deletion
 */
function handleDelete(): void {
    $filename = $_GET['filename'] ?? '';
    
    if (empty($filename)) {
        jsonResponse(['error' => 'Filename is required'], 400);
    }
    
    // Sanitize filename to prevent directory traversal attacks
    $filename = basename($filename);
    
    // Validate filename format
    if (!preg_match('/^product_[a-f0-9]+_\d+\.(jpg|jpeg|png|gif|webp)$/i', $filename)) {
        jsonResponse(['error' => 'Invalid filename format'], 400);
    }
    
    $filePath = __DIR__ . '/../../uploads/products/' . $filename;
    
    if (!file_exists($filePath)) {
        jsonResponse(['error' => 'File not found'], 404);
    }
    
    if (!unlink($filePath)) {
        jsonResponse(['error' => 'Failed to delete file'], 500);
    }
    
    jsonResponse([
        'success' => true,
        'message' => 'Image deleted successfully'
    ]);
}
