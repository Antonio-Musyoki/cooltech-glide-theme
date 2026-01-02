# CoolTech Refrigeration - cPanel Deployment Guide

## Prerequisites
- cPanel hosting account
- FTP client (FileZilla) or cPanel File Manager
- Node.js installed locally for building

---

## Step 1: Build the React App

Run these commands locally:

```bash
# Install dependencies
npm install

# Build for production
npm run build
```

This creates a `dist/` folder with your production-ready files.

---

## Step 2: Set Up Database in cPanel

1. **Log into cPanel** → **MySQL Databases**
2. **Create database**: `cooltech_db` (will become `username_cooltech_db`)
3. **Create user** with a strong password
4. **Add user to database** with **ALL PRIVILEGES**

### Import Database Schema

1. Go to **phpMyAdmin** in cPanel
2. Select your database
3. Click **Import** tab
4. Upload `public/api/database-schema.sql`
5. Click **Go**

---

## Step 3: Configure PHP Backend

Edit `public/api/config.php` before uploading:

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'username_cooltech_db');  // Replace 'username' with your cPanel username
define('DB_USER', 'username_dbuser');        // Replace with your database user
define('DB_PASS', 'your_secure_password');   // Replace with your database password
define('ADMIN_EMAIL', 'info@yourdomain.com'); // Your admin email
```

---

## Step 4: Upload Files to cPanel

### Option A: Using File Manager

1. Go to cPanel → **File Manager**
2. Navigate to `public_html` (or your subdomain folder)
3. Upload all files from your local `dist/` folder
4. Create an `api/` folder inside `public_html`
5. Upload all files from `public/api/` to the `api/` folder

### Option B: Using FTP (FileZilla)

1. Connect to your server:
   - Host: `ftp.yourdomain.com`
   - Username: Your cPanel username
   - Password: Your cPanel password
   - Port: `21`

2. Navigate to `public_html`
3. Upload contents of `dist/` folder
4. Upload `public/api/` folder as `api/`

### File Structure After Upload

```
public_html/
├── index.html          # React app entry point
├── assets/             # JS, CSS, images
├── api/                # PHP backend
│   ├── .htaccess
│   ├── config.php
│   ├── quotes.php
│   ├── bookings.php
│   ├── contact.php
│   ├── products.php
│   ├── services.php
│   ├── send-email.php
│   ├── email-templates.php
│   └── admin/
│       ├── auth.php
│       ├── dashboard.php
│       ├── products.php
│       ├── quotes.php
│       ├── bookings.php
│       ├── contacts.php
│       └── upload.php
└── ...other assets
```

---

## Step 5: Create .htaccess for React Router

Create `.htaccess` in `public_html/` (not the api folder):

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # Don't rewrite API requests
  RewriteRule ^api/ - [L]
  
  # Don't rewrite files or directories
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  
  # Rewrite everything else to index.html
  RewriteRule ^ index.html [L]
</IfModule>

# Caching for assets
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>

# Gzip compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/css application/javascript application/json
</IfModule>
```

---

## Step 6: Update API URL in React

Before building, update `src/config/api.ts` with your production domain:

```typescript
const API_BASE_URL = 'https://yourdomain.com/api';
```

---

## Step 7: Test Your Deployment

1. **Visit your website**: `https://yourdomain.com`
2. **Test API**: `https://yourdomain.com/api/quotes.php` → Should return `{"success":true,"data":[]}`
3. **Test forms**: Submit a quote request
4. **Test admin**: `https://yourdomain.com/admin` → Login with `admin` / `admin123`

---

## Step 8: Security Checklist

- [ ] Change default admin password immediately
- [ ] Update `config.php` with real database credentials
- [ ] Ensure `.htaccess` files are uploaded
- [ ] Verify HTTPS is working (SSL certificate)
- [ ] Test all forms submit correctly
- [ ] Check emails are being received

---

## Troubleshooting

### 404 Errors on Page Refresh
- Ensure `.htaccess` is uploaded to `public_html/`
- Check `mod_rewrite` is enabled in cPanel

### API Returns 500 Error
- Check `config.php` database credentials
- Verify database user has correct privileges
- Check PHP error logs in cPanel

### Emails Not Sending
- Verify `ADMIN_EMAIL` in `config.php`
- Check hosting supports PHP `mail()`
- Look in spam folders

### CORS Errors
- Ensure `api/.htaccess` is uploaded
- Check `config.php` CORS headers

---

## Git Deployment (Optional)

If using cPanel Git Version Control:

1. Push code to GitHub
2. In cPanel → **Git Version Control** → Create
3. Clone your repository
4. The `.cpanel.yml` file auto-deploys on push

---

## Default Admin Credentials

⚠️ **CHANGE IMMEDIATELY AFTER FIRST LOGIN**

- **Username:** `admin`
- **Password:** `admin123`

To change: Login to admin panel → Settings → Change Password
