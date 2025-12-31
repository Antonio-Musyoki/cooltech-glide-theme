# PHP Backend API Reference for CoolTech

This React frontend expects a REST API at `/api/` endpoints. Below are the PHP files you need to create on your cPanel hosting.

## Directory Structure

```
public_html/
├── api/
│   ├── .htaccess
│   ├── config.php
│   ├── email-templates.php   # HTML email templates
│   ├── send-email.php        # Email sending service
│   ├── products.php
│   ├── services.php
│   ├── quotes.php
│   ├── bookings.php
│   ├── contact.php
│   └── admin/
│       ├── .htaccess
│       ├── auth.php
│       ├── dashboard.php
│       ├── products.php
│       ├── quotes.php
│       ├── bookings.php
│       ├── contacts.php
│       └── upload.php
└── (React build files)
```

## Email Notification System

The API includes an automated email notification system that sends:

### Customer Confirmations
- **Quote requests**: Professional HTML email confirming receipt with reference number
- **Booking requests**: Appointment details with date, time, and next steps
- **Contact form**: Acknowledgment with expected response time

### Admin Notifications
- Real-time alerts for all new submissions
- Customer contact details with click-to-call/email buttons
- Full submission details in formatted HTML emails

### Email Configuration

Update these values in `send-email.php`:

```php
define('SMTP_FROM_NAME', 'CoolTech Refrigeration');
define('SMTP_FROM_EMAIL', 'noreply@cooltechrefrigeration.co.ke');
define('ADMIN_NOTIFICATION_EMAIL', 'info@cooltechrefrigeration.co.ke');
```

### Email Testing

To test email functionality on cPanel:
1. Ensure PHP `mail()` function is enabled
2. Check that your domain has proper SPF/DKIM records
3. Test with a valid email address
4. Check spam folders if emails don't arrive
5. Review PHP error logs for any mail() failures

## .htaccess (Enable API routing)

```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.php [QSA,L]

# CORS Headers
Header set Access-Control-Allow-Origin "*"
Header set Access-Control-Allow-Methods "GET, POST, OPTIONS"
Header set Access-Control-Allow-Headers "Content-Type"
```

## config.php

```php
<?php
// Database configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'your_database_name');
define('DB_USER', 'your_username');
define('DB_PASS', 'your_password');

// Email configuration
define('ADMIN_EMAIL', 'info@cooltechrefrigeration.co.ke');
define('SMTP_HOST', 'mail.cooltechrefrigeration.co.ke');

// CORS headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database connection
function getDB() {
    try {
        $pdo = new PDO(
            "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME,
            DB_USER,
            DB_PASS,
            [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
        );
        return $pdo;
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Database connection failed']);
        exit();
    }
}

// JSON response helper
function jsonResponse($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data);
    exit();
}
```

## Database Schema (MySQL)

```sql
-- Products table
CREATE TABLE products (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NULL,
    description TEXT,
    image VARCHAR(500),
    is_quote_only BOOLEAN DEFAULT FALSE,
    tags JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Services table
CREATE TABLE services (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    features JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quotes table
CREATE TABLE quotes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    company VARCHAR(255),
    request_type ENUM('product', 'service', 'both') NOT NULL,
    products JSON,
    services JSON,
    message TEXT,
    status ENUM('pending', 'contacted', 'quoted', 'closed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bookings table
CREATE TABLE bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    company VARCHAR(255),
    service_location ENUM('residential', 'commercial', 'industrial') NOT NULL,
    address TEXT NOT NULL,
    service VARCHAR(100) NOT NULL,
    preferred_date DATE NOT NULL,
    preferred_time VARCHAR(20) NOT NULL,
    description TEXT,
    status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contact messages table
CREATE TABLE contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status ENUM('unread', 'read', 'replied') DEFAULT 'unread',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## quotes.php

```php
<?php
require_once 'config.php';

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

// Sanitize input
$name = filter_var($input['name'], FILTER_SANITIZE_STRING);
$email = filter_var($input['email'], FILTER_SANITIZE_EMAIL);
$phone = filter_var($input['phone'], FILTER_SANITIZE_STRING);
$company = filter_var($input['company'] ?? '', FILTER_SANITIZE_STRING);
$requestType = $input['requestType'];
$products = json_encode($input['products'] ?? []);
$services = json_encode($input['services'] ?? []);
$message = filter_var($input['message'], FILTER_SANITIZE_STRING);

try {
    $db = getDB();
    $stmt = $db->prepare("
        INSERT INTO quotes (name, email, phone, company, request_type, products, services, message)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([$name, $email, $phone, $company, $requestType, $products, $services, $message]);
    
    $quoteId = $db->lastInsertId();
    
    // Send email notification
    $to = ADMIN_EMAIL;
    $subject = "New Quote Request #$quoteId from $name";
    $emailBody = "New quote request received:\n\n";
    $emailBody .= "Name: $name\n";
    $emailBody .= "Email: $email\n";
    $emailBody .= "Phone: $phone\n";
    $emailBody .= "Company: $company\n";
    $emailBody .= "Type: $requestType\n\n";
    $emailBody .= "Message:\n$message";
    
    mail($to, $subject, $emailBody, "From: noreply@cooltechrefrigeration.co.ke");
    
    jsonResponse(['success' => true, 'data' => ['id' => $quoteId]]);
    
} catch (Exception $e) {
    jsonResponse(['success' => false, 'error' => 'Failed to submit quote'], 500);
}
```

## bookings.php

```php
<?php
require_once 'config.php';

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

// Sanitize input
$name = filter_var($input['name'], FILTER_SANITIZE_STRING);
$email = filter_var($input['email'], FILTER_SANITIZE_EMAIL);
$phone = filter_var($input['phone'], FILTER_SANITIZE_STRING);
$company = filter_var($input['company'] ?? '', FILTER_SANITIZE_STRING);
$serviceLocation = $input['serviceLocation'];
$address = filter_var($input['address'], FILTER_SANITIZE_STRING);
$service = filter_var($input['service'], FILTER_SANITIZE_STRING);
$preferredDate = $input['preferredDate'];
$preferredTime = $input['preferredTime'];
$description = filter_var($input['description'] ?? '', FILTER_SANITIZE_STRING);

try {
    $db = getDB();
    $stmt = $db->prepare("
        INSERT INTO bookings (name, email, phone, company, service_location, address, service, preferred_date, preferred_time, description)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([$name, $email, $phone, $company, $serviceLocation, $address, $service, $preferredDate, $preferredTime, $description]);
    
    $bookingId = $db->lastInsertId();
    
    // Send email notification
    $to = ADMIN_EMAIL;
    $subject = "New Booking Request #$bookingId - $preferredDate at $preferredTime";
    $emailBody = "New service booking:\n\n";
    $emailBody .= "Name: $name\n";
    $emailBody .= "Email: $email\n";
    $emailBody .= "Phone: $phone\n";
    $emailBody .= "Service: $service\n";
    $emailBody .= "Date: $preferredDate at $preferredTime\n";
    $emailBody .= "Location: $serviceLocation - $address\n\n";
    $emailBody .= "Notes:\n$description";
    
    mail($to, $subject, $emailBody, "From: noreply@cooltechrefrigeration.co.ke");
    
    jsonResponse(['success' => true, 'data' => ['id' => $bookingId]]);
    
} catch (Exception $e) {
    jsonResponse(['success' => false, 'error' => 'Failed to book appointment'], 500);
}
```

## contact.php

```php
<?php
require_once 'config.php';

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

// Sanitize input
$name = filter_var($input['name'], FILTER_SANITIZE_STRING);
$email = filter_var($input['email'], FILTER_SANITIZE_EMAIL);
$phone = filter_var($input['phone'] ?? '', FILTER_SANITIZE_STRING);
$subject = filter_var($input['subject'], FILTER_SANITIZE_STRING);
$message = filter_var($input['message'], FILTER_SANITIZE_STRING);

try {
    $db = getDB();
    $stmt = $db->prepare("
        INSERT INTO contacts (name, email, phone, subject, message)
        VALUES (?, ?, ?, ?, ?)
    ");
    $stmt->execute([$name, $email, $phone, $subject, $message]);
    
    $contactId = $db->lastInsertId();
    
    // Send email notification
    $to = ADMIN_EMAIL;
    $emailSubject = "Contact Form: $subject";
    $emailBody = "New contact message:\n\n";
    $emailBody .= "From: $name <$email>\n";
    $emailBody .= "Phone: $phone\n";
    $emailBody .= "Subject: $subject\n\n";
    $emailBody .= "Message:\n$message";
    
    mail($to, $emailSubject, $emailBody, "From: noreply@cooltechrefrigeration.co.ke\nReply-To: $email");
    
    jsonResponse(['success' => true, 'data' => ['id' => $contactId]]);
    
} catch (Exception $e) {
    jsonResponse(['success' => false, 'error' => 'Failed to send message'], 500);
}
```

## products.php

```php
<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(['success' => false, 'error' => 'Method not allowed'], 405);
}

try {
    $db = getDB();
    
    // Check if requesting single product
    $id = $_GET['id'] ?? null;
    
    if ($id) {
        $stmt = $db->prepare("SELECT * FROM products WHERE id = ?");
        $stmt->execute([$id]);
        $product = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$product) {
            jsonResponse(['success' => false, 'error' => 'Product not found'], 404);
        }
        
        $product['tags'] = json_decode($product['tags']);
        jsonResponse(['success' => true, 'data' => $product]);
    } else {
        $stmt = $db->query("SELECT * FROM products ORDER BY category, name");
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($products as &$p) {
            $p['tags'] = json_decode($p['tags']);
        }
        
        jsonResponse(['success' => true, 'data' => $products]);
    }
    
} catch (Exception $e) {
    jsonResponse(['success' => false, 'error' => 'Failed to fetch products'], 500);
}
```

## Deployment Steps

1. **Build the React app**: Run `npm run build` in your Lovable project
2. **Upload to cPanel**: Upload the `dist/` folder contents to `public_html/`
3. **Create `/api/` folder**: Create the api folder and add the PHP files above
4. **Create MySQL database**: Use phpMyAdmin to create the database and run the SQL schema
5. **Update config.php**: Set your database credentials
6. **Configure .htaccess**: Ensure URL rewriting works for both React routing and API

## Environment Variable

Set `VITE_API_URL` in your `.env` file before building:
```
VITE_API_URL=https://yourdomain.com/api
```

Or leave it empty to use `/api` (relative path).
