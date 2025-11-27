# 🚀 **Deployment Steps - Let's Get Your Demo Live!**

## **Step 1: Create GitHub Repository** (3 minutes)

Run these commands in your terminal:

```bash
# Navigate to your project
cd /Users/rahul.singh/Downloads/Meyden

# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Meyden AI Marketplace with admin/vendor dashboards"

# Create main branch
git branch -M main

# Add your GitHub repository (replace with your actual repository URL)
git remote add origin https://github.com/YOUR_USERNAME/meyden-demo.git

# Push to GitHub
git push -u origin main
```

**Replace `YOUR_USERNAME` with your actual GitHub username and create a repository named `meyden-demo` on GitHub first.**

## **Step 2: Railway Backend Deployment** (8 minutes)

### **2.1 Create Railway Account**
1. Go to [railway.app](https://railway.app)
2. Click "Login" → "Login with GitHub"
3. Authorize Railway to access your GitHub

### **2.2 Deploy Backend**
1. Click "New Project" → "Deploy from GitHub repo"
2. Select your `meyden-demo` repository
3. **Important**: Set root directory to `backend` (not the whole repo)
4. Railway will auto-detect it as a Node.js project

### **2.3 Add PostgreSQL Database**
1. In your project dashboard, click "New" → "Database" → "PostgreSQL"
2. Wait for database to be provisioned (1-2 minutes)
3. Railway will automatically create a `DATABASE_URL` environment variable

### **2.4 Configure Environment Variables**
In Railway dashboard → Settings → Variables, add:
```
NODE_ENV=production
JWT_SECRET=meyden-super-secret-jwt-key-2024
PORT=3002
CORS_ORIGIN=https://your-netlify-site.netlify.app
```

### **2.5 Run Database Setup**
Railway will automatically run migrations. If not, in the Railway dashboard:
1. Go to your backend service
2. Click "Settings" → "Variables"
3. Add: `MIGRATION_COMMAND=npx prisma migrate deploy`

## **Step 3: Netlify Frontend Deployment** (5 minutes)

### **3.1 Create Netlify Account**
1. Go to [netlify.com](https://netlify.com)
2. Click "Sign up" → "Sign up with GitHub"
3. Authorize Netlify to access your GitHub

### **3.2 Deploy Frontend**
1. Click "New site from Git"
2. Choose "GitHub" and select your `meyden-demo` repository
3. **Important**: Set root directory to `meyden-demo` (not the whole repo)
4. Build settings:
   - Build command: `npm run build`
   - Publish directory: `out`
   - Node version: `18`

### **3.3 Configure Environment Variables**
In Netlify dashboard → Site settings → Environment variables:
```
NEXT_PUBLIC_API_BASE_URL=https://your-railway-backend.railway.app
NEXT_PUBLIC_APP_ENV=production
```

### **3.4 Update Railway CORS**
After getting your Netlify URL, go back to Railway and update:
```
CORS_ORIGIN=https://your-actual-netlify-site.netlify.app
```

## **Step 4: Test Your Live Demo** (2 minutes)

### **Verify Backend**
Visit: `https://your-railway-backend.railway.app/health`
Should return: `{"status":"ok"}`

### **Test Frontend**
Visit your Netlify URL and test with:
- Admin: `admin@meyden.com` / `admin123`
- Vendor: `vendor@meyden.com` / `vendor123`
- User: `user@meyden.com` / `user123`

## **🎉 You're Live!**

**Frontend URL:** `https://your-site-name.netlify.app`
**Backend API:** `https://your-backend.railway.app`

Share these URLs with anyone to showcase your Meyden AI Marketplace!

---

**Need help with any step? Let me know which part you'd like me to elaborate on!**