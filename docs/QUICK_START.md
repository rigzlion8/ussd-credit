# Quick Start Guide - Authentication System

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Modern web browser

### Step 1: Install Dependencies
```bash
cd ussd-credit
npm install
```

### Step 2: Start Mock API Server
```bash
npm run mock-api
```
This starts the mock API server at `http://localhost:3001`

### Step 3: Start Frontend Development Server
```bash
npm start
```
This starts the React app at `http://localhost:3000`

### Step 4: Test Authentication

#### Option A: Use Test Accounts
Navigate to `http://localhost:3000/auth` and use these test credentials:

| Email | Password | User Type | Features |
|-------|----------|-----------|----------|
| `admin@ussd.com` | `admin123` | Admin | Full access, user management |
| `john@example.com` | `john123` | Subscribed | Premium features, dashboard |
| `jane@example.com` | `jane123` | User | Basic features, limited access |
| `guest@example.com` | `guest123` | Guest | View only, no dashboard |

#### Option B: Create New Account
1. Go to `http://localhost:3000/auth`
2. Click "Create a new account"
3. Fill in your details
4. Submit the form

### Step 5: Explore Features

#### Admin User (admin@ussd.com)
- **Dashboard**: `/admin` - System overview
- **User Management**: `/admin/users` - Manage all users
- **Navigation**: Full access to all features

#### Subscribed User (john@example.com)
- **Dashboard**: `/subscriber` - Subscription management
- **Profile**: `/profile` - User profile settings
- **Features**: Premium subscription features

#### Regular User (jane@example.com)
- **Dashboard**: `/dashboard` - Basic influencer dashboard
- **Profile**: `/profile` - User profile settings
- **Features**: Basic platform features

#### Guest User (guest@example.com)
- **Home**: `/` - Public content only
- **Features**: Limited to public viewing

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

Edit `.env` with your settings:
```bash
# Google OAuth (optional for testing)
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id

# API Configuration
REACT_APP_API_BASE_URL=http://localhost:8001
REACT_APP_MOCK_API_URL=http://localhost:3001
```

### Google OAuth Setup (Optional)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. Add `http://localhost:3000` to authorized origins
4. Copy Client ID to `.env` file

## 🧪 Testing Scenarios

### 1. Authentication Flow
- [ ] User registration
- [ ] Email/password login
- [ ] Google OAuth (if configured)
- [ ] Logout functionality

### 2. Route Protection
- [ ] Access protected routes when logged out
- [ ] Access admin routes with different user types
- [ ] Automatic redirects

### 3. User Management (Admin)
- [ ] View all users
- [ ] Toggle user status
- [ ] Change user types
- [ ] Search and filter users

### 4. Profile Management
- [ ] Update user information
- [ ] Change password
- [ ] Upload avatar
- [ ] Manage preferences

## 🐛 Troubleshooting

### Common Issues

#### Mock API Not Starting
```bash
# Check if port 3001 is available
lsof -i :3001

# Kill process if needed
kill -9 <PID>

# Restart mock API
npm run mock-api
```

#### Frontend Not Starting
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for port conflicts
lsof -i :3000
```

#### Authentication Errors
- Check browser console for errors
- Verify mock API is running
- Check network tab for failed requests
- Clear browser localStorage and cookies

### Debug Mode
Enable detailed logging:
```bash
# In .env file
REACT_APP_DEBUG=true
```

## 📱 Mobile Testing

### Responsive Design
- Test on different screen sizes
- Use browser dev tools mobile view
- Test touch interactions

### Performance
- Check loading times
- Monitor network requests
- Test offline functionality

## 🔒 Security Testing

### Authentication
- Test with invalid credentials
- Test expired tokens
- Test unauthorized access

### Input Validation
- Test with malicious inputs
- Test SQL injection attempts
- Test XSS vulnerabilities

## 📊 Monitoring

### Development Tools
- React Developer Tools
- Redux DevTools (if using Redux)
- Network tab in browser
- Console logging

### Performance Metrics
- Page load times
- API response times
- Bundle sizes
- Memory usage

## 🚀 Next Steps

### After Testing
1. **Customize**: Modify user types and permissions
2. **Extend**: Add new authentication methods
3. **Integrate**: Connect to real backend APIs
4. **Deploy**: Prepare for production deployment

### Production Checklist
- [ ] Environment variables configured
- [ ] HTTPS enabled
- [ ] Error logging implemented
- [ ] Performance monitoring
- [ ] Security audit completed
- [ ] Backup strategy in place

## 📚 Additional Resources

### Documentation
- [Authentication System](AUTHENTICATION.md)
- [API Documentation](API.md)
- [Component Library](COMPONENTS.md)

### External Resources
- [React Documentation](https://reactjs.org/)
- [JWT.io](https://jwt.io/)
- [Google OAuth](https://developers.google.com/identity/protocols/oauth2)
- [Tailwind CSS](https://tailwindcss.com/)

## 🤝 Support

### Getting Help
- Check the troubleshooting section above
- Review browser console for errors
- Check network tab for failed requests
- Review authentication documentation

### Contributing
- Report bugs with detailed steps
- Suggest improvements
- Submit pull requests
- Help improve documentation
