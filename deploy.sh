#!/bin/bash

echo "🚀 USSD Credit Platform Deployment Script"
echo "=========================================="

# Check if git is clean
if [[ -n $(git status --porcelain) ]]; then
    echo "❌ Git working directory is not clean. Please commit or stash your changes."
    exit 1
fi

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Current branch: $CURRENT_BRANCH"

# Ask for deployment type
echo ""
echo "Choose deployment type:"
echo "1) Railway Backend + Vercel Frontend (Recommended for demos)"
echo "2) Docker Compose (Local/VPS)"
echo "3) Production VPS"
read -p "Enter your choice (1-3): " DEPLOY_CHOICE

case $DEPLOY_CHOICE in
    1)
        echo ""
        echo "🚂 Railway + Vercel Deployment"
        echo "=============================="
        echo "1. Push your code to GitHub:"
        echo "   git push origin $CURRENT_BRANCH"
        echo ""
        echo "2. Deploy Backend on Railway:"
        echo "   - Go to railway.app"
        echo "   - Connect your GitHub repo"
        echo "   - Set environment variables:"
        echo "     FLASK_ENV=production"
        echo "     DATABASE_URL=your_postgresql_url"
        echo "     JWT_SECRET_KEY=your_secret_key"
        echo "     CORS_ORIGINS=https://your-frontend-domain.vercel.app"
        echo ""
        echo "3. Deploy Frontend on Vercel:"
        echo "   - Go to vercel.com"
        echo "   - Import your GitHub repo"
        echo "   - Set environment variable:"
        echo "     REACT_APP_API_URL=https://your-railway-backend.railway.app"
        echo ""
        echo "4. Update CORS_ORIGINS with your Vercel domain"
        ;;
    2)
        echo ""
        echo "🐳 Docker Compose Deployment"
        echo "============================"
        echo "1. Build and start services:"
        echo "   docker-compose up --build -d"
        echo ""
        echo "2. Check services:"
        echo "   docker-compose ps"
        echo ""
        echo "3. View logs:"
        echo "   docker-compose logs -f"
        echo ""
        echo "4. Stop services:"
        echo "   docker-compose down"
        ;;
    3)
        echo ""
        echo "🖥️  Production VPS Deployment"
        echo "=============================="
        echo "1. Set up VPS (DigitalOcean/Linode)"
        echo "2. Install Docker and Docker Compose"
        echo "3. Copy project files to VPS"
        echo "4. Set environment variables"
        echo "5. Run: docker-compose -f docker-compose.prod.yml up -d"
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "✅ Deployment instructions displayed above!"
echo "📚 For detailed instructions, see DEPLOYMENT.md"
