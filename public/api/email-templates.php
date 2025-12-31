<?php
/**
 * Email Templates for CoolTech Refrigeration
 * Professional HTML email templates for customer notifications
 */

// Company branding constants
define('COMPANY_NAME', 'CoolTech Refrigeration & Air Conditioning');
define('COMPANY_EMAIL', 'info@cooltechrefrigeration.co.ke');
define('COMPANY_PHONE', '+254 707 154 948');
define('COMPANY_PHONE_ALT', '+254 719 110 722');
define('COMPANY_ADDRESS', 'PO BOX 317 – 00610, Nairobi, Kenya');
define('COMPANY_WEBSITE', 'https://cooltechrefrigeration.co.ke');

/**
 * Base HTML email wrapper with branding
 */
function getEmailWrapper($content, $preheader = '') {
    $year = date('Y');
    
    return <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CoolTech Refrigeration</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            background-color: #f4f7fa;
        }
        .preheader {
            display: none !important;
            visibility: hidden;
            opacity: 0;
            color: transparent;
            height: 0;
            width: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #0A3D62 0%, #1E5F8A 100%);
            padding: 30px 20px;
            text-align: center;
        }
        .header h1 {
            color: #ffffff;
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .header .tagline {
            color: #87CEEB;
            font-size: 14px;
            margin-top: 5px;
        }
        .content {
            padding: 30px;
        }
        .greeting {
            font-size: 18px;
            color: #1a1a1a;
            margin-bottom: 20px;
        }
        .message {
            color: #4a4a4a;
            margin-bottom: 25px;
        }
        .info-box {
            background: #f8fafc;
            border-left: 4px solid #0A3D62;
            padding: 20px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
        }
        .info-box h3 {
            color: #0A3D62;
            margin: 0 0 15px 0;
            font-size: 16px;
        }
        .info-row {
            display: flex;
            margin-bottom: 10px;
        }
        .info-label {
            font-weight: 600;
            color: #1a1a1a;
            min-width: 120px;
        }
        .info-value {
            color: #4a4a4a;
        }
        .ref-number {
            background: #0A3D62;
            color: #ffffff;
            padding: 10px 20px;
            border-radius: 5px;
            display: inline-block;
            font-weight: 600;
            margin: 15px 0;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #0A3D62 0%, #1E5F8A 100%);
            color: #ffffff !important;
            padding: 14px 30px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: 600;
            margin: 20px 0;
        }
        .footer {
            background: #1a1a1a;
            padding: 25px;
            text-align: center;
        }
        .footer p {
            color: #888888;
            margin: 5px 0;
            font-size: 13px;
        }
        .footer a {
            color: #87CEEB;
            text-decoration: none;
        }
        .social-links {
            margin: 15px 0;
        }
        .social-links a {
            margin: 0 10px;
        }
        .divider {
            height: 1px;
            background: #e5e5e5;
            margin: 25px 0;
        }
    </style>
</head>
<body>
    <span class="preheader">{$preheader}</span>
    <div style="padding: 20px;">
        <div class="container">
            <div class="header">
                <h1>❄️ CoolTech Refrigeration</h1>
                <div class="tagline">Professional Cooling Solutions</div>
            </div>
            {$content}
            <div class="footer">
                <p><strong>CoolTech Refrigeration & Air Conditioning</strong></p>
                <p>{$_SERVER['COMPANY_ADDRESS'] ?? COMPANY_ADDRESS}</p>
                <p>
                    <a href="tel:+254707154948">+254 707 154 948</a> | 
                    <a href="tel:+254719110722">+254 719 110 722</a>
                </p>
                <p><a href="mailto:info@cooltechrefrigeration.co.ke">info@cooltechrefrigeration.co.ke</a></p>
                <div class="divider"></div>
                <p style="font-size: 11px;">© {$year} CoolTech Refrigeration. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>
</html>
HTML;
}

/**
 * Quote confirmation email for customer
 */
function getQuoteConfirmationEmail($data) {
    $name = htmlspecialchars($data['name']);
    $quoteId = $data['id'];
    $requestType = ucfirst($data['requestType']);
    $products = is_array($data['products']) ? implode(', ', $data['products']) : ($data['products'] ?? 'N/A');
    $services = is_array($data['services']) ? implode(', ', $data['services']) : ($data['services'] ?? 'N/A');
    
    $content = <<<HTML
<div class="content">
    <p class="greeting">Dear {$name},</p>
    
    <p class="message">
        Thank you for requesting a quote from CoolTech Refrigeration & Air Conditioning. 
        We have received your inquiry and our team will review it promptly.
    </p>
    
    <div class="ref-number">Quote Reference: #CTQ-{$quoteId}</div>
    
    <div class="info-box">
        <h3>📋 Your Request Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
            <tr><td class="info-label">Request Type:</td><td class="info-value">{$requestType}</td></tr>
            <tr><td class="info-label">Products:</td><td class="info-value">{$products}</td></tr>
            <tr><td class="info-label">Services:</td><td class="info-value">{$services}</td></tr>
        </table>
    </div>
    
    <p class="message">
        <strong>What happens next?</strong><br>
        Our team will review your requirements and contact you within 24-48 business hours 
        with a detailed quotation tailored to your needs.
    </p>
    
    <p class="message">
        If you have any urgent queries, please don't hesitate to contact us:
    </p>
    
    <p style="text-align: center;">
        <a href="tel:+254707154948" class="cta-button">📞 Call Us Now</a>
    </p>
    
    <div class="divider"></div>
    
    <p style="color: #888; font-size: 13px;">
        This is an automated confirmation email. Please do not reply directly to this email.
    </p>
</div>
HTML;

    return getEmailWrapper($content, "Quote Request #CTQ-{$quoteId} Received - We'll contact you shortly");
}

/**
 * Booking confirmation email for customer
 */
function getBookingConfirmationEmail($data) {
    $name = htmlspecialchars($data['name']);
    $bookingId = $data['id'];
    $service = htmlspecialchars($data['service']);
    $date = date('l, F j, Y', strtotime($data['preferredDate']));
    $time = htmlspecialchars($data['preferredTime']);
    $location = ucfirst($data['serviceLocation']);
    $address = htmlspecialchars($data['address']);
    
    $content = <<<HTML
<div class="content">
    <p class="greeting">Dear {$name},</p>
    
    <p class="message">
        Thank you for booking a service appointment with CoolTech Refrigeration & Air Conditioning. 
        Your booking has been received and is pending confirmation.
    </p>
    
    <div class="ref-number">Booking Reference: #CTB-{$bookingId}</div>
    
    <div class="info-box">
        <h3>📅 Appointment Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
            <tr><td class="info-label">Service:</td><td class="info-value">{$service}</td></tr>
            <tr><td class="info-label">Date:</td><td class="info-value">{$date}</td></tr>
            <tr><td class="info-label">Time:</td><td class="info-value">{$time}</td></tr>
            <tr><td class="info-label">Location Type:</td><td class="info-value">{$location}</td></tr>
            <tr><td class="info-label">Address:</td><td class="info-value">{$address}</td></tr>
        </table>
    </div>
    
    <p class="message">
        <strong>⏳ Pending Confirmation</strong><br>
        Our scheduling team will confirm your appointment within 24 hours. 
        You will receive a confirmation call or SMS with the technician details.
    </p>
    
    <p class="message">
        <strong>📝 Please Note:</strong>
    </p>
    <ul style="color: #4a4a4a;">
        <li>Ensure someone is available at the location during the scheduled time</li>
        <li>Have your equipment/unit accessible for inspection</li>
        <li>Contact us at least 4 hours before if you need to reschedule</li>
    </ul>
    
    <p style="text-align: center;">
        <a href="tel:+254707154948" class="cta-button">📞 Need to Reschedule?</a>
    </p>
    
    <div class="divider"></div>
    
    <p style="color: #888; font-size: 13px;">
        This is an automated confirmation email. Please do not reply directly to this email.
    </p>
</div>
HTML;

    return getEmailWrapper($content, "Booking #CTB-{$bookingId} Received - {$service} on {$date}");
}

/**
 * Contact form confirmation email for customer
 */
function getContactConfirmationEmail($data) {
    $name = htmlspecialchars($data['name']);
    $contactId = $data['id'];
    $subject = htmlspecialchars($data['subject']);
    
    $content = <<<HTML
<div class="content">
    <p class="greeting">Dear {$name},</p>
    
    <p class="message">
        Thank you for contacting CoolTech Refrigeration & Air Conditioning. 
        We have received your message and appreciate you reaching out to us.
    </p>
    
    <div class="ref-number">Reference: #CTC-{$contactId}</div>
    
    <div class="info-box">
        <h3>📧 Your Message</h3>
        <p><strong>Subject:</strong> {$subject}</p>
    </div>
    
    <p class="message">
        Our team will review your message and respond within 1-2 business days. 
        For urgent matters, please call us directly.
    </p>
    
    <p style="text-align: center;">
        <a href="tel:+254707154948" class="cta-button">📞 Call Us: +254 707 154 948</a>
    </p>
    
    <div class="divider"></div>
    
    <p style="color: #888; font-size: 13px;">
        This is an automated confirmation email. Please do not reply directly to this email.
    </p>
</div>
HTML;

    return getEmailWrapper($content, "We received your message - Reference #CTC-{$contactId}");
}

/**
 * Admin notification for new quote
 */
function getQuoteAdminEmail($data) {
    $name = htmlspecialchars($data['name']);
    $email = htmlspecialchars($data['email']);
    $phone = htmlspecialchars($data['phone']);
    $company = htmlspecialchars($data['company'] ?? 'N/A');
    $quoteId = $data['id'];
    $requestType = ucfirst($data['requestType']);
    $products = is_array($data['products']) ? implode(', ', $data['products']) : ($data['products'] ?? 'N/A');
    $services = is_array($data['services']) ? implode(', ', $data['services']) : ($data['services'] ?? 'N/A');
    $message = nl2br(htmlspecialchars($data['message']));
    $timestamp = date('F j, Y \a\t g:i A');
    
    $content = <<<HTML
<div class="content">
    <p class="greeting">🔔 New Quote Request Received</p>
    
    <div class="ref-number">Quote #CTQ-{$quoteId}</div>
    
    <p class="message">A new quote request has been submitted on {$timestamp}</p>
    
    <div class="info-box">
        <h3>👤 Customer Information</h3>
        <table style="width: 100%; border-collapse: collapse;">
            <tr><td class="info-label">Name:</td><td class="info-value">{$name}</td></tr>
            <tr><td class="info-label">Email:</td><td class="info-value"><a href="mailto:{$email}">{$email}</a></td></tr>
            <tr><td class="info-label">Phone:</td><td class="info-value"><a href="tel:{$phone}">{$phone}</a></td></tr>
            <tr><td class="info-label">Company:</td><td class="info-value">{$company}</td></tr>
        </table>
    </div>
    
    <div class="info-box">
        <h3>📋 Request Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
            <tr><td class="info-label">Request Type:</td><td class="info-value">{$requestType}</td></tr>
            <tr><td class="info-label">Products:</td><td class="info-value">{$products}</td></tr>
            <tr><td class="info-label">Services:</td><td class="info-value">{$services}</td></tr>
        </table>
        <p style="margin-top: 15px;"><strong>Message:</strong></p>
        <p style="background: #fff; padding: 15px; border-radius: 5px; border: 1px solid #e5e5e5;">{$message}</p>
    </div>
    
    <p style="text-align: center;">
        <a href="tel:{$phone}" class="cta-button">📞 Call Customer</a>
    </p>
</div>
HTML;

    return getEmailWrapper($content, "New Quote Request #CTQ-{$quoteId} from {$name}");
}

/**
 * Admin notification for new booking
 */
function getBookingAdminEmail($data) {
    $name = htmlspecialchars($data['name']);
    $email = htmlspecialchars($data['email']);
    $phone = htmlspecialchars($data['phone']);
    $company = htmlspecialchars($data['company'] ?? 'N/A');
    $bookingId = $data['id'];
    $service = htmlspecialchars($data['service']);
    $date = date('l, F j, Y', strtotime($data['preferredDate']));
    $time = htmlspecialchars($data['preferredTime']);
    $location = ucfirst($data['serviceLocation']);
    $address = htmlspecialchars($data['address']);
    $description = nl2br(htmlspecialchars($data['description'] ?? 'No additional notes'));
    $timestamp = date('F j, Y \a\t g:i A');
    
    $content = <<<HTML
<div class="content">
    <p class="greeting">📅 New Booking Request</p>
    
    <div class="ref-number">Booking #CTB-{$bookingId}</div>
    
    <p class="message">A new service booking has been submitted on {$timestamp}</p>
    
    <div class="info-box">
        <h3>👤 Customer Information</h3>
        <table style="width: 100%; border-collapse: collapse;">
            <tr><td class="info-label">Name:</td><td class="info-value">{$name}</td></tr>
            <tr><td class="info-label">Email:</td><td class="info-value"><a href="mailto:{$email}">{$email}</a></td></tr>
            <tr><td class="info-label">Phone:</td><td class="info-value"><a href="tel:{$phone}">{$phone}</a></td></tr>
            <tr><td class="info-label">Company:</td><td class="info-value">{$company}</td></tr>
        </table>
    </div>
    
    <div class="info-box">
        <h3>📋 Appointment Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
            <tr><td class="info-label">Service:</td><td class="info-value"><strong>{$service}</strong></td></tr>
            <tr><td class="info-label">Date:</td><td class="info-value"><strong>{$date}</strong></td></tr>
            <tr><td class="info-label">Time:</td><td class="info-value"><strong>{$time}</strong></td></tr>
            <tr><td class="info-label">Location Type:</td><td class="info-value">{$location}</td></tr>
            <tr><td class="info-label">Address:</td><td class="info-value">{$address}</td></tr>
        </table>
        <p style="margin-top: 15px;"><strong>Additional Notes:</strong></p>
        <p style="background: #fff; padding: 15px; border-radius: 5px; border: 1px solid #e5e5e5;">{$description}</p>
    </div>
    
    <p style="text-align: center;">
        <a href="tel:{$phone}" class="cta-button">📞 Call to Confirm</a>
    </p>
</div>
HTML;

    return getEmailWrapper($content, "New Booking #CTB-{$bookingId} - {$service} on {$date}");
}

/**
 * Admin notification for new contact message
 */
function getContactAdminEmail($data) {
    $name = htmlspecialchars($data['name']);
    $email = htmlspecialchars($data['email']);
    $phone = htmlspecialchars($data['phone'] ?? 'Not provided');
    $contactId = $data['id'];
    $subject = htmlspecialchars($data['subject']);
    $message = nl2br(htmlspecialchars($data['message']));
    $timestamp = date('F j, Y \a\t g:i A');
    
    $content = <<<HTML
<div class="content">
    <p class="greeting">📧 New Contact Message</p>
    
    <div class="ref-number">Reference #CTC-{$contactId}</div>
    
    <p class="message">A new contact form submission received on {$timestamp}</p>
    
    <div class="info-box">
        <h3>👤 Contact Information</h3>
        <table style="width: 100%; border-collapse: collapse;">
            <tr><td class="info-label">Name:</td><td class="info-value">{$name}</td></tr>
            <tr><td class="info-label">Email:</td><td class="info-value"><a href="mailto:{$email}">{$email}</a></td></tr>
            <tr><td class="info-label">Phone:</td><td class="info-value">{$phone}</td></tr>
        </table>
    </div>
    
    <div class="info-box">
        <h3>📝 Message</h3>
        <p><strong>Subject:</strong> {$subject}</p>
        <p style="background: #fff; padding: 15px; border-radius: 5px; border: 1px solid #e5e5e5; margin-top: 10px;">{$message}</p>
    </div>
    
    <p style="text-align: center;">
        <a href="mailto:{$email}?subject=Re: {$subject}" class="cta-button">📧 Reply to Customer</a>
    </p>
</div>
HTML;

    return getEmailWrapper($content, "New Contact Message - {$subject}");
}
