# Deployment Guide for USSD Credit Platform

## Quick Demo Deployment (Recommended for Client Demos)

### Backend Deployment (Railway)

1. **Sign up for Railway** (railway.app)
2. **Connect your GitHub repository**
3. **Deploy automatically** - Railway will detect Python and deploy

**Environment Variables to set in Railway:**
```bash
FLASK_ENV=production
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET_KEY=your_jwt_secret
CORS_ORIGINS=https://your-frontend-domain.vercel.app
```

### Frontend Deployment (Vercel)

1. **Sign up for Vercel** (vercel.com)
2. **Connect your GitHub repository**
3. **Set build settings:**
   - Build Command: `npm run build`
   - Output Directory: `build`
   - Install Command: `npm install`

**Environment Variables to set in Vercel:**
```bash
REACT_APP_API_URL=https://your-railway-backend.railway.app
```

## Production Deployment

### Option 1: VPS (DigitalOcean/Linode)

1. **Create a VPS** ($5-10/month)
2. **Install Docker and Docker Compose**
3. **Use the docker-compose.yml file**

### Option 2: AWS/GCP

1. **Use App Engine or Elastic Beanstalk**
2. **Set up RDS for PostgreSQL**
3. **Use CloudFront for frontend**

## Step-by-Step Railway Deployment

1. **Push your code to GitHub**
2. **Go to railway.app and sign up**
3. **Click "New Project" → "Deploy from GitHub repo"**
4. **Select your repository**
5. **Railway will auto-detect Python and deploy**
6. **Set environment variables**
7. **Get your deployment URL**

## Step-by-Step Vercel Deployment

1. **Push your code to GitHub**
2. **Go to vercel.com and sign up**
3. **Click "New Project"**
4. **Import your GitHub repository**
5. **Set environment variables**
6. **Deploy**

## Environment Configuration

### Backend (.env)
```bash
FLASK_ENV=production
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET_KEY=your-super-secret-key
CORS_ORIGINS=https://your-frontend-domain.com
```

### Frontend (.env)
```bash
REACT_APP_API_URL=https://your-backend-domain.com
```

## Database Setup

### Option 1: Railway PostgreSQL
- Railway provides managed PostgreSQL
- Set DATABASE_URL in environment variables

### Option 2: External Database
- Use Supabase, PlanetScale, or AWS RDS
- Update DATABASE_URL accordingly

## Custom Domain Setup

### Backend (Railway)
1. **Add custom domain in Railway dashboard**
2. **Update DNS records**
3. **Update CORS_ORIGINS**

### Frontend (Vercel)
1. **Add custom domain in Vercel dashboard**
2. **Update DNS records**
3. **Update REACT_APP_API_URL**

## Monitoring & Maintenance

- **Railway**: Built-in monitoring and logs
- **Vercel**: Analytics and performance monitoring
- **Health checks**: `/health` endpoint for backend monitoring

## Cost Estimation

- **Railway**: Free tier + $5-20/month for production
- **Vercel**: Free tier + $20/month for custom domains
- **Database**: $5-20/month depending on size
- **Total**: $10-40/month for full production setup
