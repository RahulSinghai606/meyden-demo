# Meyden AI Marketplace - Netlify Deployment Guide

## Overview
This guide will help you deploy the Meyden AI Marketplace application to Netlify for global access. The application consists of a Next.js frontend and an Express.js backend with Prisma ORM.

## Architecture
- **Frontend**: Next.js application (Static Export)
- **Backend**: Express.js API server 
- **Database**: SQLite (development) / PostgreSQL (production)
- **Deployment**: Netlify (Frontend) + Railway/Render (Backend)

## Prerequisites
1. Netlify account (free tier available)
2. GitHub account
3. Backend deployment platform (Railway, Render, or Heroku)
4. Database service (Railway PostgreSQL, Supabase, or PlanetScale)

## Part 1: Frontend Deployment (Netlify)

### Step 1: Prepare Frontend for Deployment

1. **Update Environment Configuration**
   ```bash
   # Create .env.production file
   NEXT_PUBLIC_API_BASE_URL=https://your-backend-api-url.com
   NEXT_PUBLIC_APP_ENV=production
   NEXT_PUBLIC_APP_URL=https://your-site-name.netlify.app
   ```

2. **Verify Build Configuration**
   - `netlify.toml` is configured for static export
   - `next.config.ts` has `output: 'export'` enabled

### Step 2: Deploy to Netlify

#### Option A: GitHub Integration (Recommended)

1. **Push Code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Netlify deployment"
   git push origin main
   ```

2. **Connect to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Connect your GitHub repository
   - Select the `meyden-demo` folder as the root directory

3. **Configure Build Settings**
   - Build command: `npm run build`
   - Publish directory: `out`
   - Node version: `18`

4. **Set Environment Variables**
   In Netlify dashboard → Site settings → Environment variables:
   ```
   NEXT_PUBLIC_API_BASE_URL=https://your-backend-api-url.com
   NEXT_PUBLIC_APP_ENV=production
   NEXT_PUBLIC_APP_URL=https://your-site-name.netlify.app
   ```

#### Option B: Manual Deployment

1. **Build Locally**
   ```bash
   cd meyden-demo
   npm run build
   ```

2. **Deploy via Netlify CLI**
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod --dir=out
   ```

### Step 3: Verify Frontend Deployment
- Visit your Netlify site URL
- Check that all pages load correctly
- Verify API calls are pointing to the correct backend URL

## Part 2: Backend Deployment

### Recommended: Railway Deployment

1. **Prepare Backend for Production**
   ```bash
   cd backend
   
   # Install production dependencies
   npm install --production
   
   # Update environment variables for production
   cp .env.example .env
   ```

2. **Update Database Configuration**
   ```typescript
   // src/config/database.ts - Update for production
   const databaseUrl = process.env.DATABASE_URL || 'file:./dev.db';
   
   // For PostgreSQL in production:
   const databaseUrl = process.env.DATABASE_URL; // PostgreSQL connection string
   ```

3. **Deploy to Railway**
   - Go to [railway.app](https://railway.app)
   - Connect your GitHub repository
   - Select the `backend` folder
   - Add PostgreSQL service
   - Set environment variables:
     ```
     NODE_ENV=production
     DATABASE_URL=${{Postgres.DATABASE_URL}}
     JWT_SECRET=your-jwt-secret
     PORT=3002
     ```

4. **Run Database Migrations**
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

### Alternative: Render Deployment

1. **Create render.yaml**
   ```yaml
   services:
     - type: web
       name: meyden-api
       env: node
       plan: starter
       buildCommand: npm install && npm run build
       startCommand: npm start
       envVars:
         - key: NODE_ENV
           value: production
         - key: DATABASE_URL
           fromService:
             type: pserv
             name: meyden-db
             property: connectionString
   ```

2. **Deploy to Render**
   - Connect GitHub repository
   - Render will automatically detect and deploy

### Database Migration for Production

1. **Export Current Data (if needed)**
   ```bash
   npx prisma db push --force-reset
   ```

2. **Setup Production Database**
   ```bash
   # For PostgreSQL
   npx prisma db push
   npx prisma db seed
   ```

## Part 3: Final Configuration

### Update Frontend API URL
After backend deployment, update the frontend environment variable:
```
NEXT_PUBLIC_API_BASE_URL=https://your-backend-api.railway.app
```

### Test End-to-End
1. Visit your Netlify site
2. Try demo login functionality
3. Verify all API endpoints work correctly

## Environment Variables Reference

### Frontend (.env.production)
```env
NEXT_PUBLIC_API_BASE_URL=https://your-backend-api.com
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_APP_URL=https://your-site.netlify.app
```

### Backend (.env)
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/dbname
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
PORT=3002
CORS_ORIGIN=https://your-site.netlify.app
```

## Troubleshooting

### Common Issues

1. **Build Fails**
   - Check Node.js version (should be 18+)
   - Verify all dependencies are installed
   - Check for TypeScript errors

2. **API Calls Fail**
   - Verify NEXT_PUBLIC_API_BASE_URL is correct
   - Check CORS settings in backend
   - Ensure backend is deployed and accessible

3. **Database Connection Issues**
   - Verify DATABASE_URL format
   - Check database service status
   - Run migrations manually

4. **Static Export Issues**
   - Ensure next.config.ts has `output: 'export'`
   - Check that all dynamic routes are handled
   - Verify image optimization is disabled

### Performance Optimization

1. **Enable Netlify Analytics**
2. **Configure CDN settings**
3. **Optimize images and assets**
4. **Enable gzip compression**

## Security Considerations

1. **Environment Variables**: Never commit sensitive data
2. **CORS**: Configure properly for production domains
3. **Headers**: Add security headers in netlify.toml
4. **SSL**: Netlify provides automatic SSL certificates

## Monitoring and Maintenance

1. **Set up monitoring** (Netlify Analytics, Sentry)
2. **Configure automated backups** for database
3. **Monitor API performance** and uptime
4. **Regular security updates**

## Demo Account Credentials
After deployment, the following demo accounts will be available:
- **Admin**: `admin@meyden.com` / `admin123`
- **Vendor**: `vendor@meyden.com` / `vendor123`
- **User**: `user@meyden.com` / `user123`

## Support
For deployment issues:
1. Check the troubleshooting section above
2. Verify all environment variables are set correctly
3. Test API endpoints directly before frontend integration
4. Review build logs for specific error messages

---

**Estimated Deployment Time**: 30-60 minutes
**Cost**: Free tier available (Netlify + Railway/Render)
**Global Access**: ✅ CDN-powered worldwide distribution