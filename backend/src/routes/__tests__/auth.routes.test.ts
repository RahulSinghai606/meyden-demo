import request from 'supertest';
import express from 'express';
import authRoutes from '../auth.routes';
import { config } from '../../config/environment';

// Mock dependencies
jest.mock('../../config/database', () => ({
    __esModule: true,
    default: {
        user: {
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            findFirst: jest.fn(),
        },
        session: {
            create: jest.fn(),
            deleteMany: jest.fn(),
            findFirst: jest.fn(),
            update: jest.fn(),
        },
    },
}));

jest.mock('../../utils/auth', () => ({
    hashPassword: jest.fn().mockResolvedValue('hashed'),
    comparePassword: jest.fn().mockResolvedValue(true),
    generateTokens: jest.fn().mockReturnValue({ token: 'access', refreshToken: 'refresh' }),
    createSession: jest.fn().mockResolvedValue({ session: { id: '1', expiresAt: new Date() }, accessToken: 'access', refreshToken: 'refresh' }),
    invalidateSession: jest.fn(),
    invalidateAllUserSessions: jest.fn(),
    generateEmailVerificationToken: jest.fn().mockReturnValue({ token: 'verify', expiresAt: new Date() }),
    generatePasswordResetToken: jest.fn().mockReturnValue({ token: 'reset', expiresAt: new Date() }),
    isValidEmail: jest.fn().mockReturnValue(true),
    sanitizeEmail: jest.fn().mockImplementation((e) => e),
    validatePasswordStrength: jest.fn().mockReturnValue({ valid: true, errors: [] }),
    checkAccountLockout: jest.fn().mockResolvedValue({ locked: false }),
    incrementLoginAttempts: jest.fn(),
    resetLoginAttempts: jest.fn(),
    rateLimitLoginAttempts: jest.fn().mockResolvedValue({ allowed: true }),
    verifyToken: jest.fn().mockReturnValue({ userId: '1' }),
}));

jest.mock('jsonwebtoken', () => ({
    verify: jest.fn().mockReturnValue({ userId: '1', type: 'refresh' }),
}));

import prisma from '../../config/database';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/auth/register', () => {
        it('should register a user', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
            (prisma.user.create as jest.Mock).mockResolvedValue({ id: '1', email: 'test@example.com' });

            const res = await request(app).post('/api/auth/register').send({
                email: 'test@example.com',
                password: 'Password1!',
                firstName: 'John',
                lastName: 'Doe',
            });

            expect(res.status).toBe(201);
        });

        it('should return 400 for invalid email', async () => {
            const res = await request(app).post('/api/auth/register').send({
                email: 'invalid-email',
                password: 'Password1!',
                firstName: 'John',
                lastName: 'Doe',
            });
            expect(res.status).toBe(400);
        });

        it('should return 409 if user exists', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: '1' });
            const res = await request(app).post('/api/auth/register').send({
                email: 'test@example.com',
                password: 'Password1!',
                firstName: 'John',
                lastName: 'Doe',
            });
            expect(res.status).toBe(409);
        });
    });

    describe('POST /api/auth/login', () => {
        it('should login a user', async () => {
            const mockUser = { id: '1', email: 'test@example.com', passwordHash: 'hashed', status: 'ACTIVE' };
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

            const res = await request(app).post('/api/auth/login').send({
                email: 'test@example.com',
                password: 'Password1!',
            });

            expect(res.status).toBe(200);
            expect(res.body.tokens).toBeDefined();
        });

        it('should return 401 for invalid credentials', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
            const res = await request(app).post('/api/auth/login').send({
                email: 'test@example.com',
                password: 'Password1!',
            });
            expect(res.status).toBe(401);
        });
    });

    describe('POST /api/auth/logout', () => {
        it('should logout a user', async () => {
            const res = await request(app)
                .post('/api/auth/logout')
                .set('Authorization', 'Bearer token');

            expect(res.status).toBe(200);
        });
    });
});
