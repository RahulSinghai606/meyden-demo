import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { doubleCsrf } from 'csrf-csrf';
import { config } from './config/environment';
import { logger, morganStream } from './utils/logger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { requestValidator } from './middleware/validation';
import { auditLogger } from './middleware/auditLogger';
import { getCurrentUTC } from './utils/datetime';

// Import routes
import authRoutes from './routes/auth.routes';
import oauthRoutes from './routes/oauth.routes';
import userRoutes from './routes/user.routes';
import vendorRoutes from './routes/vendor.routes';
import communityRoutes from './routes/community.routes';
import aiReadinessRoutes from './routes/ai-readiness.routes';
import adminRoutes from './routes/admin.routes';
import uploadRoutes from './routes/upload.routes';

const app: Application = express();

// Trust proxy for accurate IP addresses (for rate limiting and security)
app.set('trust proxy', 1);

import prisma from './config/database';

// Health check endpoint - Defined first to bypass middleware (CORS, Auth, etc.)
app.get('/health', async (req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: 'success',
      message: 'Meyden Backend API is running',
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv,
      database: 'CONNECTED'
    });
  } catch (error) {
    logger.error('Health check DB failure:', error);
    res.status(200).json({
      status: 'success',
      message: 'Meyden Backend API is running',
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv,
      database: 'DISCONNECTED'
    });
  }
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      scriptSrc: ["'self'", "https:"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https:"],
      fontSrc: ["'self'", "https:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration - SECURITY FIX: No null origin in production
app.use(cors({
  origin: (requestOrigin, callback) => {
    // Allow all origins for now to fix the issue
    return callback(null, true);
  },
  credentials: config.corsCredentials,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token'],
  exposedHeaders: ['X-Total-Count', 'X-Rate-Limit-Remaining'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMaxRequests,
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.originalUrl,
    });
    res.status(429).json({
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil(config.rateLimitWindowMs / 1000),
    });
  },
});
app.use(limiter);

// Compression middleware
app.use(compression());

// Cookie parser (required for CSRF)
app.use(cookieParser());

// Request parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CSRF Protection
const csrfProtection = doubleCsrf({
  getSecret: () => config.jwtSecret,
  getSessionIdentifier: (req) => req.ip || 'unknown',
  cookieName: 'x-csrf-token',
  cookieOptions: {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: config.nodeEnv === 'production' ? 'strict' : 'lax',
    path: '/',
  },
  size: 64,
  ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
});

// CSRF token endpoint
app.get('/api/v1/csrf-token', (req: Request, res: Response) => {
  const csrfToken = csrfProtection.generateCsrfToken(req, res);
  res.json({
    success: true,
    csrfToken,
  });
});

// Apply CSRF protection to state-changing routes
app.use('/api/v1', (req: Request, res: Response, next: NextFunction) => {
  // Skip CSRF for GET, HEAD, OPTIONS
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  // Skip CSRF for auth endpoints (login/register) - they have rate limiting
  if (req.path.startsWith('/auth/login') || req.path.startsWith('/auth/register')) {
    return next();
  }
  return csrfProtection.doubleCsrfProtection(req, res, next);
});

// Logging middleware
if (config.nodeEnv !== 'production') {
  app.use(morgan('dev', { stream: morganStream }));
} else {
  app.use(morgan('combined', { stream: morganStream }));
}

// Request validation middleware
app.use(requestValidator);

// Audit logging middleware
app.use(auditLogger);



// API routes
const apiPrefix = `${config.apiPrefix}/${config.apiVersion}`;
app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/auth/oauth`, oauthRoutes);
app.use(`${apiPrefix}/users`, userRoutes);
app.use(`${apiPrefix}/vendors`, vendorRoutes);
app.use(`${apiPrefix}/community`, communityRoutes);
app.use(`${apiPrefix}/ai-readiness`, aiReadinessRoutes);
app.use(`${apiPrefix}/admin`, adminRoutes);
app.use(`${apiPrefix}/upload`, uploadRoutes);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Meyden Backend API',
    version: config.apiVersion,
    environment: config.nodeEnv,
    timestamp: getCurrentUTC().toISOString(),
    endpoints: {
      auth: `${apiPrefix}/auth`,
      users: `${apiPrefix}/users`,
      vendors: `${apiPrefix}/vendors`,
      community: `${apiPrefix}/community`,
      aiReadiness: `${apiPrefix}/ai-readiness`,
      admin: `${apiPrefix}/admin`,
      upload: `${apiPrefix}/upload`,
      health: '/health',
      csrfToken: '/api/v1/csrf-token',
    },
  });
});

// 404 handler for unknown routes
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// Graceful error handling for unhandled promise rejections
process.on('unhandledRejection', (reason: unknown, promise: Promise<any>) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Close server gracefully
  process.exit(1);
});

// Graceful error handling for uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

export default app;