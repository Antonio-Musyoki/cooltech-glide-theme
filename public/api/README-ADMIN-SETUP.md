# Admin Panel Backend Setup Guide

This guide explains how to set up the admin panel backend on your cPanel hosting.

## Database Schema Updates

Add these tables to your existing MySQL database:

```sql
-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    is_active TINYINT(1) DEFAULT 1,
    last_login DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Admin sessions table
CREATE TABLE IF NOT EXISTS admin_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(64) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE CASCADE
);

-- Add status columns to existing tables if not exists
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS status ENUM('pending', 'reviewed', 'quoted', 'closed') DEFAULT 'pending';
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

ALTER TABLE contacts ADD COLUMN IF NOT EXISTS status ENUM('unread', 'read', 'replied') DEFAULT 'unread';
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Add more columns to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS images JSON;
ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
```

## Create First Admin User

Run this SQL to create your first admin user. **Change the password!**

```sql
-- Generate password hash in PHP: password_hash('your_password', PASSWORD_DEFAULT)
-- Example with password 'admin123' (CHANGE THIS!)
INSERT INTO admin_users (username, password_hash, name, email) VALUES (
    'admin',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: 'password'
    'Admin User',
    'admin@yoursite.com'
);
```

To generate your own password hash, create a temporary PHP file:

```php
<?php
echo password_hash('your_secure_password', PASSWORD_DEFAULT);
?>
```

## Directory Structure

Upload the admin PHP files to your cPanel:

```
public_html/
├── api/
│   ├── config.php (existing)
│   ├── .htaccess (existing)
│   ├── admin/
│   │   ├── .htaccess
│   │   ├── auth.php
│   │   ├── products.php
│   │   ├── quotes.php
│   │   ├── bookings.php
│   │   ├── contacts.php
│   │   ├── dashboard.php
│   │   └── upload.php
│   └── ...
├── uploads/
│   └── products/  (create this directory, chmod 755)
└── ...
```

## File Permissions

Set proper permissions:

```bash
chmod 755 public_html/api/admin/
chmod 644 public_html/api/admin/*.php
chmod 755 public_html/uploads/
chmod 755 public_html/uploads/products/
```

## API Endpoints

### Authentication

**POST /api/admin/auth**
```json
// Login
{ "action": "login", "username": "admin", "password": "your_password" }

// Logout
{ "action": "logout", "token": "your_token" }

// Verify token
{ "action": "verify", "token": "your_token" }
```

### Dashboard

**GET /api/admin/dashboard**
- Requires: `Authorization: Bearer {token}` header
- Returns: stats, recent quotes, bookings, contacts

### Products CRUD

**GET /api/admin/products** - List all products
**GET /api/admin/products?id=1** - Get single product
**POST /api/admin/products** - Create product
**PUT /api/admin/products** - Update product
**DELETE /api/admin/products?id=1** - Delete product

All require `Authorization: Bearer {token}` header except GET.

### Quotes Management

**GET /api/admin/quotes** - List all quotes
**GET /api/admin/quotes?status=pending** - Filter by status
**PUT /api/admin/quotes** - Update quote status
**DELETE /api/admin/quotes?id=1** - Delete quote

### Bookings Management

**GET /api/admin/bookings** - List all bookings
**GET /api/admin/bookings?status=pending** - Filter by status
**PUT /api/admin/bookings** - Update booking status
**DELETE /api/admin/bookings?id=1** - Delete booking

### Contacts Management

**GET /api/admin/contacts** - List all contacts
**GET /api/admin/contacts?status=unread** - Filter by status
**PUT /api/admin/contacts** - Update contact status
**DELETE /api/admin/contacts?id=1** - Delete contact

### Image Upload

**POST /api/admin/upload** - Upload product image (multipart/form-data)
**DELETE /api/admin/upload?filename=xxx.jpg** - Delete image

## Security Notes

1. **Change default password immediately** after creating admin user
2. Consider adding **rate limiting** for login attempts
3. Use **HTTPS** in production
4. Sessions expire after **24 hours**
5. Tokens are stored with expiration timestamps
6. Image uploads are validated for type and size

## Troubleshooting

### CORS Issues
Ensure `.htaccess` files have proper CORS headers set.

### 500 Errors
Check PHP error logs in cPanel > Error Log.

### Upload Failures
- Check `uploads/products/` directory exists and has write permissions
- Verify PHP `upload_max_filesize` and `post_max_size` in php.ini
