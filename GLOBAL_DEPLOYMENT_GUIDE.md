# 🌐 Global Deployment Guide - Meyden Demo

## 🎯 **Deploy Both Frontend & Backend for Free**

This guide will help you deploy your Meyden AI Marketplace globally using free services so you can share it with anyone.

## 📋 **Deployment Plan**

### **Frontend (Netlify)**
- **Service:** Netlify (Free tier)
- **Features:** Global CDN, automatic HTTPS, custom domains
- **URL:** `https://your-site-name.netlify.app`

### **Backend (Railway)**
- **Service:** Railway (Free tier)
- **Features:** PostgreSQL database, automatic deployment
- **URL:** `https://your-backend.railway.app`

## 🚀 **Step-by-Step Deployment**

### **Part 1: Prepare Your Code**

1. **Create Production Environment File:**
   ```bash
   cd meyden-demo
   cat > .env.production << EOF
   NEXT_PUBLIC_API_BASE_URL=https://your-backend-url.railway.app
   NEXT_PUBLIC_APP_ENV=production
   NEXT_PUBLIC_APP_URL=https://your-site-name.netlify.app
   EOF
   ```

2. **Create Backend Production Environment:**
   ```bash
   cd backend
   cat > .env.production << EOF
   NODE_ENV=production
   DATABASE_URL=postgresql://user:password@host:5432/database
   JWT_SECRET=your-super-secret-jwt-key-$(date +%s)
   PORT=3002
   CORS_ORIGIN=https://your-site-name.netlify.app
   EOF
   ```

### **Part 2: Deploy Backend to Railway**

#### **Option A: GitHub + Railway (Recommended)**

1. **Push to GitHub:**
   ```bash
   # If not already done
   git init
   git add .
   git commit -m "Ready for global deployment"
   git remote add origin https://github.com/yourusername/meyden-demo.git
   git branch -M main
   git push -u origin main
   ```

2. **Deploy Backend to Railway:**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - **Important:** Select only the `backend` folder as root directory
   - Railway will auto-detect it as a Node.js project

3. **Add PostgreSQL Database:**
   - In Railway dashboard, click "New" → "Database" → "PostgreSQL"
   - Railway will provide a `DATABASE_URL` environment variable

4. **Set Environment Variables in Railway:**
   ```
   NODE_ENV=production
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   JWT_SECRET=your-super-secret-jwt-key-$(date +%s)
   PORT=3002
   CORS_ORIGIN=https://your-site-name.netlify.app
   ```

5. **Run Database Migrations:**
   ```bash
   # In Railway dashboard, open the backend service
   # Go to "Settings" → "Variables" → Add these:
   MIGRATION_COMMAND=npx prisma migrate deploy
   SEED_COMMAND=npx prisma db seed
   ```

#### **Alternative: Direct Railway CLI**

```bash
npm install -g @railway/cli
railway login
cd backend
railway deploy
```

### **Part 3: Deploy Frontend to Netlify**

#### **Option A: GitHub + Netlify (Recommended)**

1. **Deploy to Netlify:**
   - Go to [netlify.com](https://netlify.com)
   - Sign up/login with GitHub
   - Click "New site from Git"
   - Connect your GitHub repository
   - **Select the `meyden-demo` folder as root directory**
   - Build settings:
     - Build command: `npm run build`
     - Publish directory: `out`
     - Node version: `18`

2. **Set Environment Variables in Netlify:**
   ```
   NEXT_PUBLIC_API_BASE_URL=https://your-backend.railway.app
   NEXT_PUBLIC_APP_ENV=production
   NEXT_PUBLIC_APP_URL=https://your-site-name.netlify.app
   ```

3. **Deploy!**

#### **Option B: Netlify CLI**

```bash
npm install -g netlify-cli
cd meyden-demo
netlify deploy --prod --dir=out
```

### **Part 4: Test Your Deployment**

1. **Backend Health Check:**
   ```
   https://your-backend.railway.app/health
   ```

2. **Frontend Test:**
   - Visit your Netlify URL
   - Try logging in with demo accounts:
     - Admin: `admin@meyden.com` / `admin123`
     - Vendor: `vendor@meyden.com` / `vendor123`
     - User: `user@meyden.com` / `user123`

## 🔧 **Troubleshooting**

### **Backend Issues**
- **Database Connection:** Ensure PostgreSQL is added in Railway
- **Port Issues:** Railway uses process.env.PORT automatically
- **CORS Errors:** Update CORS_ORIGIN to your Netlify URL

### **Frontend Issues**
- **Build Fails:** Check Node.js version (should be 18+)
- **API Calls Fail:** Update NEXT_PUBLIC_API_BASE_URL in Netlify
- **Environment Variables:** Make sure they're set in Netlify dashboard

### **Common Commands**

```bash
# Check backend logs in Railway
railway logs

# Redeploy backend
railway deploy

# Test API locally
curl https://your-backend.railway.app/health

# Check Netlify build logs
netlify deploy --prod --dir=out --debug
```

## 📱 **Share Your Demo**

Once deployed, you can share these URLs:

**Frontend:** `https://your-site-name.netlify.app`
**Backend API:** `https://your-backend.railway.app`

### **Demo Features to Show:**

1. **Homepage:** Modern landing page with animations
2. **Authentication:** Login with different user roles
3. **Admin Dashboard:** Vendor management and analytics
4. **Vendor Dashboard:** Business management interface
5. **AI Readiness Assessment:** Interactive survey with results
6. **Vendor Marketplace:** Browse and search vendors

## 🎯 **Expected Deployment Timeline**

- **Backend Deployment:** 5-10 minutes
- **Frontend Deployment:** 2-5 minutes
- **Database Setup:** 2-3 minutes
- **Environment Configuration:** 5 minutes
- **Total:** ~15-25 minutes

## 💰 **Free Tier Limits**

### **Railway (Backend)**
- $5 free credit monthly
- 512MB RAM
- 1GB disk space
- Unlimited deployments

### **Netlify (Frontend)**
- 100GB bandwidth
- 300 build minutes
- Unlimited personal sites
- Global CDN

## 🔒 **Security Notes**

- JWT secrets should be unique and secure
- Environment variables contain sensitive data
- CORS is properly configured for your domain
- Database connections are encrypted

---

**🎉 Your Meyden AI Marketplace will be live and accessible worldwide!**

Need help? Each service has excellent documentation and community support.