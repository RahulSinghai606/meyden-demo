import { Request } from 'express';

interface PaginationParams {
    page: number;
    limit: number;
    offset: number;
}

/**
 * Extracts pagination parameters from the request query.
 * @param req - The Express request object.
 * @param defaultLimit - The default limit if not specified (default: 20).
 * @returns An object containing page, limit, and offset.
 */
export const getPaginationParams = (req: Request, defaultLimit = 20): PaginationParams => {
    const page = Number.parseInt(req.query.page as string, 10) || 1;
    const limit = Number.parseInt(req.query.limit as string, 10) || defaultLimit;
    const offset = (page - 1) * limit;

    return { page, limit, offset };
};
