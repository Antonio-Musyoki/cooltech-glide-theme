<?php
/**
 * Public Quote Submission API
 * Handles quote requests from the frontend
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/send-email.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'error' => 'Method not allowed'], 405);
}

$input = getJsonInput();

if (!$input) {
    jsonResponse(['success' => false, 'error' => 'Invalid JSON input'], 400);
}

// Validate required fields
$required = ['name', 'email', 'phone', 'requestType', 'message'];
foreach ($required as $field) {
    if (empty($input[$field])) {
        jsonResponse(['success' => false, 'error' => "Missing required field: {$field}"], 400);
    }
}

// Validate email format
if (!isValidEmail($input['email'])) {
    jsonResponse(['success' => false, 'error' => 'Invalid email format'], 400);
}

// Validate request type
$validRequestTypes = ['product', 'service', 'both'];
if (!in_array($input['requestType'], $validRequestTypes)) {
    jsonResponse(['success' => false, 'error' => 'Invalid request type'], 400);
}

// Sanitize input
$name = sanitize($input['name'], 255);
$email = filter_var(trim($input['email']), FILTER_SANITIZE_EMAIL);
$phone = sanitize($input['phone'], 50);
$company = sanitize($input['company'] ?? '', 255);
$requestType = $input['requestType'];
$products = $input['products'] ?? [];
$services = $input['services'] ?? [];
$message = sanitize($input['message'], 5000);

// Validate arrays
if (!is_array($products)) $products = [];
if (!is_array($services)) $services = [];

try {
    $db = getDB();
    
    $stmt = $db->prepare("
        INSERT INTO quotes (name, email, phone, company, request_type, products, services, message, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
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
    
    // Send confirmation emails (don't fail request if email fails)
    try {
        sendQuoteEmails($quoteData);
    } catch (Exception $emailError) {
        error_log("Email sending failed for quote #{$quoteId}: " . $emailError->getMessage());
    }
    
    jsonResponse([
        'success' => true,
        'data' => ['id' => (int)$quoteId],
        'message' => 'Quote request submitted successfully. Check your email for confirmation.'
    ]);
    
} catch (Exception $e) {
    error_log("Quote submission error: " . $e->getMessage());
    jsonResponse(['success' => false, 'error' => 'Failed to submit quote request'], 500);
}
