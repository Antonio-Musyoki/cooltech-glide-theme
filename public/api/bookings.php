<?php
/**
 * Public Booking Submission API
 * Handles service booking requests from the frontend
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
$required = ['name', 'email', 'phone', 'serviceLocation', 'address', 'service', 'preferredDate', 'preferredTime'];
foreach ($required as $field) {
    if (empty($input[$field])) {
        jsonResponse(['success' => false, 'error' => "Missing required field: {$field}"], 400);
    }
}

// Validate email format
if (!isValidEmail($input['email'])) {
    jsonResponse(['success' => false, 'error' => 'Invalid email format'], 400);
}

// Validate date format (YYYY-MM-DD)
$preferredDate = $input['preferredDate'];
if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $preferredDate)) {
    jsonResponse(['success' => false, 'error' => 'Invalid date format. Use YYYY-MM-DD'], 400);
}

// Validate service location
$validLocations = ['residential', 'commercial', 'industrial'];
if (!in_array($input['serviceLocation'], $validLocations)) {
    jsonResponse(['success' => false, 'error' => 'Invalid service location type'], 400);
}

// Sanitize input
$name = sanitize($input['name'], 255);
$email = filter_var(trim($input['email']), FILTER_SANITIZE_EMAIL);
$phone = sanitize($input['phone'], 50);
$company = sanitize($input['company'] ?? '', 255);
$serviceLocation = $input['serviceLocation'];
$address = sanitize($input['address'], 500);
$service = sanitize($input['service'], 255);
$preferredTime = sanitize($input['preferredTime'], 50);
$description = sanitize($input['description'] ?? '', 2000);

try {
    $db = getDB();
    
    $stmt = $db->prepare("
        INSERT INTO bookings (
            name, email, phone, company, service_location, address, 
            service, preferred_date, preferred_time, description, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
    ");
    
    $stmt->execute([
        $name,
        $email,
        $phone,
        $company,
        $serviceLocation,
        $address,
        $service,
        $preferredDate,
        $preferredTime,
        $description
    ]);
    
    $bookingId = $db->lastInsertId();
    
    // Prepare data for email
    $bookingData = [
        'id' => $bookingId,
        'name' => $name,
        'email' => $email,
        'phone' => $phone,
        'company' => $company,
        'serviceLocation' => $serviceLocation,
        'address' => $address,
        'service' => $service,
        'preferredDate' => $preferredDate,
        'preferredTime' => $preferredTime,
        'description' => $description
    ];
    
    // Send confirmation emails (don't fail request if email fails)
    try {
        sendBookingEmails($bookingData);
    } catch (Exception $emailError) {
        error_log("Email sending failed for booking #{$bookingId}: " . $emailError->getMessage());
    }
    
    jsonResponse([
        'success' => true,
        'data' => ['id' => (int)$bookingId],
        'message' => 'Booking submitted successfully. Check your email for confirmation.'
    ]);
    
} catch (Exception $e) {
    error_log("Booking submission error: " . $e->getMessage());
    jsonResponse(['success' => false, 'error' => 'Failed to submit booking'], 500);
}
