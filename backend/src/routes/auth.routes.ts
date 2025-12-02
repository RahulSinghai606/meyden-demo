import { Router, Request, Response } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import prisma from '../config/database';
import {
  hashPassword,
  comparePassword,
  generateTokens,
  createSession,
  invalidateSession,
  invalidateAllUserSessions,
  generateEmailVerificationToken,
  generatePasswordResetToken,
  isValidEmail,
  sanitizeEmail,
  validatePasswordStrength,
  checkAccountLockout,
  incrementLoginAttempts,
  resetLoginAttempts,
  rateLimitLoginAttempts,
  verifyToken
} from '../utils/auth';
import { logger } from '../utils/logger';
import { config } from '../config/environment';
import { AuthenticatedRequest } from '../middleware/auth';
import { maskPII, sanitizeUserForBroadcast } from '../utils/sanitize';
import { getCurrentUTC } from '../utils/datetime';

const router = Router();

// Rate limiters for authentication endpoints
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login attempts
  message: { error: 'Too many login attempts, please try again later', code: 'RATE_LIMITED' },
  standardHeaders: true,
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 registration attempts
  message: { error: 'Too many accounts created, please try again later', code: 'RATE_LIMITED' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(['USER', 'VENDOR', 'ADMIN']).default('USER'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const resetPasswordSchema = z.object({
  email: z.string().email(),
});

const confirmResetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
});

const verifyEmailSchema = z.object({
  token: z.string().min(1),
});

// Helper function to send emails (mock implementation)
const sendEmail = async (to: string, subject: string, content: string) => {
  // In production, integrate with AWS SES, SendGrid, or similar
  logger.info(`Email would be sent to ${maskPII({ email: to })}: ${subject}`);
  console.log('Email Content:', content);
};

// Register endpoint
router.post('/register', registerLimiter, async (req: Request, res: Response) => {
  try {
    if (!config.enableRegistration) {
      return res.status(403).json({
        error: 'Registration is currently disabled',
        code: 'REGISTRATION_DISABLED'
      });
    }

    const validatedData = registerSchema.parse(req.body);
    const { email, password, firstName, lastName, role } = validatedData;

    // Sanitize and validate email
    const sanitizedEmail = sanitizeEmail(email);

    if (!isValidEmail(sanitizedEmail)) {
      return res.status(400).json({
        error: 'Invalid email format',
        code: 'INVALID_EMAIL'
      });
    }

    // Check password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({
        error: 'Password does not meet requirements',
        code: 'WEAK_PASSWORD',
        errors: passwordValidation.errors
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: sanitizedEmail }
    });

    if (existingUser) {
      return res.status(409).json({
        error: 'User with this email already exists',
        code: 'USER_EXISTS'
      });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Generate email verification token
    const { token: emailVerificationToken, expiresAt: emailVerificationExpires } =
      generateEmailVerificationToken();

    // Create user
    const user = await prisma.user.create({
      data: {
        email: sanitizedEmail,
        passwordHash,
        firstName,
        lastName,
        role,
        emailVerificationToken,
        emailVerificationExpires,
        status: config.enableEmailVerification ? 'PENDING_VERIFICATION' : 'ACTIVE',
        emailVerified: !config.enableEmailVerification,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    // Send verification email if enabled
    if (config.enableEmailVerification) {
      const verificationUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/verify-email?token=${emailVerificationToken}`;
      await sendEmail(
        sanitizedEmail,
        'Verify Your Meyden Account',
        `Welcome to Meyden! Please verify your email by clicking this link: ${verificationUrl}`
      );
    }

    logger.info('User registered successfully', maskPII({ userId: user.id, email: user.email }));

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        ...user,
        emailVerificationRequired: config.enableEmailVerification && !user.emailVerified,
      },
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.errors,
      });
    }

    logger.error('Registration error:', maskPII(error));
    res.status(500).json({
      error: 'Internal server error during registration',
      code: 'REGISTRATION_ERROR',
    });
  }
});

// Login endpoint
router.post('/login', loginLimiter, async (req: Request, res: Response) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const { email, password } = validatedData;
    const sanitizedEmail = sanitizeEmail(email);
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';

    // Check rate limiting
    const rateLimit = await rateLimitLoginAttempts(sanitizedEmail, ipAddress);
    if (!rateLimit.allowed) {
      return res.status(429).json({
        error: 'Too many login attempts. Please try again later.',
        code: 'RATE_LIMITED',
      });
    }

    // Check if account is locked
    const lockoutStatus = await checkAccountLockout(sanitizedEmail);
    if (lockoutStatus.locked) {
      return res.status(423).json({
        error: `Account is locked. Try again in ${lockoutStatus.remaining} minutes.`,
        code: 'ACCOUNT_LOCKED',
        remaining: lockoutStatus.remaining,
      });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
      include: { profile: true },
    });

    if (!user) {
      await incrementLoginAttempts(sanitizedEmail);
      return res.status(401).json({
        error: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.passwordHash || '');
    if (!isValidPassword) {
      await incrementLoginAttempts(sanitizedEmail);
      return res.status(401).json({
        error: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Check account status
    if (user.status === 'SUSPENDED') {
      return res.status(423).json({
        error: 'Account is suspended. Please contact support.',
        code: 'ACCOUNT_SUSPENDED'
      });
    }

    if (user.status === 'DELETED') {
      return res.status(423).json({
        error: 'Account has been deleted.',
        code: 'ACCOUNT_DELETED'
      });
    }

    if (user.status === 'PENDING_VERIFICATION' && !user.emailVerified) {
      return res.status(403).json({
        error: 'Please verify your email address before logging in.',
        code: 'EMAIL_NOT_VERIFIED'
      });
    }

    // Reset login attempts on successful login
    await resetLoginAttempts(sanitizedEmail);

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: getCurrentUTC() },
    });

    // Create session
    const { session, accessToken, refreshToken } = await createSession(
      user.id,
      req.get('User-Agent'),
      ipAddress,
      req.get('user-agent')
    );

    // Return user data and tokens
    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified,
      lastLogin: user.lastLogin,
      profile: user.profile,
    };

    logger.info('User logged in successfully', maskPII({ userId: user.id, email: user.email }));

    res.json({
      message: 'Login successful',
      user: userData,
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: config.jwtExpiresIn,
      },
      session: {
        id: session.id,
        expiresAt: session.expiresAt,
      },
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.errors,
      });
    }

    logger.error('Login error:', maskPII(error));
    res.status(500).json({
      error: 'Internal server error during login',
      code: 'LOGIN_ERROR',
    });
  }
});

// Logout endpoint
router.post('/logout', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    let userId: string | null = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      await invalidateSession(token);

      // Extract user ID from token for logging
      const decoded = verifyToken(token);
      if (decoded && decoded.userId) {
        userId = decoded.userId as string;
        await invalidateAllUserSessions(userId);
      }
    }

    logger.info('User logged out', maskPII({ userId }));

    res.json({
      message: 'Logout successful',
    });

  } catch (error) {
    logger.error('Logout error:', maskPII(error));
    res.status(500).json({
      error: 'Internal server error during logout',
      code: 'LOGOUT_ERROR',
    });
  }
});

// Refresh token endpoint
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: 'Refresh token required',
        code: 'REFRESH_TOKEN_MISSING'
      });
    }

    // Verify refresh token
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(refreshToken, config.jwtSecret);

    if (!decoded || decoded.type !== 'refresh' || !decoded.userId) {
      return res.status(401).json({
        error: 'Invalid refresh token',
        code: 'INVALID_REFRESH_TOKEN'
      });
    }

    // Check if session exists
    const session = await prisma.session.findFirst({
      where: {
        refreshToken,
        expiresAt: {
          gt: getCurrentUTC()
        }
      },
      include: { user: true }
    });

    if (!session || !session.user) {
      return res.status(401).json({
        error: 'Invalid or expired session',
        code: 'SESSION_INVALID'
      });
    }

    // Generate new tokens
    const { token: newAccessToken, refreshToken: newRefreshToken } = generateTokens(session.user.id);

    // Update session
    await prisma.session.update({
      where: { id: session.id },
      data: {
        token: newAccessToken,
        refreshToken: newRefreshToken,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      },
    });

    res.json({
      message: 'Tokens refreshed successfully',
      tokens: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: config.jwtExpiresIn,
      },
    });

  } catch (error) {
    logger.error('Token refresh error:', maskPII(error));
    res.status(401).json({
      error: 'Failed to refresh tokens',
      code: 'REFRESH_ERROR',
    });
  }
});

// Verify email endpoint
router.post('/verify-email', async (req: Request, res: Response) => {
  try {
    const validatedData = verifyEmailSchema.parse(req.body);
    const { token } = validatedData;

    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailVerified: false,
        emailVerificationExpires: {
          gt: getCurrentUTC()
        }
      },
    });

    if (!user) {
      return res.status(400).json({
        error: 'Invalid or expired verification token',
        code: 'INVALID_VERIFICATION_TOKEN'
      });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        status: 'ACTIVE',
      },
    });

    logger.info('Email verified successfully', maskPII({ userId: user.id }));

    res.json({
      message: 'Email verified successfully',
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.errors,
      });
    }

    logger.error('Email verification error:', maskPII(error));
    res.status(500).json({
      error: 'Internal server error during email verification',
      code: 'VERIFICATION_ERROR',
    });
  }
});

// Forgot password endpoint
router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    if (!config.enablePasswordReset) {
      return res.status(403).json({
        error: 'Password reset is currently disabled',
        code: 'PASSWORD_RESET_DISABLED'
      });
    }

    const validatedData = resetPasswordSchema.parse(req.body);
    const { email } = validatedData;
    const sanitizedEmail = sanitizeEmail(email);

    const user = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
    });

    // Always return success to prevent email enumeration
    const genericResponse = {
      message: 'If an account with that email exists, we sent a password reset link.',
    };

    if (!user) {
      return res.json(genericResponse);
    }

    // Generate password reset token
    const { token: resetToken, expiresAt } = generatePasswordResetToken();

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: expiresAt,
      },
    });

    // Send reset email
    const resetUrl = `${req.protocol}://${req.get('host')}/reset-password?token=${resetToken}`;
    await sendEmail(
      sanitizedEmail,
      'Reset Your Meyden Password',
      `You requested a password reset. Click this link to reset your password: ${resetUrl}`
    );

    logger.info('Password reset email sent', maskPII({ userId: user.id }));

    res.json(genericResponse);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.errors,
      });
    }

    logger.error('Forgot password error:', maskPII(error));
    res.status(500).json({
      error: 'Internal server error',
      code: 'FORGOT_PASSWORD_ERROR',
    });
  }
});

// Reset password endpoint
router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const validatedData = confirmResetPasswordSchema.parse(req.body);
    const { token, password } = validatedData;

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({
        error: 'Password does not meet requirements',
        code: 'WEAK_PASSWORD',
        errors: passwordValidation.errors
      });
    }

    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: {
          gt: getCurrentUTC()
        }
      },
    });

    if (!user) {
      return res.status(400).json({
        error: 'Invalid or expired reset token',
        code: 'INVALID_RESET_TOKEN'
      });
    }

    // Hash new password
    const passwordHash = await hashPassword(password);

    // Update user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    // Invalidate all sessions
    await invalidateAllUserSessions(user.id);

    logger.info('Password reset successfully', maskPII({ userId: user.id }));

    res.json({
      message: 'Password reset successfully',
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.errors,
      });
    }

    logger.error('Reset password error:', maskPII(error));
    res.status(500).json({
      error: 'Internal server error during password reset',
      code: 'RESET_PASSWORD_ERROR',
    });
  }
});

export default router;