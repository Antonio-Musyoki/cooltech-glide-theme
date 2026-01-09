# Firebase Backend Setup Guide

This guide explains how to set up Firebase as the backend for CoolTech Refrigeration.

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **Add Project**
3. Enter project name: `cooltech-refrigeration`
4. Enable/disable Google Analytics as preferred
5. Click **Create Project**

## 2. Enable Firebase Services

### Authentication
1. Go to **Build → Authentication**
2. Click **Get Started**
3. Enable **Email/Password** sign-in method
4. Create your first admin user:
   - Click **Users** tab
   - Click **Add User**
   - Enter admin email and password (e.g., `admin@cooltechrefrigeration.co.ke`)

### Firestore Database
1. Go to **Build → Firestore Database**
2. Click **Create database**
3. Select **Start in test mode** (we'll add security rules later)
4. Choose a location closest to Kenya (e.g., `europe-west1`)
5. Click **Enable**

### Storage
1. Go to **Build → Storage**
2. Click **Get Started**
3. Accept default rules (we'll update later)
4. Choose the same location as Firestore

## 3. Get Firebase Configuration

1. Go to **Project Settings** (gear icon)
2. Under **Your apps**, click **Web** icon (`</>`)
3. Register app with nickname: `cooltech-web`
4. Copy the config object:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

## 4. Configure Environment Variables

Create a `.env` file in your project root:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

Or update `src/config/firebase.ts` directly with your values.

## 5. Create Admin Profile in Firestore

After creating an admin user in Authentication, create their profile in Firestore:

1. Go to **Firestore Database**
2. Click **Start collection**
3. Collection ID: `admins`
4. Document ID: (use the UID from Authentication)
5. Add fields:
   - `email`: your admin email (string)
   - `username`: "admin" (string)
   - `role`: "admin" (string)
   - `createdAt`: current timestamp (string)

## 6. Set Up Firestore Security Rules

Go to **Firestore Database → Rules** and add:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Admin users collection - only authenticated admins
    match /admins/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if false; // Admin profiles created manually
    }
    
    // Products - public read, admin write
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null && exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
    
    // Services - public read, admin write
    match /services/{serviceId} {
      allow read: if true;
      allow write: if request.auth != null && exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
    
    // Quotes - public create, admin read/update
    match /quotes/{quoteId} {
      allow create: if true;
      allow read, update, delete: if request.auth != null && exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
    
    // Bookings - public create, admin read/update
    match /bookings/{bookingId} {
      allow create: if true;
      allow read, update, delete: if request.auth != null && exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
    
    // Contacts - public create, admin read/update
    match /contacts/{contactId} {
      allow create: if true;
      allow read, update, delete: if request.auth != null && exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
  }
}
```

## 7. Set Up Storage Security Rules

Go to **Storage → Rules** and add:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Products images - public read, admin write
    match /products/{fileName} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // General uploads - admin only
    match /uploads/{fileName} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## 8. Seed Initial Products (Optional)

You can import the existing products by running the seeder in the browser console:

```javascript
// In browser console after logging in as admin
import { productsFirebase } from './services/firebaseService';
import { products } from './data/products';

for (const product of products) {
  const { id, ...productData } = product;
  await productsFirebase.create(productData);
  console.log(`Created: ${product.name}`);
}
```

Or manually add products through the admin dashboard.

## 9. Deploy to Hosting (Optional)

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init`
4. Select **Hosting**
5. Set public directory to `dist`
6. Configure as SPA: Yes
7. Build: `npm run build`
8. Deploy: `firebase deploy`

## Features Enabled

✅ **Authentication** - Email/password admin login  
✅ **Firestore** - Products, quotes, bookings, contacts database  
✅ **Storage** - Image uploads for products  
✅ **Security Rules** - Protected admin operations  

## Switching Between PHP and Firebase

The app maintains both backends:
- PHP backend files are in `public/api/` (kept as backup)
- Firebase services are in `src/services/firebaseService.ts`

To use Firebase:
1. Update `src/App.tsx` to use `FirebaseAuthProvider`
2. Update admin pages to import from `firebaseService` instead of `adminService`

## Cloud Functions (Optional)

For email notifications, create Firebase Cloud Functions:

1. `firebase init functions`
2. Create functions for:
   - New quote notification
   - New booking notification
   - Contact form notification

Example function:
```typescript
// functions/src/index.ts
import * as functions from 'firebase-functions';
import * as nodemailer from 'nodemailer';

export const onNewQuote = functions.firestore
  .document('quotes/{quoteId}')
  .onCreate(async (snap, context) => {
    const quote = snap.data();
    // Send email notification
  });
```
