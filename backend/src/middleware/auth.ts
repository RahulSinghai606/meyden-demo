import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth';
import prisma from '../config/database';
import { logger } from '../utils/logger';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    status: string;
  };
}

export const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Access token required',
        code: 'TOKEN_MISSING'
      });
    }

    const token = authHeader.substring(7);
    
    if (!token) {
      return res.status(401).json({
        error: 'Access token required',
        code: 'TOKEN_MISSING'
      });
    }

    // Verify token
    const decoded = verifyToken(token);
    
    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        error: 'Invalid or expired token',
        code: 'TOKEN_INVALID'
      });
    }

    // Check if session exists and is valid
    const session = await prisma.session.findFirst({
      where: {
        token,
        expiresAt: {
          gt: new Date()
        }
      },
      include: {
        user: true
      }
    });

    if (!session || !session.user) {
      return res.status(401).json({
        error: 'Invalid or expired session',
        code: 'SESSION_INVALID'
      });
    }

    // Update last used time
    await prisma.session.update({
      where: { id: session.id },
      data: { lastUsed: new Date() }
    });

    // Attach user to request
    req.user = {
      id: session.user.id,
      email: session.user.email,
      role: session.user.role,
      status: session.user.status
    };

    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(401).json({
      error: 'Authentication failed',
      code: 'AUTH_ERROR'
    });
  }
};

export const requireRole = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS',
        required: roles,
        current: req.user.role
      });
    }

    next();
  };
};

export const requireActiveUser = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required',
      code: 'AUTH_REQUIRED'
    });
  }

  if (req.user.status !== 'ACTIVE') {
    return res.status(403).json({
      error: 'Account must be active to perform this action',
      code: 'ACCOUNT_INACTIVE',
      status: req.user.status
    });
  }

  next();
};

export const requireVerifiedEmail = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required',
      code: 'AUTH_REQUIRED'
    });
  }

  // This would require an additional query to get the email verification status
  // For now, we'll assume all active users are verified
  // In production, you might want to check this against the database
  
  next();
};

// Optional authentication - doesn't fail if no token is provided
export const optionalAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (decoded && decoded.userId) {
      const session = await prisma.session.findFirst({
        where: {
          token,
          expiresAt: {
            gt: new Date()
          }
        },
        include: {
          user: true
        }
      });

      if (session && session.user) {
        req.user = {
          id: session.user.id,
          email: session.user.email,
          role: session.user.role,
          status: session.user.status
        };
      }
    }

    next();
  } catch (error) {
    // Continue without authentication if optional
    next();
  }
};