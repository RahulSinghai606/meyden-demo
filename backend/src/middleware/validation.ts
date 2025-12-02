import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { getCurrentUTC } from '../utils/datetime';

// Request validation middleware
export const requestValidator = (req: Request, res: Response, next: NextFunction): void => {
  // Basic request sanitization and validation
  
  // Log suspicious requests
  const suspiciousPatterns = [
    /(<script|javascript:|onload=|onerror=)/i,
    /(\bunion\b.*\bselect\b|\bdrop\b.*\btable\b|\bdelete\b.*\bfrom\b)/i,
  ];

  const requestData = JSON.stringify({
    url: req.originalUrl,
    method: req.method,
    headers: req.headers,
    query: req.query,
    body: req.body,
  });

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(requestData)) {
      logger.warn('Suspicious request detected:', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.originalUrl,
        pattern: pattern.source,
      });
    }
  }

  // Validate content type for POST/PUT requests
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.get('Content-Type');
    if (!contentType || (!contentType.includes('application/json') && !contentType.includes('application/x-www-form-urlencoded'))) {
      logger.warn('Invalid content type:', {
        ip: req.ip,
        contentType,
        url: req.originalUrl,
      });
    }
  }

  // Add request ID for tracking
  req.requestId = generateRequestId();

  next();
};

// Generate unique request ID
const generateRequestId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Extend Request interface to include requestId
declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}