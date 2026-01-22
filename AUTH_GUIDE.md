# Authentication System - Quick Guide

## Overview

Decyd now includes a complete authentication system that allows users to create accounts, log in, and have their food preferences tracked individually across sessions.

## Features

### 🔐 User Authentication
- **Sign Up**: Create new account with name, email, and password
- **Login**: Access your account with email and password
- **Remember Me**: Stay logged in for 30 days (vs 1 day default)
- **Logout**: Clear session and return to login page

### 👤 Multi-User Support
- Each user has isolated preference data
- Recommendations adapt to individual user history
- Multiple users can use the same browser

### 🔒 Session Management
- Automatic session expiration
- Secure token-based authentication
- Protected routes (redirects to login if not authenticated)

## How to Use

### First Time Users

1. Open the app → You'll see the **auth.html** login page
2. Click **"Sign up"** at the bottom
3. Enter your:
   - Full name
   - Email address
   - Password (minimum 6 characters)
   - Confirm password
4. Click **"Create Account"**
5. You'll be automatically logged in and redirected to the main app

### Returning Users

1. Open the app → You'll see the login page
2. Enter your email and password
3. (Optional) Check "Remember me" to stay logged in longer
4. Click **"Sign In"**
5. You'll be redirected to the main app with your preferences restored

### Logging Out

1. In the main app, look for your name in the header
2. Click the **"Logout"** button next to your name
3. Confirm the logout
4. You'll be redirected back to the login page

## Technical Details

### Data Storage

All data is stored in **localStorage**:

```javascript
// Users database
decyd_users: {
  "user_id_123": {
    "id": "user_id_123",
    "name": "John Doe",
    "email": "john@example.com",
    "password": "hashed_password",
    "createdAt": "2026-01-20T..."
  }
}

// Session
decyd_session: {
  "userId": "user_id_123",
  "token": "token_...",
  "expiresAt": "2026-01-21T...",
  "createdAt": "2026-01-20T..."
}

// User data (per user)
decyd_user_data_user_id_123: {
  "interactions": [...],
  "preferences": {...},
  "firstVisit": "...",
  "lastVisit": "..."
}
```

### Security Notes

> [!WARNING]
> **This is a demo/MVP implementation**
> - Passwords are stored in localStorage (NOT production-ready)
> - Simple base64 encoding (NOT secure hashing)
> - No email verification
> - No password recovery
> - Client-side only (no backend)

For production, you would need:
- Real backend with database
- Proper password hashing (bcrypt, argon2)
- HTTPS/SSL
- Email verification
- Password reset functionality
- Rate limiting
- CSRF protection

## Files Added

### Authentication Pages
- **auth.html** - Login/signup page
- **auth.css** - Authentication page styles
- **auth-app.js** - Auth page controller

### Core Logic
- **js/auth-manager.js** - Authentication manager class

### Modified Files
- **index.html** - Added auth-manager script
- **app.js** - Added auth check, user display, logout
- **js/user-tracker.js** - Added multi-user support
- **styles.css** - Added user info styles

## Testing the Flow

1. **Clear localStorage** (to start fresh):
   ```javascript
   localStorage.clear()
   ```

2. **Create first account**:
   - Name: Test User
   - Email: test@example.com
   - Password: test123

3. **Verify login works**:
   - Logout
   - Login with same credentials
   - Check that preferences are restored

4. **Test multiple users**:
   - Logout
   - Create second account
   - Make different food choices
   - Logout and login as first user
   - Verify preferences are isolated

## Future Enhancements

- [ ] Social login (Google, Facebook)
- [ ] Email verification
- [ ] Password reset via email
- [ ] Profile editing
- [ ] Account deletion
- [ ] Backend integration
- [ ] OAuth 2.0
- [ ] Two-factor authentication

---

**The authentication system is now fully functional and ready to use!**
