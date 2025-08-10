# 🚀 Quick Start: Deploy in 10 Minutes

## For Client Demo (Recommended)

### 1. Backend on Railway (5 minutes)
```bash
# 1. Go to railway.app and sign up
# 2. Click "New Project" → "Deploy from GitHub repo"
# 3. Select your repository
# 4. Add environment variables (see .env.railway.example):
SECRET_KEY=your-super-secret-key
JWT_SECRET_KEY=your-jwt-secret-key
FLASK_ENV=production
FLASK_DEBUG=false
CORS_ALLOW_ORIGINS=https://your-frontend.vercel.app
# Railway provides DATABASE_URL automatically
```

### 2. Frontend on Vercel (5 minutes)
```bash
# 1. Go to vercel.com and sign up
# 2. Click "New Project" → "Import Git Repository"
# 3. Select your repository
# 4. Add environment variable:
REACT_APP_API_URL=https://your-railway-backend.railway.app
```

### 3. Update CORS
```bash
# In Railway dashboard, update CORS_ALLOW_ORIGINS with your Vercel domain
```

## Alternative: Local Docker Demo

```bash
# 1. Install Docker and Docker Compose
# 2. Run the deployment script
./deploy.sh

# 3. Choose option 2 (Docker Compose)
# 4. Follow the displayed instructions
```

## What You Get

- ✅ **Backend API**: `https://your-app.railway.app`
- ✅ **Frontend**: `https://your-app.vercel.app`
- ✅ **Database**: Managed PostgreSQL
- ✅ **SSL**: Automatic HTTPS
- ✅ **Monitoring**: Built-in analytics

## Next Steps

1. **Custom Domain**: Add your domain in Railway/Vercel dashboards
2. **Environment Variables**: Update with production values
3. **Database**: Migrate data if needed
4. **Monitoring**: Set up alerts and logging

## Support

- 📚 **Full Guide**: See `DEPLOYMENT.md`
- 🐳 **Docker**: See `docker-compose.yml`
- 🚀 **Script**: Run `./deploy.sh`

