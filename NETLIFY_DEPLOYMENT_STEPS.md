# Netlify Deployment Steps - Meyden Demo

## 🚀 Quick Deploy to Netlify

Your project is **already configured** and ready to deploy! Here's your step-by-step guide:

### Step 1: Deploy Frontend to Netlify

#### Option A: GitHub Integration (Recommended)

1. **Push code to GitHub:**
   ```bash
   # Initialize git if not already done
   git init
   git add .
   git commit -m "Ready for Netlify deployment"
   git branch -M main
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Deploy to Netlify:**
   - Go to [netlify.com](https://netlify.com) and sign in
   - Click "New site from Git"
   - Connect your GitHub repository
   - **Select the `meyden-demo` folder as the root directory**
   - Configure build settings:
     - **Build command:** `npm run build`
     - **Publish directory:** `out`
     - **Node version:** `18`

3. **Set Environment Variables in Netlify:**
   In Netlify dashboard → Site settings → Environment variables, add:
   ```
   NEXT_PUBLIC_API_BASE_URL=http://localhost:3002
   NEXT_PUBLIC_APP_ENV=development
   NEXT_PUBLIC_APP_URL=https://your-site-name.netlify.app
   ```

#### Option B: Manual Deploy with Netlify CLI

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Deploy:**
   ```bash
   cd meyden-demo
   netlify deploy --prod --dir=out
   ```

### Step 2: Deploy Backend (Recommended: Railway)

1. **Prepare for production:**
   ```bash
   cd backend
   npm install --production
   ```

2. **Deploy to Railway:**
   - Go to [railway.app](https://railway.app)
   - Connect your GitHub repository
   - Select the `backend` folder
   - Add PostgreSQL service
   - Set environment variables:
     ```
     NODE_ENV=production
     DATABASE_URL=${{Postgres.DATABASE_URL}}
     JWT_SECRET=your-super-secret-jwt-key
     PORT=3002
     CORS_ORIGIN=https://your-netlify-site.netlify.app
     ```

3. **Run migrations:**
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

### Step 3: Update Frontend Environment

After backend deployment, update the Netlify environment variable:
```
NEXT_PUBLIC_API_BASE_URL=https://your-backend-api.railway.app
```

### Step 4: Test End-to-End

1. Visit your Netlify site
2. Try the demo functionality:
   - Login: `admin@meyden.com` / `admin123`
   - Browse vendors
   - Take AI readiness surveys

## 📋 Current Status

✅ **Frontend Ready:** Static build successful  
✅ **Configuration:** `netlify.toml` configured  
✅ **API Service:** Uses environment variables  
✅ **Backend:** Running locally on port 3002  

## 🎯 Demo Accounts

- **Admin:** `admin@meyden.com` / `admin123`
- **Vendor:** `vendor@meyden.com` / `vendor123`
- **User:** `user@meyden.com` / `user123`

## 🔧 Troubleshooting

**Build fails:**
- Check Node.js version (should be 18+)
- Verify all dependencies in package.json

**API calls fail:**
- Update `NEXT_PUBLIC_API_BASE_URL` in Netlify environment variables
- Check CORS settings in backend

**Database issues:**
- Ensure PostgreSQL is set up on Railway
- Run migrations: `npx prisma migrate deploy`

## 📊 Architecture Summary

- **Frontend:** Next.js static export → Netlify
- **Backend:** Express.js API → Railway/Render  
- **Database:** SQLite (dev) / PostgreSQL (prod)
- **CDN:** Global distribution via Netlify

---

**🎉 Estimated deployment time:** 15-30 minutes  
**💰 Cost:** Free tier available (Netlify + Railway)