# Environment Variables Template
# Copy these to your deployment platform environment variables

# Backend Environment Variables (Railway)
NODE_ENV=production
DATABASE_URL=mysql://username:password@host/database?sslaccept=strict
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=your-refresh-token-secret-min-32-characters
REFRESH_TOKEN_EXPIRES_IN=30d
CORS_ORIGIN=https://your-frontend-url.vercel.app
PORT=3001
NPM_CONFIG_PRODUCTION=false

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@yourdomain.com

# File Upload Configuration (Optional)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name

# OAuth Configuration (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret

# Frontend Environment Variables (Vercel)
NEXT_PUBLIC_API_BASE_URL=https://your-backend-url.railway.app
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_APP_URL=https://your-frontend-url.vercel.app

# Security
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=https://your-frontend-url.vercel.app