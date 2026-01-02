<?php
/**
 * Public Contact Form API
 * Handles contact form submissions from the frontend
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
$required = ['name', 'email', 'subject', 'message'];
foreach ($required as $field) {
    if (empty($input[$field])) {
        jsonResponse(['success' => false, 'error' => "Missing required field: {$field}"], 400);
    }
}

// Validate email format
if (!isValidEmail($input['email'])) {
    jsonResponse(['success' => false, 'error' => 'Invalid email format'], 400);
}

// Sanitize input
$name = sanitize($input['name'], 100);
$email = filter_var(trim($input['email']), FILTER_SANITIZE_EMAIL);
$phone = sanitize($input['phone'] ?? '', 50);
$subject = sanitize($input['subject'], 255);
$message = sanitize($input['message'], 5000);

// Validate lengths
if (mb_strlen($name) < 2) {
    jsonResponse(['success' => false, 'error' => 'Name is too short'], 400);
}
if (mb_strlen($subject) < 3) {
    jsonResponse(['success' => false, 'error' => 'Subject is too short'], 400);
}
if (mb_strlen($message) < 10) {
    jsonResponse(['success' => false, 'error' => 'Message is too short'], 400);
}

try {
    $db = getDB();
    
    $stmt = $db->prepare("
        INSERT INTO contacts (name, email, phone, subject, message, status, created_at)
        VALUES (?, ?, ?, ?, ?, 'new', NOW())
    ");
    
    $stmt->execute([$name, $email, $phone, $subject, $message]);
    
    $contactId = $db->lastInsertId();
    
    // Prepare data for email
    $contactData = [
        'id' => $contactId,
        'name' => $name,
        'email' => $email,
        'phone' => $phone,
        'subject' => $subject,
        'message' => $message
    ];
    
    // Send confirmation emails (don't fail request if email fails)
    try {
        sendContactEmails($contactData);
    } catch (Exception $emailError) {
        error_log("Email sending failed for contact #{$contactId}: " . $emailError->getMessage());
    }
    
    jsonResponse([
        'success' => true,
        'data' => ['id' => (int)$contactId],
        'message' => 'Message sent successfully. We will respond within 1-2 business days.'
    ]);
    
} catch (Exception $e) {
    error_log("Contact submission error: " . $e->getMessage());
    jsonResponse(['success' => false, 'error' => 'Failed to send message'], 500);
}
