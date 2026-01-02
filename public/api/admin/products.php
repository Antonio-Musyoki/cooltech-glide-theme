<?php
/**
 * Admin Products API
 * CRUD operations for products management
 */

require_once __DIR__ . '/../config.php';

$method = $_SERVER['REQUEST_METHOD'];

// GET requests don't require authentication (public product listing)
// All other methods require admin authentication
if ($method !== 'GET') {
    verifyAdminAuth();
}

$db = getDB();

switch ($method) {
    case 'GET':
        handleGet($db);
        break;
    case 'POST':
        handlePost($db);
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
 * Handle GET requests - List or get single product
 */
function handleGet(PDO $db): void {
    $id = $_GET['id'] ?? null;
    
    if ($id) {
        // Get single product
        $stmt = $db->prepare("SELECT * FROM products WHERE id = ?");
        $stmt->execute([(int)$id]);
        $product = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$product) {
            jsonResponse(['error' => 'Product not found'], 404);
        }
        
        // Decode JSON fields
        $product['tags'] = json_decode($product['tags'] ?? '[]', true) ?: [];
        $product['images'] = json_decode($product['images'] ?? '[]', true) ?: [];
        $product['specifications'] = json_decode($product['specifications'] ?? '[]', true) ?: [];
        $product['features'] = json_decode($product['features'] ?? '[]', true) ?: [];
        
        jsonResponse(['success' => true, 'product' => $product]);
    }
    
    // List products with optional filters
    $category = $_GET['category'] ?? null;
    $search = $_GET['search'] ?? null;
    $featured = $_GET['featured'] ?? null;
    $inStock = $_GET['in_stock'] ?? null;
    
    $sql = "SELECT * FROM products WHERE 1=1";
    $params = [];
    
    if ($category) {
        $sql .= " AND category = ?";
        $params[] = $category;
    }
    
    if ($search) {
        $sql .= " AND (name LIKE ? OR description LIKE ?)";
        $searchTerm = "%{$search}%";
        $params[] = $searchTerm;
        $params[] = $searchTerm;
    }
    
    if ($featured !== null) {
        $sql .= " AND featured = ?";
        $params[] = (int)$featured;
    }
    
    if ($inStock !== null) {
        $sql .= " AND in_stock = ?";
        $params[] = (int)$inStock;
    }
    
    $sql .= " ORDER BY featured DESC, created_at DESC";
    
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Decode JSON fields for each product
    foreach ($products as &$product) {
        $product['tags'] = json_decode($product['tags'] ?? '[]', true) ?: [];
        $product['images'] = json_decode($product['images'] ?? '[]', true) ?: [];
    }
    
    jsonResponse(['success' => true, 'products' => $products]);
}

/**
 * Handle POST requests - Create new product
 */
function handlePost(PDO $db): void {
    $data = getJsonInput();
    
    if (!$data) {
        jsonResponse(['error' => 'Invalid JSON input'], 400);
    }
    
    // Validate required fields
    $name = trim($data['name'] ?? '');
    $category = trim($data['category'] ?? '');
    
    if (empty($name)) {
        jsonResponse(['error' => 'Product name is required'], 400);
    }
    
    if (empty($category)) {
        jsonResponse(['error' => 'Product category is required'], 400);
    }
    
    // Generate slug from name
    $slug = generateSlug($name);
    
    // Check if slug exists
    $stmt = $db->prepare("SELECT id FROM products WHERE slug = ?");
    $stmt->execute([$slug]);
    if ($stmt->fetch()) {
        $slug .= '-' . time();
    }
    
    // Prepare data
    $description = sanitize($data['description'] ?? '', 1000);
    $fullDescription = sanitize($data['full_description'] ?? '', 5000);
    $price = floatval($data['price'] ?? 0);
    $originalPrice = isset($data['original_price']) ? floatval($data['original_price']) : null;
    $image = sanitize($data['image'] ?? '', 500);
    $images = json_encode($data['images'] ?? []);
    $tags = json_encode($data['tags'] ?? []);
    $specifications = json_encode($data['specifications'] ?? []);
    $features = json_encode($data['features'] ?? []);
    $badge = sanitize($data['badge'] ?? '', 50);
    $inStock = isset($data['in_stock']) ? ($data['in_stock'] ? 1 : 0) : 1;
    $featured = isset($data['featured']) ? ($data['featured'] ? 1 : 0) : 0;
    
    $stmt = $db->prepare("
        INSERT INTO products (
            name, slug, category, description, full_description, price, original_price,
            image, images, tags, specifications, features, badge, in_stock, featured, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    ");
    
    $stmt->execute([
        sanitize($name, 255),
        $slug,
        sanitize($category, 100),
        $description,
        $fullDescription,
        $price,
        $originalPrice,
        $image,
        $images,
        $tags,
        $specifications,
        $features,
        $badge,
        $inStock,
        $featured
    ]);
    
    $id = $db->lastInsertId();
    
    jsonResponse([
        'success' => true,
        'id' => (int)$id,
        'slug' => $slug,
        'message' => 'Product created successfully'
    ], 201);
}

/**
 * Handle PUT requests - Update existing product
 */
function handlePut(PDO $db): void {
    $data = getJsonInput();
    
    if (!$data) {
        jsonResponse(['error' => 'Invalid JSON input'], 400);
    }
    
    $id = $data['id'] ?? null;
    
    if (!$id) {
        jsonResponse(['error' => 'Product ID is required'], 400);
    }
    
    // Check if product exists
    $stmt = $db->prepare("SELECT id FROM products WHERE id = ?");
    $stmt->execute([(int)$id]);
    if (!$stmt->fetch()) {
        jsonResponse(['error' => 'Product not found'], 404);
    }
    
    // Prepare data
    $name = sanitize($data['name'] ?? '', 255);
    $category = sanitize($data['category'] ?? '', 100);
    $description = sanitize($data['description'] ?? '', 1000);
    $fullDescription = sanitize($data['full_description'] ?? '', 5000);
    $price = floatval($data['price'] ?? 0);
    $originalPrice = isset($data['original_price']) ? floatval($data['original_price']) : null;
    $image = sanitize($data['image'] ?? '', 500);
    $images = json_encode($data['images'] ?? []);
    $tags = json_encode($data['tags'] ?? []);
    $specifications = json_encode($data['specifications'] ?? []);
    $features = json_encode($data['features'] ?? []);
    $badge = sanitize($data['badge'] ?? '', 50);
    $inStock = isset($data['in_stock']) ? ($data['in_stock'] ? 1 : 0) : 1;
    $featured = isset($data['featured']) ? ($data['featured'] ? 1 : 0) : 0;
    
    $stmt = $db->prepare("
        UPDATE products SET 
            name = ?, category = ?, description = ?, full_description = ?,
            price = ?, original_price = ?, image = ?, images = ?, tags = ?,
            specifications = ?, features = ?, badge = ?, in_stock = ?, featured = ?,
            updated_at = NOW()
        WHERE id = ?
    ");
    
    $stmt->execute([
        $name, $category, $description, $fullDescription,
        $price, $originalPrice, $image, $images, $tags,
        $specifications, $features, $badge, $inStock, $featured,
        (int)$id
    ]);
    
    jsonResponse([
        'success' => true,
        'message' => 'Product updated successfully'
    ]);
}

/**
 * Handle DELETE requests - Delete product
 */
function handleDelete(PDO $db): void {
    $id = $_GET['id'] ?? null;
    
    if (!$id) {
        jsonResponse(['error' => 'Product ID is required'], 400);
    }
    
    // Check if product exists
    $stmt = $db->prepare("SELECT id, image FROM products WHERE id = ?");
    $stmt->execute([(int)$id]);
    $product = $stmt->fetch();
    
    if (!$product) {
        jsonResponse(['error' => 'Product not found'], 404);
    }
    
    // Delete the product
    $stmt = $db->prepare("DELETE FROM products WHERE id = ?");
    $stmt->execute([(int)$id]);
    
    jsonResponse([
        'success' => true,
        'message' => 'Product deleted successfully'
    ]);
}

/**
 * Generate URL-friendly slug from string
 */
function generateSlug(string $text): string {
    $text = strtolower(trim($text));
    $text = preg_replace('/[^a-z0-9\s-]/', '', $text);
    $text = preg_replace('/[\s-]+/', '-', $text);
    return trim($text, '-');
}
