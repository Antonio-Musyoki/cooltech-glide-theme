# CoolTech Refrigeration - PHP Backend Setup for cPanel

## Quick Setup (5 minutes)

### Step 1: Create Database
1. Log into cPanel → **MySQL Databases**
2. Create a new database (e.g., `cooltech_db`)
3. Create a new user with a strong password
4. Add user to database with **ALL PRIVILEGES**

### Step 2: Run SQL Schema
1. Go to cPanel → **phpMyAdmin**
2. Select your new database
3. Click **Import** tab
4. Upload `database-schema.sql` file
5. Click **Go** to execute

### Step 3: Configure API
Edit `config.php` and update these values:
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'your_cpanel_username_cooltech_db');
define('DB_USER', 'your_cpanel_username_dbuser');
define('DB_PASS', 'your_database_password');
define('ADMIN_EMAIL', 'your-email@domain.com');
```

### Step 4: Upload Files
Upload the entire `api` folder to your `public_html` directory.

### Step 5: Test
Visit `https://yourdomain.com/api/quotes.php` - should return `{"success":true,"data":[]}`

---

## Default Admin Login
- **Username:** admin
- **Password:** admin123
- ⚠️ **CHANGE THIS IMMEDIATELY** after first login!

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/quotes.php` | POST | Submit quote request |
| `/api/bookings.php` | POST | Submit booking |
| `/api/contact.php` | POST | Submit contact form |
| `/api/admin/auth.php` | POST | Admin login |
| `/api/admin/dashboard.php` | GET | Dashboard stats |
| `/api/admin/quotes.php` | GET/PUT | Manage quotes |
| `/api/admin/bookings.php` | GET/PUT | Manage bookings |
| `/api/admin/contacts.php` | GET/PUT | Manage contacts |

---

## File Structure
```
public/api/
├── config.php              # Database & email config
├── database-schema.sql     # SQL to create tables
├── quotes.php              # Quote submissions
├── bookings.php            # Booking submissions
├── contact.php             # Contact form
├── send-email.php          # Email service
├── email-templates.php     # HTML email templates
└── admin/
    ├── auth.php            # Admin authentication
    ├── dashboard.php       # Stats & overview
    ├── quotes.php          # Quote management
    ├── bookings.php        # Booking management
    └── contacts.php        # Contact management
```

---

## Email Configuration

Update `send-email.php` for your domain:
```php
define('SMTP_FROM_NAME', 'CoolTech Refrigeration');
define('SMTP_FROM_EMAIL', 'noreply@yourdomain.com');
```

---

## Troubleshooting

**"Database connection failed"**
- Check DB credentials in `config.php`
- Ensure user has privileges on the database
- Note: cPanel database names are prefixed with your username (e.g., `username_cooltech_db`)

**Emails not sending**
- Check `ADMIN_EMAIL` in `config.php`
- Your hosting must support PHP `mail()` function
- Check spam folders

**CORS errors**
- Already configured in `config.php` and `.htaccess`
- If issues persist, check `.htaccess` is uploaded

---

## Deployment Checklist

- [ ] Create MySQL database in cPanel
- [ ] Import `database-schema.sql` via phpMyAdmin
- [ ] Update `config.php` with database credentials
- [ ] Upload `api` folder to `public_html`
- [ ] Test API endpoint in browser
- [ ] Change default admin password
- [ ] Configure email settings
