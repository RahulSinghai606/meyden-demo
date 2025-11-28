# Free Deployment Guide for Meyden Platform

## 🚀 Quick Start: Deploy Both Frontend & Backend for FREE

This guide will help you deploy your Meyden platform (backend + frontend) completely free with automatic deployments whenever you push code to GitHub.

## 📋 Prerequisites

1. **GitHub Repository**: Push your code to GitHub
2. **Free Accounts**: Create accounts on these platforms:
   - [Railway](https://railway.app) - for backend hosting
   - [Vercel](https://vercel.com) - for frontend hosting
   - [PlanetScale](https://planetscale.com) or [Supabase](https://supabase.com) - for free database

## 🗄️ Step 1: Setup Free Database

### Option A: PlanetScale (Recommended - MySQL)
1. Go to [PlanetScale](https://planetscale.com)
2. Sign up with GitHub
3. Create a new database
4. Get connection string: `mysql://username:password@host/database?sslaccept=strict`

### Option B: Supabase (PostgreSQL)
1. Go to [Supabase](https://supabase.com)
2. Sign up and create new project
3. Get connection string from Settings > Database

## 🔧 Step 2: Deploy Backend on Railway

### Why Railway?
- ✅ **$5 free credit monthly** (enough for small apps)
- ✅ **Automatic deployments** from GitHub
- ✅ **Built-in PostgreSQL/MySQL** support
- ✅ **Environment variables** management
- ✅ **Custom domains** supported

### Deployment Steps:

1. **Connect GitHub to Railway**
   - Go to [Railway](https://railway.app)
   - Click "Deploy from GitHub repo"
   - Select your repository

2. **Configure Backend**
   - Railway will auto-detect Node.js
   - Set build command: `npm install && npm run build`
   - Set start command: `npm start`

3. **Add Environment Variables**
   ```
   NODE_ENV=production
   DATABASE_URL=mysql://your-planetscale-connection-string
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=7d
   REFRESH_TOKEN_SECRET=your-refresh-token-secret
   REFRESH_TOKEN_EXPIRES_IN=30d
   CORS_ORIGIN=https://your-frontend-url.vercel.app
   PORT=3001
   ```

4. **Database Setup**
   - Go to Railway dashboard > your service > Variables
   - Add `DATABASE_URL` with your PlanetScale connection string
   - Railway will automatically run Prisma migrations

5. **Deploy**
   - Railway automatically deploys on every push to main branch
   - You'll get a URL like: `https://your-app-name.railway.app`

## 🌐 Step 3: Deploy Frontend on Vercel

### Why Vercel?
- ✅ **100% Free** for personal projects
- ✅ **Perfect for Next.js** (built by Next.js creators)
- ✅ **Automatic deployments** from GitHub
- ✅ **Edge functions** support
- ✅ **Global CDN** included

### Deployment Steps:

1. **Connect GitHub to Vercel**
   - Go to [Vercel](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Frontend**
   - Vercel auto-detects Next.js
   - Framework preset: Next.js
   - Root directory: `./` (for meyden-demo)

3. **Environment Variables**
   ```
   NEXT_PUBLIC_API_BASE_URL=https://your-backend-url.railway.app
   NEXT_PUBLIC_APP_ENV=production
   NEXT_PUBLIC_APP_URL=https://your-frontend-url.vercel.app
   ```

4. **Deploy**
   - Vercel automatically deploys on every push
   - You'll get a URL like: `https://your-project.vercel.app`

## 🔄 Step 4: Setup Automatic Deployments

### GitHub Integration:
1. **Push to GitHub**: All changes pushed to main branch will trigger both deployments
2. **Branch Protection**: Set up branch protection for main branch
3. **Pull Requests**: Create PRs for testing before merging

### Workflow:
```bash
# Make changes to your code
git add .
git commit -m "Add new feature"
git push origin main

# Railway automatically:
# 1. Runs tests
# 2. Builds backend
# 3. Runs database migrations
# 4. Deploys to production

# Vercel automatically:
# 1. Runs tests
# 2. Builds Next.js app
# 3. Deploys to global CDN
```

## 🌍 Step 5: Custom Domains (Optional)

### Railway Backend:
1. Go to Railway dashboard > your service > Settings
2. Add custom domain in "Domains" section
3. Update DNS records as instructed

### Vercel Frontend:
1. Go to Vercel dashboard > your project > Settings
2. Add custom domain in "Domains" section
3. Update DNS records as instructed

## 📊 Monitoring & Logs

### Railway:
- **Logs**: Built-in log streaming
- **Metrics**: CPU, Memory, Network usage
- **Alerts**: Email notifications for downtime

### Vercel:
- **Logs**: Real-time function logs
- **Analytics**: Page views, performance metrics
- **Deployments**: Complete deployment history

## 🔒 Security Considerations

### Backend Security:
- ✅ Use environment variables for secrets
- ✅ Enable CORS for your frontend domain only
- ✅ Use HTTPS (automatic with Railway)
- ✅ Implement rate limiting

### Frontend Security:
- ✅ Environment variables for API URLs
- ✅ Content Security Policy headers
- ✅ Secure cookie settings

## 💰 Cost Breakdown

| Service | Free Tier | Usage |
|---------|-----------|--------|
| Railway | $5/month credit | Backend hosting |
| Vercel | Unlimited personal projects | Frontend hosting |
| PlanetScale | 1 billion reads/month | MySQL database |
| GitHub | Unlimited private repos | Code storage |

**Total Cost: $0/month** for personal projects!

## 🚨 Troubleshooting

### Backend Issues:
```bash
# Check Railway logs
railway logs

# Run migrations manually
npx prisma migrate deploy

# Reset database if needed
npx prisma migrate reset
```

### Frontend Issues:
```bash
# Check build logs in Vercel dashboard
# Verify environment variables
# Test API connectivity
```

## 📱 Testing Your Deployment

1. **Backend Health Check**:
   ```
   GET https://your-backend.railway.app/api/v1/health
   ```

2. **Frontend Access**:
   ```
   https://your-frontend.vercel.app
   ```

3. **API Integration**:
   - Update frontend environment variables
   - Test login/register functionality
   - Verify all API endpoints work

## 🎯 Next Steps

1. **Setup Monitoring**: Add error tracking with Sentry
2. **Add CI/CD**: GitHub Actions for automated testing
3. **Backup Strategy**: Regular database backups
4. **Performance**: Enable caching and CDN
5. **Analytics**: Add user analytics

## 📞 Support

- **Railway Docs**: https://docs.railway.app
- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs

---

🎉 **Congratulations!** Your Meyden platform is now live and automatically deploying for free!