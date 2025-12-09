import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

// Custom error class
export class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Error handling for Prisma errors
const handlePrismaError = (error: any): AppError => {
  let message = 'Database error';
  let statusCode = 500;

  switch (error.code) {
    case 'P2002':
      message = `Duplicate field value: ${error.meta?.target?.join(', ')}`;
      statusCode = 400;
      break;
    case 'P2014':
      message = 'Invalid relation';
      statusCode = 400;
      break;
    case 'P2003':
      message = 'Invalid reference in related field';
      statusCode = 400;
      break;
    case 'P2025':
      message = 'Record not found';
      statusCode = 404;
      break;
    default:
      message = error.message || 'Database operation failed';
  }

  return new AppError(message, statusCode);
};

// Error handling for JWT errors
const handleJWTError = (error: any): AppError => {
  let message = 'Invalid token';
  let statusCode = 401;

  if (error.name === 'TokenExpiredError') {
    message = 'Token expired';
    statusCode = 401;
  } else if (error.name === 'JsonWebTokenError') {
    message = 'Invalid token';
    statusCode = 401;
  }

  return new AppError(message, statusCode);
};

// Send error response in development
const sendErrorDev = (err: AppError, res: Response): void => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

// Send error response in production
const sendErrorProd = (err: AppError, res: Response): void => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // Programming or other unknown error: don't leak error details
    logger.error('ERROR:', err);

    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!',
    });
  }
};

// Global error handling middleware
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // Prisma error
  if (err.code?.startsWith('P')) {
    error = handlePrismaError(err);
  }

  // JWT error
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    error = handleJWTError(err);
  }

  // Validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val: any) => val.message).join(', ');
    error = new AppError(message, 400);
  }

  // Cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    const message = `Invalid ${err.path}: ${err.value}`;
    error = new AppError(message, 400);
  }

  const statusCode = error.statusCode || err.statusCode || 500;
  const message = error.message || err.message || 'Internal server error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(new AppError(message, statusCode), res);
  } else {
    sendErrorProd(new AppError(message, statusCode), res);
  }
};

// 404 handler for unknown routes
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const message = `Route ${req.originalUrl} not found`;
  logger.warn(message, {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
  });
  next(new AppError(message, 404));
};

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Helper function to create errors
export const createError = (message: string, statusCode: number): AppError => {
  return new AppError(message, statusCode);
};