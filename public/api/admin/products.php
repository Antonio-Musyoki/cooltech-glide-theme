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

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'GET') {
    verifyAdmin();
}

$db = getDB();

if ($method === 'GET') {
    $id = $_GET['id'] ?? null;
    
    if ($id) {
        $stmt = $db->prepare("SELECT * FROM products WHERE id = ?");
        $stmt->execute([$id]);
        $product = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($product) {
            $product['tags'] = json_decode($product['tags'], true) ?? [];
            $product['images'] = json_decode($product['images'], true) ?? [];
            jsonResponse($product);
        } else {
            jsonResponse(['error' => 'Product not found'], 404);
        }
    } else {
        $category = $_GET['category'] ?? null;
        $search = $_GET['search'] ?? null;
        
        $sql = "SELECT * FROM products WHERE 1=1";
        $params = [];
        
        if ($category) {
            $sql .= " AND category = ?";
            $params[] = $category;
        }
        
        if ($search) {
            $sql .= " AND (name LIKE ? OR description LIKE ?)";
            $params[] = "%$search%";
            $params[] = "%$search%";
        }
        
        $sql .= " ORDER BY created_at DESC";
        
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($products as &$product) {
            $product['tags'] = json_decode($product['tags'], true) ?? [];
            $product['images'] = json_decode($product['images'], true) ?? [];
        }
        
        jsonResponse($products);
    }
} elseif ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $name = sanitize($data['name'] ?? '');
    $description = sanitize($data['description'] ?? '');
    $category = sanitize($data['category'] ?? '');
    $price = floatval($data['price'] ?? 0);
    $image = sanitize($data['image'] ?? '');
    $images = json_encode($data['images'] ?? []);
    $tags = json_encode($data['tags'] ?? []);
    $in_stock = isset($data['in_stock']) ? ($data['in_stock'] ? 1 : 0) : 1;
    $featured = isset($data['featured']) ? ($data['featured'] ? 1 : 0) : 0;
    
    if (empty($name) || empty($category)) {
        jsonResponse(['error' => 'Name and category are required'], 400);
    }
    
    $stmt = $db->prepare("
        INSERT INTO products (name, description, category, price, image, images, tags, in_stock, featured, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    ");
    $stmt->execute([$name, $description, $category, $price, $image, $images, $tags, $in_stock, $featured]);
    
    $id = $db->lastInsertId();
    
    jsonResponse(['id' => $id, 'message' => 'Product created successfully'], 201);
} elseif ($method === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = $data['id'] ?? null;
    
    if (!$id) {
        jsonResponse(['error' => 'Product ID required'], 400);
    }
    
    $name = sanitize($data['name'] ?? '');
    $description = sanitize($data['description'] ?? '');
    $category = sanitize($data['category'] ?? '');
    $price = floatval($data['price'] ?? 0);
    $image = sanitize($data['image'] ?? '');
    $images = json_encode($data['images'] ?? []);
    $tags = json_encode($data['tags'] ?? []);
    $in_stock = isset($data['in_stock']) ? ($data['in_stock'] ? 1 : 0) : 1;
    $featured = isset($data['featured']) ? ($data['featured'] ? 1 : 0) : 0;
    
    $stmt = $db->prepare("
        UPDATE products SET 
            name = ?, description = ?, category = ?, price = ?, 
            image = ?, images = ?, tags = ?, in_stock = ?, featured = ?, 
            updated_at = NOW() 
        WHERE id = ?
    ");
    $stmt->execute([$name, $description, $category, $price, $image, $images, $tags, $in_stock, $featured, $id]);
    
    jsonResponse(['message' => 'Product updated successfully']);
} elseif ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    
    if (!$id) {
        jsonResponse(['error' => 'Product ID required'], 400);
    }
    
    $stmt = $db->prepare("DELETE FROM products WHERE id = ?");
    $stmt->execute([$id]);
    
    jsonResponse(['message' => 'Product deleted successfully']);
} else {
    jsonResponse(['error' => 'Method not allowed'], 405);
}
