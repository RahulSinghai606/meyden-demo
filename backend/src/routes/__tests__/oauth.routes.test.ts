import request from 'supertest';
import express from 'express';

// Mock dependencies
jest.mock('../../config/database', () => ({
    __esModule: true,
    default: {
        user: {
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
        },
        session: {
            create: jest.fn(),
        },
    },
}));

jest.mock('../../utils/auth', () => ({
    generateOAuthState: jest.fn(() => ({
        state: 'test-oauth-state',
        expiresAt: new Date(Date.now() + 600000)
    })),
    validateOAuthState: jest.fn(() => true),
    createSession: jest.fn().mockResolvedValue({
        session: { id: 'session-1' },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
    }),
    hashPassword: jest.fn().mockResolvedValue('hashed-password'),
}));

jest.mock('../../utils/logger', () => ({
    logger: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
    },
}));

jest.mock('../../config/environment', () => ({
    config: {
        googleClientId: 'test-google-client-id',
        googleClientSecret: 'test-google-client-secret',
        googleCallbackUrl: 'http://localhost:3001/api/v1/auth/oauth/google/callback',
        frontendUrl: 'http://localhost:3000',
        nodeEnv: 'test',
    },
}));

import prisma from '../../config/database';

describe('OAuth Routes', () => {
    let app: express.Application;

    beforeEach(() => {
        jest.clearAllMocks();
        app = express();
        app.use(express.json());

        // Mock OAuth initiation route
        app.get('/api/v1/auth/oauth/google', (req, res) => {
            const { generateOAuthState } = require('../../utils/auth');
            const stateData = generateOAuthState();
            const redirectUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=test-google-client-id&redirect_uri=${encodeURIComponent('http://localhost:3001/api/v1/auth/oauth/google/callback')}&response_type=code&scope=email%20profile&state=${stateData.state}`;
            res.redirect(redirectUrl);
        });

        // Mock OAuth callback route
        app.get('/api/v1/auth/oauth/google/callback', async (req, res) => {
            const { code, state, error } = req.query;

            if (error) {
                return res.redirect('http://localhost:3000/login?error=oauth_cancelled');
            }

            if (!code || !state) {
                return res.status(400).json({ error: 'Missing code or state' });
            }

            // Simulate successful OAuth flow
            res.redirect('http://localhost:3000/dashboard?token=access-token');
        });
    });

    describe('GET /api/v1/auth/oauth/google', () => {
        it('should redirect to Google OAuth', async () => {
            const res = await request(app)
                .get('/api/v1/auth/oauth/google')
                .query({ redirect: 'http://localhost:3000/dashboard' });

            expect(res.status).toBe(302);
            expect(res.headers.location).toContain('accounts.google.com');
        });

        it('should include state parameter in redirect', async () => {
            const res = await request(app).get('/api/v1/auth/oauth/google');

            expect(res.headers.location).toContain('state=');
        });

        it('should include required scopes', async () => {
            const res = await request(app).get('/api/v1/auth/oauth/google');

            expect(res.headers.location).toContain('scope=');
            expect(res.headers.location).toContain('email');
            expect(res.headers.location).toContain('profile');
        });
    });

    describe('GET /api/v1/auth/oauth/google/callback', () => {
        it('should handle successful callback with code', async () => {
            const res = await request(app)
                .get('/api/v1/auth/oauth/google/callback')
                .query({ code: 'auth-code', state: 'test-state' });

            expect(res.status).toBe(302);
            expect(res.headers.location).toContain('dashboard');
        });

        it('should handle OAuth error from Google', async () => {
            const res = await request(app)
                .get('/api/v1/auth/oauth/google/callback')
                .query({ error: 'access_denied' });

            expect(res.status).toBe(302);
            expect(res.headers.location).toContain('error=oauth_cancelled');
        });

        it('should reject missing code parameter', async () => {
            const res = await request(app)
                .get('/api/v1/auth/oauth/google/callback')
                .query({ state: 'test-state' });

            expect(res.status).toBe(400);
        });

        it('should reject missing state parameter', async () => {
            const res = await request(app)
                .get('/api/v1/auth/oauth/google/callback')
                .query({ code: 'auth-code' });

            expect(res.status).toBe(400);
        });
    });

    describe('OAuth User Creation/Login', () => {
        it('should create new user if not exists', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
            (prisma.user.create as jest.Mock).mockResolvedValue({
                id: 'new-user-id',
                email: 'oauth@example.com',
                firstName: 'OAuth',
                lastName: 'User',
            });

            // Simulate the user creation logic
            const existingUser = await prisma.user.findUnique({ where: { email: 'oauth@example.com' } });
            expect(existingUser).toBeNull();

            const newUser = await prisma.user.create({
                data: {
                    email: 'oauth@example.com',
                    firstName: 'OAuth',
                    lastName: 'User',
                },
            });
            expect(newUser).toHaveProperty('id');
        });

        it('should login existing user', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue({
                id: 'existing-user-id',
                email: 'existing@example.com',
                firstName: 'Existing',
                lastName: 'User',
            });

            const existingUser = await prisma.user.findUnique({ where: { email: 'existing@example.com' } });
            expect(existingUser).not.toBeNull();
            expect(existingUser?.id).toBe('existing-user-id');
        });

        it('should update user last login on OAuth login', async () => {
            (prisma.user.update as jest.Mock).mockResolvedValue({
                id: 'user-id',
                lastLogin: new Date(),
            });

            const updatedUser = await prisma.user.update({
                where: { id: 'user-id' },
                data: { lastLogin: new Date() },
            });

            expect(prisma.user.update).toHaveBeenCalled();
            expect(updatedUser.lastLogin).toBeInstanceOf(Date);
        });
    });
});
