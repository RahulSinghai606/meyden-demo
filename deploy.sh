#!/bin/bash

# Meyden Platform - Free Deployment Script
# This script helps you deploy both backend and frontend for free

echo "🚀 Meyden Platform Free Deployment Script"
echo "=========================================="

# Check if GitHub repository exists
echo "📋 Prerequisites Check:"
echo "1. ✅ GitHub repository created"
echo "2. ✅ Code pushed to GitHub"
echo ""

# Step 1: Backend Deployment
echo "🔧 Step 1: Deploy Backend to Railway"
echo "======================================"

echo "1. Go to https://railway.app"
echo "2. Sign up with GitHub"
echo "3. Click 'New Project' > 'Deploy from GitHub repo'"
echo "4. Select your repository"
echo "5. Choose the 'backend' folder"
echo ""

echo "Backend Configuration:"
echo "- Build Command: npm install && npm run build"
echo "- Start Command: npm start"
echo "- Root Directory: ./"
echo ""

echo "🔑 Add these Environment Variables in Railway:"
echo "NODE_ENV=production"
echo "DATABASE_URL=mysql://username:password@host/database?sslaccept=strict"
echo "JWT_SECRET=your-super-secret-jwt-key-min-32-characters"
echo "JWT_EXPIRES_IN=7d"
echo "REFRESH_TOKEN_SECRET=your-refresh-token-secret-min-32-characters"
echo "REFRESH_TOKEN_EXPIRES_IN=30d"
echo "CORS_ORIGIN=https://your-frontend-url.vercel.app"
echo ""

read -p "Press Enter when Railway deployment is complete and note the backend URL..."

# Step 2: Database Setup
echo ""
echo "🗄️  Step 2: Setup Free Database"
echo "==============================="
echo ""
echo "Option A - PlanetScale (Recommended):"
echo "1. Go to https://planetscale.com"
echo "2. Sign up with GitHub"
echo "3. Click 'Create Database'"
echo "4. Get connection string and update DATABASE_URL in Railway"
echo ""
echo "Option B - Supabase:"
echo "1. Go to https://supabase.com"
echo "2. Create new project"
echo "3. Get connection string from Settings > Database"
echo ""

read -p "Press Enter when database is setup..."

# Step 3: Frontend Deployment
echo ""
echo "🌐 Step 3: Deploy Frontend to Vercel"
echo "===================================="

echo "1. Go to https://vercel.com"
echo "2. Sign up with GitHub"
echo "3. Click 'New Project' > 'Import Git Repository'"
echo "4. Select your repository"
echo "5. Choose the 'meyden-demo' folder"
echo ""

echo "Frontend Configuration:"
echo "- Framework Preset: Next.js"
echo "- Root Directory: ./"
echo "- Build Command: npm run build (auto-detected)"
echo "- Output Directory: .next (auto-detected)"
echo ""

echo "🔑 Add these Environment Variables in Vercel:"
echo "NEXT_PUBLIC_API_BASE_URL=https://your-backend-url.railway.app"
echo "NEXT_PUBLIC_APP_ENV=production"
echo "NEXT_PUBLIC_APP_URL=https://your-frontend-url.vercel.app"
echo ""

read -p "Press Enter when Vercel deployment is complete..."

# Step 4: Update Environment Variables
echo ""
echo "🔄 Step 4: Update Environment Variables"
echo "======================================"
echo ""

echo "1. Go back to Railway dashboard"
echo "2. Update CORS_ORIGIN with your Vercel URL:"
echo "   CORS_ORIGIN=https://your-project-name.vercel.app"
echo ""

echo "2. Go back to Vercel dashboard"
echo "3. Update NEXT_PUBLIC_API_BASE_URL with your Railway URL:"
echo "   NEXT_PUBLIC_API_BASE_URL=https://your-project-name.railway.app"
echo ""

# Step 5: Final Verification
echo ""
echo "✅ Step 5: Verification"
echo "======================"
echo ""

echo "Test your deployment:"
echo "1. Backend Health Check:"
echo "   https://your-backend.railway.app/health"
echo ""
echo "2. Frontend Access:"
echo "   https://your-project.vercel.app"
echo ""
echo "3. Test API endpoints:"
echo "   https://your-backend.railway.app/api/v1/auth/test"
echo ""

echo "🎉 Deployment Complete!"
echo "======================"
echo ""
echo "Your Meyden platform is now live at:"
echo "- Backend: https://your-backend.railway.app"
echo "- Frontend: https://your-project.vercel.app"
echo ""
echo "Any changes pushed to GitHub will automatically deploy to both platforms!"
echo ""
echo "📚 For detailed troubleshooting, see FREE_DEPLOYMENT_GUIDE.md"