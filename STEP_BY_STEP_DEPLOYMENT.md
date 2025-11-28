# 🚀 Step-by-Step Deployment Guide for Meyden Platform

Follow these exact steps to deploy your Meyden platform completely for free:

## 📋 Prerequisites Checklist

Before starting, ensure you have:
- [ ] GitHub account
- [ ] Your code pushed to a GitHub repository
- [ ] Both backend and frontend folders in your repo

---

## Step 1: Create Free Accounts (5 minutes)

### 1.1 GitHub Repository Setup
```bash
# Initialize git in your project (if not already done)
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit - Meyden platform"

# Create GitHub repository on github.com
# Then connect your local repo:
git remote add origin https://github.com/yourusername/meyden-platform.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### 1.2 Sign Up for Free Services

**1. PlanetScale (Database)**
- Go to https://planetscale.com
- Click "Sign up" → "Continue with GitHub"
- Authorize PlanetScale to access your GitHub

**2. Railway (Backend Hosting)**
- Go to https://railway.app  
- Click "Login" → "Login with GitHub"
- Authorize Railway to access your GitHub

**3. Vercel (Frontend Hosting)**
- Go to https://vercel.com
- Click "Sign Up" → "Continue with GitHub"
- Authorize Vercel to access your GitHub

---

## Step 2: Setup Free Database (5 minutes)

### 2.1 Create PlanetScale Database

1. **Login to PlanetScale**
   - Go to https://planetscale.com/dashboard
   - You should see your GitHub repositories

2. **Create New Database**
   - Click "Create a new database"
   - Database name: `meyden-database`
   - Region: Choose closest to your users
   - Click "Create database"

3. **Get Connection String**
   - Click on your new database
   - Go to "Connect" tab
   - Select "Prisma" from the dropdown
   - Copy the connection string
   - It looks like: `mysql://username:password@host/database?sslaccept=strict`

---

## Step 3: Deploy Backend to Railway (10 minutes)

### 3.1 Create New Railway Project

1. **Login to Railway**
   - Go to https://railway.app/dashboard
   - Click "New Project"

2. **Deploy from GitHub**
   - Select "Deploy from GitHub repo"
   - Find and select your `meyden-platform` repository
   - Railway will show all detected projects

3. **Configure Backend Deployment**
   - Railway should detect this is a Node.js project
   - Root Directory: Select the `backend` folder
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Click "Deploy Now"

### 3.2 Add Environment Variables

1. **Go to Railway Dashboard**
   - Click on your newly created backend service
   - Go to "Variables" tab

2. **Add Required Variables**
   
   Click "Add Variable" and add each one:

   ```
   NODE_ENV = production
   DATABASE_URL = mysql://username:password@host/database?sslaccept=strict
   JWT_SECRET = my-super-secret-jwt-key-1234567890123456
   JWT_EXPIRES_IN = 7d
   REFRESH_TOKEN_SECRET = my-refresh-token-secret-1234567890123456
   REFRESH_TOKEN_EXPIRES_IN = 30d
   CORS_ORIGIN = http://localhost:3000
   PORT = 3001
   ```

   **⚠️ Important:** Use your actual PlanetScale connection string for `DATABASE_URL`

### 3.3 Wait for Deployment

1. **Monitor Deployment**
   - Go to "Deployments" tab
   - You should see a deployment in progress
   - Click on it to see real-time logs
   - Wait for "Success" status (usually 3-5 minutes)

2. **Get Your Backend URL**
   - Go to "Settings" tab → "Domains"
   - You'll see a URL like: `https://meyden-backend-production-xyz.up.railway.app`
   - **Note this URL** - you'll need it for the frontend

---

## Step 4: Deploy Frontend to Vercel (8 minutes)

### 4.1 Create New Vercel Project

1. **Login to Vercel**
   - Go to https://vercel.com/dashboard
   - Click "Add New" → "Project"

2. **Import GitHub Repository**
   - Find your `meyden-platform` repository
   - Click "Import"

3. **Configure Frontend Deployment**
   - Framework Preset: `Next.js` (should auto-detect)
   - Root Directory: `./meyden-demo`
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `.next` (auto-detected)
   - Click "Deploy"

### 4.2 Add Environment Variables

1. **Go to Vercel Dashboard**
   - Click on your newly created frontend project
   - Go to "Settings" → "Environment Variables"

2. **Add Required Variables**
   
   Click "Add" and add each one:

   ```
   NEXT_PUBLIC_API_BASE_URL = https://meyden-backend-production-xyz.up.railway.app
   NEXT_PUBLIC_APP_ENV = production
   NEXT_PUBLIC_APP_URL = https://meyden-frontend-abc123.vercel.app
   ```

   **⚠️ Important:** 
   - Use your actual Railway backend URL for `NEXT_PUBLIC_API_BASE_URL`
   - Use your actual Vercel URL for `NEXT_PUBLIC_APP_URL` (you'll get this after deployment)

### 4.3 Redeploy with Environment Variables

1. **Trigger New Deployment**
   - Go to "Deployments" tab
   - Click "..." menu on the latest deployment
   - Select "Redeploy"
   - Wait for deployment to complete

2. **Get Your Frontend URL**
   - Note the URL like: `https://meyden-frontend-abc123.vercel.app`
   - **Visit this URL** to see your live website!

---

## Step 5: Update Environment Variables (3 minutes)

### 5.1 Update Railway CORS Setting

1. **Go back to Railway Dashboard**
   - Backend service → Variables tab
   - Find `CORS_ORIGIN`
   - Update it to your Vercel URL:
   ```
   CORS_ORIGIN = https://meyden-frontend-abc123.vercel.app
   ```

### 5.2 Trigger Backend Redeployment

1. **Redeploy Backend**
   - Go to "Deployments" tab
   - Click "..." → "Redeploy" 
   - Wait for success

---

## Step 6: Verify Your Deployment (5 minutes)

### 6.1 Test Backend Health

1. **Visit Backend Health Check**
   ```
   https://meyden-backend-production-xyz.up.railway.app/health
   ```
   You should see: `{"status":"OK"}`

2. **Test API Endpoint**
   ```
   https://meyden-backend-production-xyz.up.railway.app/api/v1/auth/test
   ```

### 6.2 Test Frontend

1. **Visit Your Live Website**
   ```
   https://meyden-frontend-abc123.vercel.app
   ```
   You should see your Meyden platform homepage!

2. **Test Key Features**
   - Login/Register functionality
   - Navigation between pages
   - API integration working

---

## Step 7: Setup Automatic Deployments (2 minutes)

### 7.1 GitHub Integration

**Railway Auto-Deploy:**
- ✅ Already configured - Railway watches your `main` branch
- Any push to `main` → automatic deployment

**Vercel Auto-Deploy:**
- ✅ Already configured - Vercel watches your `main` branch  
- Any push to `main` → automatic deployment

### 7.2 Test Auto-Deployment

1. **Make a Small Change**
   ```bash
   # Edit any file locally
   # For example, change a title in meyden-demo/src/app/page.tsx
   
   git add .
   git commit -m "Test auto-deployment"
   git push origin main
   ```

2. **Monitor Deployments**
   - Railway: Watch "Deployments" tab for new deployment
   - Vercel: Watch "Deployments" tab for new deployment
   - Both should complete in 2-3 minutes

3. **Verify Live Changes**
   - Visit your frontend URL
   - You should see your changes live!

---

## 🎉 Deployment Complete!

### ✅ What You Now Have:

**Live URLs:**
- **Backend API:** `https://meyden-backend-production-xyz.up.railway.app`
- **Frontend App:** `https://meyden-frontend-abc123.vercel.app`
- **Health Check:** `https://meyden-backend-production-xyz.up.railway.app/health`

**Automatic Features:**
- ✅ Every `git push` deploys both backend and frontend
- ✅ HTTPS enabled automatically
- ✅ Global CDN for fast loading
- ✅ Real-time logs and monitoring
- ✅ Automatic scaling

### 💰 Your Total Cost: $0/month

- **Railway:** $5 free credit (covers your usage)
- **Vercel:** 100% free for personal projects
- **PlanetScale:** 1 billion reads/month free
- **GitHub:** Unlimited private repositories

### 🔧 Management Commands:

```bash
# View database locally
npx prisma studio

# Check Railway logs
# (Visit Railway dashboard → Deployments → View Logs)

# Check Vercel logs  
# (Visit Vercel dashboard → Deployments → View Function Logs)

# Make and deploy changes
git add .
git commit -m "Your feature"
git push origin main
# Wait 2-3 minutes → Changes live!
```

### 🚨 Troubleshooting:

**Backend Issues:**
- Check Railway logs for errors
- Verify all environment variables are set
- Ensure DATABASE_URL is correct

**Frontend Issues:**
- Check Vercel build logs
- Verify NEXT_PUBLIC_API_BASE_URL points to your Railway URL
- Ensure all dependencies are installed

**Database Issues:**
- Test connection: `npx prisma db ping`
- Reset if needed: `npx prisma migrate reset`

---

## 🏆 Success!

Your Meyden platform is now:
- ✅ **Live and accessible** worldwide
- ✅ **Auto-deploying** with every code change
- ✅ **Production-ready** with security and performance
- ✅ **Completely free** to operate
- ✅ **Ready for users** to access

**Start building features and push to deploy instantly!** 🚀

---

## 📞 Need Help?

- **Railway Docs:** https://docs.railway.app
- **Vercel Docs:** https://vercel.com/docs
- **PlanetScale Docs:** https://planetscale.com/docs
- **Next.js Docs:** https://nextjs.org/docs

Good luck with your deployment! 🎉