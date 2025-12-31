<?php
require_once 'config.php';
require_once 'send-email.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'error' => 'Method not allowed'], 405);
}

$input = json_decode(file_get_contents('php://input'), true);

// Validate required fields
$required = ['name', 'email', 'phone', 'requestType', 'message'];
foreach ($required as $field) {
    if (empty($input[$field])) {
        jsonResponse(['success' => false, 'error' => "Missing required field: $field"], 400);
    }
}

// Validate email format
if (!filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
    jsonResponse(['success' => false, 'error' => 'Invalid email format'], 400);
}

// Sanitize input
$name = htmlspecialchars(trim($input['name']), ENT_QUOTES, 'UTF-8');
$email = filter_var(trim($input['email']), FILTER_SANITIZE_EMAIL);
$phone = htmlspecialchars(trim($input['phone']), ENT_QUOTES, 'UTF-8');
$company = htmlspecialchars(trim($input['company'] ?? ''), ENT_QUOTES, 'UTF-8');
$requestType = $input['requestType'];
$products = $input['products'] ?? [];
$services = $input['services'] ?? [];
$message = htmlspecialchars(trim($input['message']), ENT_QUOTES, 'UTF-8');

// Validate request type
if (!in_array($requestType, ['product', 'service', 'both'])) {
    jsonResponse(['success' => false, 'error' => 'Invalid request type'], 400);
}

try {
    $db = getDB();
    $stmt = $db->prepare("
        INSERT INTO quotes (name, email, phone, company, request_type, products, services, message)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([
        $name, 
        $email, 
        $phone, 
        $company, 
        $requestType, 
        json_encode($products), 
        json_encode($services), 
        $message
    ]);
    
    $quoteId = $db->lastInsertId();
    
    // Prepare data for email
    $quoteData = [
        'id' => $quoteId,
        'name' => $name,
        'email' => $email,
        'phone' => $phone,
        'company' => $company,
        'requestType' => $requestType,
        'products' => $products,
        'services' => $services,
        'message' => $message
    ];
    
    // Send confirmation emails
    try {
        sendQuoteEmails($quoteData);
    } catch (Exception $emailError) {
        // Log email error but don't fail the request
        error_log("Email sending failed for quote #{$quoteId}: " . $emailError->getMessage());
    }
    
    jsonResponse([
        'success' => true, 
        'data' => ['id' => $quoteId],
        'message' => 'Quote request submitted successfully. Check your email for confirmation.'
    ]);
    
} catch (Exception $e) {
    error_log("Quote submission error: " . $e->getMessage());
    jsonResponse(['success' => false, 'error' => 'Failed to submit quote request'], 500);
}
