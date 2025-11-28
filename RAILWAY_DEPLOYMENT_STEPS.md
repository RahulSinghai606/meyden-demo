# 🚀 Railway Deployment Guide - Step by Step

## ✅ Changes Already Pushed to GitHub:
- PostgreSQL schema (updated from SQLite)
- Railway configuration files
- Deployment guides and documentation

## Step 1: Create Railway Account (2 minutes)

1. **Go to Railway**: https://railway.app
2. **Sign up**: Click "Login" → "Login with GitHub"
3. **Authorize**: Allow Railway to access your GitHub repositories
4. **Dashboard**: You'll see the Railway dashboard

## Step 2: Create New Railway Project (5 minutes)

1. **Click "New Project"**
2. **Select "Deploy from GitHub repo"**
3. **Find your repository**: `RahulSinghai606/meyden-demo`
4. **Click "Deploy Now"**

## Step 3: Configure Backend Deployment (3 minutes)

Railway will auto-detect this is a Node.js project. Configure:

1. **Root Directory**: Select the `backend` folder
2. **Build Command**: `npm install && npm run build`
3. **Start Command**: `npm start`
4. **Click "Deploy Now"**

## Step 4: Wait for Initial Deployment (3-5 minutes)

Watch the deployment progress:
1. **Go to "Deployments" tab**
2. **Click on the deployment** to see real-time logs
3. **Wait for "Success" status**

## Step 5: Add PostgreSQL Database (2 minutes)

1. **In Railway dashboard**, click "New" → "Database" → "Add PostgreSQL"
2. **Railway automatically**:
   - Creates PostgreSQL database
   - Sets `DATABASE_URL` environment variable
   - Connects it to your backend

## Step 6: Add Environment Variables (3 minutes)

Go to your backend service → "Variables" tab. Add these:

```
NODE_ENV = production
JWT_SECRET = my-super-secret-jwt-key-1234567890123456
JWT_EXPIRES_IN = 7d
REFRESH_TOKEN_SECRET = my-refresh-token-secret-1234567890123456
REFRESH_TOKEN_EXPIRES_IN = 30d
CORS_ORIGIN = http://localhost:3000
PORT = 3001
```

**⚠️ Don't set DATABASE_URL** - Railway sets this automatically!

## Step 7: Wait for Database Setup (2 minutes)

Railway will automatically:
- Run Prisma migrations
- Set up your database schema
- Connect everything together

## Step 8: Get Your Backend URL (1 minute)

1. **Go to Settings → Domains**
2. **Copy your backend URL**: `https://your-project-name.railway.app`
3. **Test health check**: `https://your-project-name.railway.app/health`

## 🎯 Expected Results:

- ✅ Deployment shows "Success"
- ✅ PostgreSQL database created
- ✅ Environment variables set
- ✅ Health check returns `{"status":"OK"}`

## 🚨 If Something Goes Wrong:

**Build fails:**
- Check build logs for errors
- Verify `npm install && npm run build` command
- Ensure all dependencies are in `package.json`

**Database connection fails:**
- Wait longer for database initialization
- Check if `DATABASE_URL` is automatically set
- Verify PostgreSQL was added successfully

**Port errors:**
- Ensure `PORT = 3001` is set in environment variables
- Railway will override the port with their own

## 📞 Need Help?

- **Railway Docs**: https://docs.railway.app
- **Check logs**: Click on deployment to see real-time logs
- **Community**: Railway Discord/Slack for support

**Ready to start? Go to https://railway.app and begin with Step 1!** 🚀