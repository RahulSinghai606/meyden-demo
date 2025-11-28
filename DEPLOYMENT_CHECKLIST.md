# 📋 Quick Reference - Deployment Checklist

## 🚀 Your Deployment Checklist

Follow this checklist to deploy your Meyden platform:

### ✅ Step 1: GitHub Setup (5 min)
- [ ] Create GitHub repository
- [ ] Push your code to GitHub
- [ ] Verify both `backend` and `meyden-demo` folders are uploaded

### ✅ Step 2: Free Accounts (5 min)
- [ ] Sign up at https://planetscale.com (database)
- [ ] Sign up at https://railway.app (backend)
- [ ] Sign up at https://vercel.com (frontend)

### ✅ Step 3: Database Setup (5 min)
- [ ] Create new database in PlanetScale
- [ ] Get connection string (looks like: `mysql://username:password@host/database?sslaccept=strict`)

### ✅ Step 4: Backend Deployment (10 min)
- [ ] Create new project in Railway
- [ ] Connect GitHub repository
- [ ] Select `backend` folder
- [ ] Add environment variables
- [ ] Wait for deployment success
- [ ] Copy your backend URL (e.g., `https://your-app.railway.app`)

### ✅ Step 5: Frontend Deployment (8 min)
- [ ] Create new project in Vercel
- [ ] Connect GitHub repository
- [ ] Select `meyden-demo` folder
- [ ] Add environment variables with your backend URL
- [ ] Wait for deployment success
- [ ] Copy your frontend URL (e.g., `https://your-app.vercel.app`)

### ✅ Step 6: Update CORS (3 min)
- [ ] Go back to Railway
- [ ] Update `CORS_ORIGIN` with your frontend URL
- [ ] Redeploy backend

### ✅ Step 7: Test Everything (5 min)
- [ ] Visit backend health check: `https://your-backend.railway.app/health`
- [ ] Visit frontend: `https://your-frontend.vercel.app`
- [ ] Test login/register functionality
- [ ] Verify API endpoints work

### ✅ Step 8: Auto-Deployment Test (2 min)
- [ ] Make a small change to your code
- [ ] Push to GitHub: `git add . && git commit -m "test" && git push`
- [ ] Wait 2-3 minutes for both deployments
- [ ] Verify changes appear live

## 🎯 Key URLs You'll Get:

**After Step 4:** `https://your-backend.railway.app` (Your API)
**After Step 5:** `https://your-frontend.vercel.app` (Your website)
**Health Check:** `https://your-backend.railway.app/health`

## 🔧 Environment Variables Needed:

**Railway (Backend):**
```
NODE_ENV=production
DATABASE_URL=your-planetscale-connection-string
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=your-refresh-secret-min-32-chars
REFRESH_TOKEN_EXPIRES_IN=30d
CORS_ORIGIN=https://your-frontend.vercel.app
PORT=3001
```

**Vercel (Frontend):**
```
NEXT_PUBLIC_API_BASE_URL=https://your-backend.railway.app
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_APP_URL=https://your-frontend.vercel.app
```

## 💰 Total Cost: $0/month

- **Railway:** $5 free credit
- **Vercel:** Free for personal projects
- **PlanetScale:** 1B reads/month free
- **GitHub:** Free unlimited repositories

## 🚨 If Something Goes Wrong:

**Backend not starting:**
- Check Railway deployment logs
- Verify DATABASE_URL is correct
- Ensure all environment variables are set

**Frontend not building:**
- Check Vercel build logs
- Verify NEXT_PUBLIC_API_BASE_URL points to your Railway URL

**Database connection errors:**
- Test with: `npx prisma db ping`
- Reset if needed: `npx prisma migrate reset`

## 🎉 Success Indicators:

- ✅ Backend health check returns `{"status":"OK"}`
- ✅ Frontend website loads successfully
- ✅ GitHub push automatically triggers deployments
- ✅ Login/register functionality works
- ✅ API calls from frontend succeed

**Once you complete all steps, your Meyden platform will be live and auto-deploying!** 🚀

---

**Next Step:** Open `STEP_BY_STEP_DEPLOYMENT.md` and follow the detailed instructions!