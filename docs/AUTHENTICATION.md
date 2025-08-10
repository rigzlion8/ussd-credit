# Authentication System Documentation

## Overview

The USSD AutoPay platform implements a comprehensive authentication system with multiple user types, JWT tokens, and Google SSO integration.

## User Types

### 1. Guest User
- **Access Level**: Limited
- **Features**: Basic browsing, view public content
- **Registration**: Free signup
- **Verification**: None required

### 2. Free User
- **Access Level**: Basic
- **Features**: Basic dashboard, limited subscriptions
- **Registration**: Free signup with email verification
- **Verification**: Email verification required

### 3. Subscribed User (Premium)
- **Access Level**: Enhanced
- **Features**: Full dashboard, unlimited subscriptions, priority support
- **Registration**: Free signup with full verification
- **Verification**: Email + Phone verification required

### 4. Admin User
- **Access Level**: Full system access
- **Features**: User management, system monitoring, all administrative functions
- **Registration**: Invitation only
- **Verification**: Full verification + admin approval

## Authentication Flow

### 1. Registration Process
```
User Input → Validation → Account Creation → Verification → Login
```

**Registration Fields:**
- Email (required, unique)
- Password (min 8 chars, uppercase + lowercase + number)
- First Name (required)
- Last Name (required)
- Phone Number (optional, for premium features)

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

### 2. Login Process
```
Email/Password → Validation → JWT Generation → Token Storage → Redirect
```

**Login Options:**
- Email + Password
- Google OAuth (SSO)

### 3. Google OAuth Integration
```
Google Login → Token Exchange → User Info Fetch → Backend Verification → JWT Generation
```

**OAuth Scopes:**
- `openid` - OpenID Connect
- `email` - User email address
- `profile` - User profile information

## Security Features

### 1. JWT Token Management
- **Algorithm**: HS256 (HMAC SHA256)
- **Expiration**: Configurable (default: 24 hours)
- **Storage**: Secure HTTP-only cookies + localStorage fallback
- **Refresh**: Automatic token refresh on API calls

### 2. Password Security
- **Hashing**: bcrypt with salt rounds
- **Validation**: Strong password requirements
- **Storage**: Never stored in plain text

### 3. Route Protection
- **Protected Routes**: Require authentication
- **Role-based Access**: Different user types have different permissions
- **Automatic Redirects**: Unauthorized users redirected to login

## API Endpoints

### Authentication Endpoints
```
POST /api/auth/register     - User registration
POST /api/auth/login        - User login
POST /api/auth/google       - Google OAuth login
GET  /api/auth/profile      - Get user profile
PUT  /api/auth/profile      - Update user profile
POST /api/auth/logout       - User logout
POST /api/auth/refresh      - Refresh JWT token
POST /api/auth/verify-email - Verify email address
POST /api/auth/verify-phone - Verify phone number
```

### User Management Endpoints (Admin Only)
```
GET    /api/admin/users     - List all users
GET    /api/admin/users/:id - Get user details
PUT    /api/admin/users/:id - Update user
DELETE /api/admin/users/:id - Delete user
POST   /api/admin/users/:id/activate   - Activate user
POST   /api/admin/users/:id/deactivate - Deactivate user
```

## Frontend Components

### 1. AuthContext
- **Location**: `src/contexts/AuthContext.tsx`
- **Purpose**: Global authentication state management
- **Features**: Login, logout, user state, token management

### 2. LoginForm
- **Location**: `src/components/auth/LoginForm.tsx`
- **Features**: Email/password login, Google OAuth, form validation

### 3. RegisterForm
- **Location**: `src/components/auth/RegisterForm.tsx`
- **Features**: User registration, password confirmation, validation

### 4. GoogleAuthButton
- **Location**: `src/components/auth/GoogleAuthButton.tsx`
- **Features**: Google OAuth integration, error handling

### 5. ProtectedRoute
- **Location**: `src/components/auth/ProtectedRoute.tsx`
- **Features**: Route protection, role-based access control

## Configuration

### Environment Variables
```bash
# Required
REACT_APP_GOOGLE_CLIENT_ID=your-google-oauth-client-id

# Optional
REACT_APP_API_BASE_URL=http://localhost:8001
REACT_APP_JWT_SECRET_KEY=your-jwt-secret
```

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized origins and redirect URIs
6. Copy Client ID to environment variables

## Development Setup

### 1. Install Dependencies
```bash
npm install @react-oauth/google axios react-router-dom
```

### 2. Start Mock API
```bash
npm run mock-api
```

### 3. Configure Environment
```bash
cp .env.example .env
# Edit .env with your Google OAuth Client ID
```

### 4. Start Development Server
```bash
npm start
```

## Testing Authentication

### Test Users
```json
{
  "admin@ussd.com": "admin",
  "john@example.com": "subscribed",
  "jane@example.com": "user",
  "guest@example.com": "guest"
}
```

### Test Scenarios
1. **Guest Registration**: Create new account
2. **User Login**: Test email/password authentication
3. **Google OAuth**: Test SSO integration
4. **Role Access**: Test different user type permissions
5. **Admin Functions**: Test user management features

## Security Best Practices

### 1. Frontend
- Never store sensitive data in localStorage
- Use HTTPS in production
- Implement proper error handling
- Validate all user inputs

### 2. Backend
- Use environment variables for secrets
- Implement rate limiting
- Log authentication attempts
- Regular security audits

### 3. General
- Keep dependencies updated
- Use strong password policies
- Implement account lockout
- Monitor for suspicious activity

## Troubleshooting

### Common Issues

#### 1. Google OAuth Not Working
- Check Client ID configuration
- Verify authorized origins
- Check browser console for errors

#### 2. JWT Token Expired
- Check token expiration settings
- Implement automatic refresh
- Clear localStorage and re-login

#### 3. Route Protection Issues
- Verify user authentication state
- Check user type permissions
- Ensure ProtectedRoute is properly configured

### Debug Mode
Enable debug logging by setting:
```bash
REACT_APP_DEBUG=true
```

## Future Enhancements

### Planned Features
- [ ] Two-factor authentication (2FA)
- [ ] Password reset functionality
- [ ] Account deletion
- [ ] Social login (Facebook, Twitter)
- [ ] Biometric authentication
- [ ] Session management
- [ ] Audit logging

### Security Improvements
- [ ] Rate limiting
- [ ] IP whitelisting
- [ ] Advanced threat detection
- [ ] Compliance certifications (GDPR, CCPA)
