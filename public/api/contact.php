<?php
require_once 'config.php';
require_once 'send-email.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'error' => 'Method not allowed'], 405);
}

$input = json_decode(file_get_contents('php://input'), true);

// Validate required fields
$required = ['name', 'email', 'subject', 'message'];
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
$phone = htmlspecialchars(trim($input['phone'] ?? ''), ENT_QUOTES, 'UTF-8');
$subject = htmlspecialchars(trim($input['subject']), ENT_QUOTES, 'UTF-8');
$message = htmlspecialchars(trim($input['message']), ENT_QUOTES, 'UTF-8');

// Validate lengths
if (strlen($name) > 100) {
    jsonResponse(['success' => false, 'error' => 'Name is too long'], 400);
}
if (strlen($subject) > 255) {
    jsonResponse(['success' => false, 'error' => 'Subject is too long'], 400);
}
if (strlen($message) > 5000) {
    jsonResponse(['success' => false, 'error' => 'Message is too long'], 400);
}

try {
    $db = getDB();
    $stmt = $db->prepare("
        INSERT INTO contacts (name, email, phone, subject, message)
        VALUES (?, ?, ?, ?, ?)
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
    
    // Send confirmation emails
    try {
        sendContactEmails($contactData);
    } catch (Exception $emailError) {
        // Log email error but don't fail the request
        error_log("Email sending failed for contact #{$contactId}: " . $emailError->getMessage());
    }
    
    jsonResponse([
        'success' => true, 
        'data' => ['id' => $contactId],
        'message' => 'Message sent successfully. We will respond within 1-2 business days.'
    ]);
    
} catch (Exception $e) {
    error_log("Contact submission error: " . $e->getMessage());
    jsonResponse(['success' => false, 'error' => 'Failed to send message'], 500);
}
