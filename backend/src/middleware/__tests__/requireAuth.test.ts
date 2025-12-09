import { requireAuth, optionalAuth, AuthRequest } from '../requireAuth';
import { Response, NextFunction } from 'express';
import { verifyToken } from '../../utils/auth';

// Mock verifyToken
jest.mock('../../utils/auth', () => ({
    verifyToken: jest.fn(),
}));

describe('requireAuth Middleware', () => {
    let req: Partial<AuthRequest>;
    let res: Partial<Response>;
    let next: NextFunction;
    let jsonMock: jest.Mock;
    let statusMock: jest.Mock;

    beforeEach(() => {
        req = {
            headers: {},
        };
        jsonMock = jest.fn();
        statusMock = jest.fn().mockReturnValue({ json: jsonMock });
        res = {
            status: statusMock,
        };
        next = jest.fn();
        (verifyToken as jest.Mock).mockReset();
    });

    describe('requireAuth', () => {
        it('should call next if token is valid', async () => {
            req.headers = { authorization: 'Bearer validtoken' };
            (verifyToken as jest.Mock).mockReturnValue({ userId: '1' });

            await requireAuth(req as AuthRequest, res as Response, next);

            expect(next).toHaveBeenCalled();
            expect(req.user).toEqual({ userId: '1' });
        });

        it('should return 401 if no header', async () => {
            await requireAuth(req as AuthRequest, res as Response, next);

            expect(statusMock).toHaveBeenCalledWith(401);
            expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringContaining('Authentication required') }));
        });

        it('should return 401 if invalid token', async () => {
            req.headers = { authorization: 'Bearer invalid' };
            (verifyToken as jest.Mock).mockReturnValue(null);

            await requireAuth(req as AuthRequest, res as Response, next);

            expect(statusMock).toHaveBeenCalledWith(401);
        });
    });

    describe('optionalAuth', () => {
        it('should attach user if token is valid', async () => {
            req.headers = { authorization: 'Bearer validtoken' };
            (verifyToken as jest.Mock).mockReturnValue({ userId: '1' });

            await optionalAuth(req as AuthRequest, res as Response, next);

            expect(next).toHaveBeenCalled();
            expect(req.user).toEqual({ userId: '1' });
        });

        it('should continue if no header', async () => {
            await optionalAuth(req as AuthRequest, res as Response, next);

            expect(next).toHaveBeenCalled();
            expect(req.user).toBeUndefined();
        });
    });
});
