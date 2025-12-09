import { Response } from 'express';
import { logger } from './logger';
import { maskPII } from './sanitize';

/**
 * Standardized error handler for route controllers.
 * Logs the error and sends a 500 JSON response.
 * @param res - Express Response object
 * @param error - The error object or message
 * @param code - Application specific error code
 * @param message - User facing error message (default: 'Internal server error')
 */
export const handleRouteError = (
    res: Response,
    error: unknown,
    code: string,
    message = 'Internal server error'
) => {
    logger.error(message, maskPII(error));
    res.status(500).json({
        error: message,
        code,
    });
};
