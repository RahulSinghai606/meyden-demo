import { errorHandler, AppError, notFoundHandler } from '../errorHandler';
import { Request, Response, NextFunction } from 'express';

// Mock logger
jest.mock('../../utils/logger', () => ({
    logger: {
        error: jest.fn(),
        warn: jest.fn(),
    },
}));

describe('Error Handler', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;
    let jsonMock: jest.Mock;
    let statusMock: jest.Mock;

    beforeEach(() => {
        req = {
            originalUrl: '/test',
            method: 'GET',
            ip: '127.0.0.1',
            get: jest.fn(),
        };
        jsonMock = jest.fn();
        statusMock = jest.fn().mockReturnValue({ json: jsonMock });
        res = {
            status: statusMock,
        };
        next = jest.fn();
    });

    it('should handle AppError', () => {
        const error = new AppError('Test error', 400);
        errorHandler(error, req as Request, res as Response, next);

        expect(statusMock).toHaveBeenCalledWith(400);
        expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({ message: 'Test error' }));
    });

    it('should handle Prisma error P2002', () => {
        const error = { code: 'P2002', meta: { target: ['email'] } };
        errorHandler(error, req as Request, res as Response, next);

        expect(statusMock).toHaveBeenCalledWith(400);
        expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('Duplicate field value') }));
    });

    it('should handle 404', () => {
        notFoundHandler(req as Request, res as Response, next);
        expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });
});
