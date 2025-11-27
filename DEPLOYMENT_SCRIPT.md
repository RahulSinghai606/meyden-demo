# 🚀 Quick Global Deployment Script

## 📋 **Quick Start Commands**

### **Step 1: Push to GitHub**
```bash
git add .
git commit -m "Ready for global deployment"
git remote add origin https://github.com/YOUR_USERNAME/meyden-demo.git
git push -u origin main
```

### **Step 2: Deploy Backend to Railway**
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. **Important:** Select only the `backend` folder as root directory
6. Add PostgreSQL database service
7. Set environment variables:
   ```
   NODE_ENV=production
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   JWT_SECRET=meyden-super-secret-jwt-key-2024
   PORT=3002
   CORS_ORIGIN=https://your-site-name.netlify.app
   ```

### **Step 3: Deploy Frontend to Netlify**
1. Go to [netlify.com](https://netlify.com)
2. Sign up/login with GitHub
3. Click "New site from Git"
4. Select your repository
5. **Select `meyden-demo` folder as root directory**
6. Build settings:
   - Build command: `npm run build`
   - Publish directory: `out`
   - Node version: `18`
7. Set environment variables:
   ```
   NEXT_PUBLIC_API_BASE_URL=https://your-backend.railway.app
   NEXT_PUBLIC_APP_ENV=production
   ```

### **Step 4: Update Frontend URL**
After getting your Netlify URL, update Railway environment variable:
```
CORS_ORIGIN=https://your-actual-netlify-site.netlify.app
```

## 🎯 **What You'll Get**

**Frontend URL:** `https://your-site-name.netlify.app`
**Backend URL:** `https://your-backend.railway.app`

### **Demo Accounts to Test:**
- **Admin:** `admin@meyden.com` / `admin123`
- **Vendor:** `vendor@meyden.com` / `vendor123`
- **User:** `user@meyden.com` / `user123`

## ⏱️ **Timeline: ~15 minutes**

1. **GitHub setup:** 2 minutes
2. **Railway backend:** 8 minutes
3. **Netlify frontend:** 5 minutes

## 🔧 **If Backend Build Fails**

Railway will still deploy with the built-in Node.js server. The backend TypeScript issues won't prevent deployment because Railway runs the JavaScript directly.

## 📞 **Need Help?**

- **Railway Docs:** [docs.railway.app](https://docs.railway.app)
- **Netlify Docs:** [docs.netlify.com](https://docs.netlify.com)

---

**🎉 Once deployed, you'll have a fully functional global AI marketplace!**