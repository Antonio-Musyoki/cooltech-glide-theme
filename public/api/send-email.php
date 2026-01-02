<?php
/**
 * Email Sending Service for CoolTech Refrigeration
 * Handles sending HTML emails with proper headers
 */

require_once __DIR__ . '/email-templates.php';

// Email configuration - update these values in your cPanel
define('SMTP_FROM_NAME', 'CoolTech Refrigeration');
define('SMTP_FROM_EMAIL', 'noreply@cooltechrefrigeration.co.ke');
define('ADMIN_NOTIFICATION_EMAIL', 'info@cooltechrefrigeration.co.ke');

/**
 * Send an HTML email
 * 
 * @param string $to Recipient email
 * @param string $subject Email subject
 * @param string $htmlBody HTML content
 * @param array $options Additional options (replyTo, cc, bcc)
 * @return bool Success status
 */
function sendEmail(string $to, string $subject, string $htmlBody, array $options = []): bool {
    $fromName = SMTP_FROM_NAME;
    $fromEmail = SMTP_FROM_EMAIL;
    
    // Email headers
    $headers = [
        'MIME-Version: 1.0',
        'Content-type: text/html; charset=UTF-8',
        "From: {$fromName} <{$fromEmail}>",
        'X-Mailer: PHP/' . phpversion()
    ];
    
    // Add Reply-To if specified
    if (!empty($options['replyTo'])) {
        $headers[] = 'Reply-To: ' . $options['replyTo'];
    }
    
    // Add CC if specified
    if (!empty($options['cc'])) {
        $headers[] = 'Cc: ' . $options['cc'];
    }
    
    // Add BCC if specified
    if (!empty($options['bcc'])) {
        $headers[] = 'Bcc: ' . $options['bcc'];
    }
    
    $headersString = implode("\r\n", $headers);
    
    // Log email attempt (for debugging)
    error_log("Sending email to: {$to}, Subject: {$subject}");
    
    // Send email
    $result = @mail($to, $subject, $htmlBody, $headersString);
    
    if (!$result) {
        error_log("Email sending failed to: {$to}");
    }
    
    return $result;
}

/**
 * Send quote confirmation emails (to customer and admin)
 */
function sendQuoteEmails(array $quoteData): bool {
    $customerEmail = $quoteData['email'];
    $customerName = $quoteData['name'];
    
    // Send customer confirmation
    $customerHtml = getQuoteConfirmationEmail($quoteData);
    sendEmail(
        $customerEmail,
        "Quote Request Received - CoolTech Refrigeration #CTQ-{$quoteData['id']}",
        $customerHtml
    );
    
    // Send admin notification
    $adminHtml = getQuoteAdminEmail($quoteData);
    sendEmail(
        ADMIN_NOTIFICATION_EMAIL,
        "🔔 New Quote Request #CTQ-{$quoteData['id']} from {$customerName}",
        $adminHtml,
        ['replyTo' => $customerEmail]
    );
    
    return true;
}

/**
 * Send booking confirmation emails (to customer and admin)
 */
function sendBookingEmails(array $bookingData): bool {
    $customerEmail = $bookingData['email'];
    $customerName = $bookingData['name'];
    $service = $bookingData['service'];
    $date = date('M j, Y', strtotime($bookingData['preferredDate']));
    
    // Send customer confirmation
    $customerHtml = getBookingConfirmationEmail($bookingData);
    sendEmail(
        $customerEmail,
        "Booking Confirmation - {$service} on {$date} - CoolTech #CTB-{$bookingData['id']}",
        $customerHtml
    );
    
    // Send admin notification
    $adminHtml = getBookingAdminEmail($bookingData);
    sendEmail(
        ADMIN_NOTIFICATION_EMAIL,
        "📅 New Booking #CTB-{$bookingData['id']} - {$service} on {$date}",
        $adminHtml,
        ['replyTo' => $customerEmail]
    );
    
    return true;
}

/**
 * Send contact form confirmation emails (to customer and admin)
 */
function sendContactEmails(array $contactData): bool {
    $customerEmail = $contactData['email'];
    $customerName = $contactData['name'];
    $subject = $contactData['subject'];
    
    // Send customer confirmation
    $customerHtml = getContactConfirmationEmail($contactData);
    sendEmail(
        $customerEmail,
        "We received your message - CoolTech Refrigeration",
        $customerHtml
    );
    
    // Send admin notification
    $adminHtml = getContactAdminEmail($contactData);
    sendEmail(
        ADMIN_NOTIFICATION_EMAIL,
        "📧 New Contact: {$subject} from {$customerName}",
        $adminHtml,
        ['replyTo' => $customerEmail]
    );
    
    return true;
}
