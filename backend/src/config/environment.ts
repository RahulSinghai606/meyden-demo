import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Environment configuration
export const config = {
  // Server
  port: Number.parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  apiPrefix: process.env.API_PREFIX || '/api',
  apiVersion: process.env.API_VERSION || 'v1',

  // Database
  databaseUrl: process.env.DATABASE_URL || '',

  // JWT - SECURITY: No fallback in production
  jwtSecret: process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? '' : 'dev-secret-key'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

  // CORS
  corsOrigin: (process.env.CORS_ORIGIN || 'http://localhost:3000').split(',').map(origin => origin.trim()),
  corsCredentials: process.env.CORS_CREDENTIALS === 'true',

  // AWS
  awsRegion: process.env.AWS_REGION || 'us-east-1',
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',

  // S3
  s3BucketName: process.env.S3_BUCKET_NAME || '',
  s3BucketRegion: process.env.S3_BUCKET_REGION || 'us-east-1',
  s3PublicUrl: process.env.S3_PUBLIC_URL || '',

  // SES
  sesRegion: process.env.SES_REGION || 'us-east-1',
  sesFromEmail: process.env.SES_FROM_EMAIL || 'noreply@meyden.com',
  sesFromName: process.env.SES_FROM_NAME || 'Meyden Platform',

  // OAuth
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL || '',

  microsoftClientId: process.env.MICROSOFT_CLIENT_ID || '',
  microsoftClientSecret: process.env.MICROSOFT_CLIENT_SECRET || '',
  microsoftCallbackUrl: process.env.MICROSOFT_CALLBACK_URL || '',

  // Email (SMTP)
  smtpHost: process.env.SMTP_HOST || '',
  smtpPort: Number.parseInt(process.env.SMTP_PORT || '587', 10),
  smtpSecure: process.env.SMTP_SECURE === 'true',
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || '',

  // Security - SECURITY: No fallback in production
  bcryptRounds: Number.parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
  rateLimitWindowMs: Number.parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  rateLimitMaxRequests: Number.parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  sessionSecret: process.env.SESSION_SECRET || (process.env.NODE_ENV === 'production' ? '' : 'dev-session-secret'),

  // Email (Resend - free tier)
  resendApiKey: process.env.RESEND_API_KEY || '',
  emailFromAddress: process.env.EMAIL_FROM_ADDRESS || 'noreply@meyden.com',
  emailFromName: process.env.EMAIL_FROM_NAME || 'Meyden Platform',

  // File Upload
  maxFileSize: Number.parseInt(process.env.MAX_FILE_SIZE || '10485760', 10),
  allowedFileTypes: process.env.ALLOWED_FILE_TYPES?.split(',') || [],

  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
  logFile: process.env.LOG_FILE || 'logs/app.log',
  logMaxSize: process.env.LOG_MAX_SIZE || '10m',
  logMaxFiles: parseInt(process.env.LOG_MAX_FILES || '5', 10),

  // Feature Flags
  enableRegistration: process.env.ENABLE_REGISTRATION === 'true',
  enableOAuth: process.env.ENABLE_OAUTH === 'true',
  enableEmailVerification: process.env.ENABLE_EMAIL_VERIFICATION === 'true',
  enablePasswordReset: process.env.ENABLE_PASSWORD_RESET === 'true',
  enableCommunityFeatures: process.env.ENABLE_COMMUNITY_FEATURES === 'true',
  enableAiReadiness: process.env.ENABLE_AI_READINESS === 'true',

  // External Services
  analyticsApiKey: process.env.ANALYTICS_API_KEY || '',
  analyticsEnabled: process.env.ANALYTICS_ENABLED === 'true',
  sentryDsn: process.env.SENTRY_DSN || '',
  sentryEnabled: process.env.SENTRY_ENABLED === 'true',
};

// Validate required environment variables
const requiredEnvVars = ['DATABASE_URL'];
const requiredInProduction = ['JWT_SECRET', 'SESSION_SECRET'];

const allRequired = config.nodeEnv === 'production'
  ? [...requiredEnvVars, ...requiredInProduction]
  : requiredEnvVars;

const missingEnvVars = allRequired.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  if (config.nodeEnv === 'production') {
    // SECURITY: Fail fast in production if critical secrets are missing
    throw new Error(`CRITICAL: Missing required environment variables in production: ${missingEnvVars.join(', ')}`);
  } else {
    console.warn(`⚠️  WARNING: Missing environment variables (OK for dev): ${missingEnvVars.join(', ')}`);
  }
}

// Export configuration object
export default config;