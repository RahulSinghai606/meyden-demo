
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/environment';

import { getCurrentUTC } from './datetime';
import { maskPII } from './sanitize';
import { logger } from './logger';
import prisma from '../config/database';

// JWT utilities
export const generateTokens = (userId: string) => {
  const token = jwt.sign(
    { userId },
    config.jwtSecret,
    {
      algorithm: 'HS256',
      expiresIn: config.jwtExpiresIn as jwt.SignOptions['expiresIn'],
      issuer: 'meyden-api',
      audience: 'meyden-client'
    }
  );

  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    config.jwtSecret,
    {
      algorithm: 'HS256',
      expiresIn: config.jwtRefreshExpiresIn as jwt.SignOptions['expiresIn'],
      issuer: 'meyden-api',
      audience: 'meyden-client'
    }
  );

  return { token, refreshToken };
};

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, config.jwtSecret, {
      algorithms: ['HS256'],
      issuer: 'meyden-api',
      audience: 'meyden-client'
    });
  } catch (error) {
    logger.warn('Token verification failed:', maskPII(error));
    return null;
  }
};

// Password utilities
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(config.bcryptRounds);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

// Email verification token
export const generateEmailVerificationToken = (): { token: string; expiresAt: Date } => {
  const token = uuidv4();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  return { token, expiresAt };
};

// Password reset token
export const generatePasswordResetToken = (): { token: string; expiresAt: Date } => {
  const token = uuidv4();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  return { token, expiresAt };
};

// Session management
export const createSession = async (userId: string, deviceInfo?: string, ipAddress?: string, userAgent?: string) => {
  const { token: accessToken, refreshToken } = generateTokens(userId);

  const session = await prisma.session.create({
    data: {
      userId,
      token: accessToken,
      refreshToken,
      deviceInfo,
      ipAddress,
      userAgent,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
    },
  });

  return { session, accessToken, refreshToken };
};

export const invalidateSession = async (token: string) => {
  try {
    await prisma.session.deleteMany({
      where: { token },
    });
  } catch (error) {
    logger.error('Failed to invalidate session:', maskPII(error));
  }
};

export const invalidateAllUserSessions = async (userId: string) => {
  try {
    await prisma.session.deleteMany({
      where: { userId },
    });
  } catch (error) {
    logger.error('Failed to invalidate user sessions:', maskPII(error));
  }
};

// OAuth utilities
export const generateOAuthState = (): { state: string; expiresAt: Date } => {
  const state = uuidv4();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  return { state, expiresAt };
};

export const validateOAuthState = (state: string, storedState: { state: string; expiresAt: Date }): boolean => {
  return state === storedState.state && storedState.expiresAt > getCurrentUTC();
};

// Rate limiting for authentication attempts
export const rateLimitLoginAttempts = async (email: string, ipAddress: string): Promise<{ allowed: boolean; remaining: number }> => {
  // This is a simple implementation. In production, use Redis or similar
  const maxAttempts = 5;
  const windowMs = 15 * 60 * 1000; // 15 minutes

  // In a real implementation, you'd check a rate limiting store
  // For now, we'll allow all attempts
  return { allowed: true, remaining: maxAttempts };
};

// Account lockout utilities (simplified for demo)
export const checkAccountLockout = async (email: string): Promise<{ locked: boolean; remaining: number }> => {
  // Simplified for demo - always return not locked
  return { locked: false, remaining: 0 };
};

export const incrementLoginAttempts = async (email: string): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) return;

  const attempts = user.loginAttempts + 1;

  await prisma.user.update({
    where: { email },
    data: {
      loginAttempts: attempts,
    },
  });
};

export const resetLoginAttempts = async (email: string): Promise<void> => {
  await prisma.user.update({
    where: { email },
    data: {
      loginAttempts: 0,
    },
  });
};

// Email validation utilities
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const sanitizeEmail = (email: string): string => {
  return email.toLowerCase().trim();
};

// Password strength validation
export const validatePasswordStrength = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};