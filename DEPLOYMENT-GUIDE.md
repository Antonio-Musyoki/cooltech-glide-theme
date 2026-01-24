# CoolTech Refrigeration - cPanel Deployment Guide (with Lovable Cloud Backend)

This guide covers deploying your React frontend to cPanel while using Lovable Cloud (Supabase) as your backend.

---

## Architecture Overview

```
┌─────────────────────┐     ┌──────────────────────────┐
│   cPanel Hosting    │     │    Lovable Cloud         │
│   (Frontend Only)   │────▶│    (Backend Services)    │
│                     │     │                          │
│  - React App        │     │  - PostgreSQL Database   │
│  - Static Assets    │     │  - Authentication        │
│  - .htaccess        │     │  - File Storage          │
└─────────────────────┘     │  - Edge Functions        │
                            └──────────────────────────┘
```

---

## Prerequisites

- cPanel hosting account with:
  - File Manager or FTP access
  - `.htaccess` support (mod_rewrite enabled)
- Node.js installed locally for building
- Your Lovable Cloud project (already configured)

---

## Step 1: Configure Environment Variables

Before building, ensure your `.env` file has the correct Supabase credentials. These are automatically configured by Lovable Cloud:

```env
VITE_SUPABASE_URL=https://muvetrottqdwodisomew.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key_here
```

> **Note:** These credentials are safe to include in your frontend build - they only allow access based on your Row Level Security (RLS) policies.

---

## Step 2: Build the React App

Run these commands locally:

```bash
# Install dependencies
npm install

# Build for production
npm run build
```

This creates a `dist/` folder with your production-ready files.

---

## Step 3: Upload Files to cPanel

### Option A: Using File Manager

1. Go to cPanel → **File Manager**
2. Navigate to `public_html` (or your subdomain folder)
3. **Delete existing files** (if replacing an old site)
4. Upload all files from your local `dist/` folder
5. Make sure `index.html` is at the root of `public_html`

### Option B: Using FTP (FileZilla)

1. Connect to your server:
   - Host: `ftp.yourdomain.com`
   - Username: Your cPanel username
   - Password: Your cPanel password
   - Port: `21`

2. Navigate to `public_html`
3. Upload contents of `dist/` folder

### File Structure After Upload

```
public_html/
├── index.html          # React app entry point
├── assets/             # JS, CSS, images (auto-generated)
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── ...
├── favicon.ico
├── robots.txt
└── .htaccess           # For React Router (see Step 4)
```

---

## Step 4: Create .htaccess for React Router

Create `.htaccess` in `public_html/` with this content:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # Don't rewrite files or directories
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  
  # Rewrite everything else to index.html
  RewriteRule ^ index.html [L]
</IfModule>

# Security headers
<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "SAMEORIGIN"
  Header set X-XSS-Protection "1; mode=block"
</IfModule>

# Caching for assets
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType font/woff2 "access plus 1 year"
</IfModule>

# Gzip compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/css application/javascript application/json image/svg+xml
</IfModule>
```

---

## Step 5: Configure SSL (HTTPS)

**Important:** Supabase requires HTTPS for secure connections.

1. Go to cPanel → **SSL/TLS** or **Let's Encrypt**
2. Install a free SSL certificate for your domain
3. Enable **Force HTTPS** redirect

---

## Step 6: Test Your Deployment

1. **Visit your website**: `https://yourdomain.com`
2. **Test navigation**: Click through all pages (should work without 404)
3. **Test forms**: Submit a quote request or booking
4. **Test admin login**: `https://yourdomain.com/admin`
5. **Test data**: Verify products load from the database

---

## Troubleshooting

### 404 Errors on Page Refresh

- Ensure `.htaccess` is uploaded to `public_html/`
- Check `mod_rewrite` is enabled in cPanel
- Verify `.htaccess` file isn't hidden by your FTP client

### Blank White Page

- Check browser console for errors (F12)
- Verify all files from `dist/` were uploaded
- Ensure `index.html` is at the root

### API/Database Errors

- Check browser Network tab for failed requests
- Verify Supabase URL is correct in the build
- Ensure your domain has HTTPS enabled
- Check RLS policies allow the operation

### CORS Errors

If you see CORS errors in the console:
1. Go to Lovable Cloud settings
2. Add your custom domain to allowed origins
3. Wait a few minutes for changes to propagate

### Images Not Loading

- Product images are stored in Supabase Storage
- Verify the `products` storage bucket is public
- Check image URLs in browser Network tab

---

## Updating Your Site

When you make changes in Lovable:

1. **Backend changes** (database, auth, functions): Deploy automatically
2. **Frontend changes**: Need to rebuild and re-upload

### Quick Update Process

```bash
# Pull latest changes (if using Git)
git pull

# Rebuild
npm run build

# Upload new dist/ folder to cPanel
```

---

## Custom Domain with Lovable

Alternatively, you can use Lovable's built-in hosting:

1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS to point to Lovable
4. SSL is automatic

This eliminates the need for cPanel hosting entirely!

---

## Security Checklist

- [x] Supabase credentials are publishable (safe for frontend)
- [ ] HTTPS is enabled on your domain
- [ ] RLS policies are configured for all tables
- [ ] Admin authentication is working
- [ ] Test all forms submit correctly
- [ ] Verify sensitive data isn't exposed

---

## Architecture Benefits

| Feature | Lovable Cloud | cPanel |
|---------|--------------|--------|
| Database | ✅ PostgreSQL | ❌ Not needed |
| Authentication | ✅ Supabase Auth | ❌ Not needed |
| File Storage | ✅ Supabase Storage | ❌ Not needed |
| Edge Functions | ✅ Serverless | ❌ Not needed |
| Frontend Hosting | Optional | ✅ Static files |
| Custom Domain | ✅ Supported | ✅ Supported |

---

## Need Help?

- **Lovable Docs**: https://docs.lovable.dev
- **Supabase Docs**: https://supabase.com/docs
- **React Router Docs**: https://reactrouter.com
