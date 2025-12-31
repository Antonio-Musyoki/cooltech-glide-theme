<?php
require_once 'config.php';
require_once 'send-email.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'error' => 'Method not allowed'], 405);
}

$input = json_decode(file_get_contents('php://input'), true);

// Validate required fields
$required = ['name', 'email', 'phone', 'serviceLocation', 'address', 'service', 'preferredDate', 'preferredTime'];
foreach ($required as $field) {
    if (empty($input[$field])) {
        jsonResponse(['success' => false, 'error' => "Missing required field: $field"], 400);
    }
}

// Validate email format
if (!filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
    jsonResponse(['success' => false, 'error' => 'Invalid email format'], 400);
}

// Validate date format
$preferredDate = $input['preferredDate'];
if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $preferredDate)) {
    jsonResponse(['success' => false, 'error' => 'Invalid date format'], 400);
}

// Sanitize input
$name = htmlspecialchars(trim($input['name']), ENT_QUOTES, 'UTF-8');
$email = filter_var(trim($input['email']), FILTER_SANITIZE_EMAIL);
$phone = htmlspecialchars(trim($input['phone']), ENT_QUOTES, 'UTF-8');
$company = htmlspecialchars(trim($input['company'] ?? ''), ENT_QUOTES, 'UTF-8');
$serviceLocation = $input['serviceLocation'];
$address = htmlspecialchars(trim($input['address']), ENT_QUOTES, 'UTF-8');
$service = htmlspecialchars(trim($input['service']), ENT_QUOTES, 'UTF-8');
$preferredTime = htmlspecialchars(trim($input['preferredTime']), ENT_QUOTES, 'UTF-8');
$description = htmlspecialchars(trim($input['description'] ?? ''), ENT_QUOTES, 'UTF-8');

// Validate service location
if (!in_array($serviceLocation, ['residential', 'commercial', 'industrial'])) {
    jsonResponse(['success' => false, 'error' => 'Invalid service location type'], 400);
}

try {
    $db = getDB();
    $stmt = $db->prepare("
        INSERT INTO bookings (name, email, phone, company, service_location, address, service, preferred_date, preferred_time, description)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
    
    // Send confirmation emails
    try {
        sendBookingEmails($bookingData);
    } catch (Exception $emailError) {
        // Log email error but don't fail the request
        error_log("Email sending failed for booking #{$bookingId}: " . $emailError->getMessage());
    }
    
    jsonResponse([
        'success' => true, 
        'data' => ['id' => $bookingId],
        'message' => 'Booking submitted successfully. Check your email for confirmation.'
    ]);
    
} catch (Exception $e) {
    error_log("Booking submission error: " . $e->getMessage());
    jsonResponse(['success' => false, 'error' => 'Failed to submit booking'], 500);
}
