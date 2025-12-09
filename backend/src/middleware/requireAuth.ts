import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth';
import { logger } from '../utils/logger';
import { maskPII } from '../utils/sanitize';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role?: string;
    email?: string;
  };
}

/**
 * Middleware to require authentication
 */
export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'Authentication required. Please provide a valid token.',
      });
      return;
    }

    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Authentication token is missing.',
      });
      return;
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      res.status(401).json({
        success: false,
        error: 'Invalid or expired authentication token.',
      });
      return;
    }

    req.user = decoded;
    next();
  } catch (error) {
    logger.error('Authentication error:', maskPII(error));
    res.status(401).json({
      success: false,
      error: 'Authentication failed.',
    });
  }
};

/**
 * Middleware to require specific role(s)
 */
export const requireRole = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required.',
      });
      return;
    }

    const userRole = req.user.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      logger.warn('Access denied:', maskPII({
        userId: req.user.userId,
        role: userRole,
        requiredRoles: allowedRoles,
      }));

      res.status(403).json({
        success: false,
        error: 'Insufficient permissions. This action requires elevated privileges.',
      });
      return;
    }

    next();
  };
};

/**
 * Middleware to require admin role
 */
export const requireAdmin = requireRole('ADMIN', 'SUPER_ADMIN');

/**
 * Optional authentication - attaches user if token is valid but doesn't block
 */
export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      const decoded = verifyToken(token);

      if (decoded) {
        req.user = decoded;
      }
    }

    next();
  } catch (error) {
    // Silent fail for optional auth
    next();
  }
};
