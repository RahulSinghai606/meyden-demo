import { validatePasswordStrength, isValidEmail, sanitizeEmail, generateOAuthState, validateOAuthState, hashPassword, comparePassword, generateTokens, verifyToken, createSession, invalidateAllUserSessions, rateLimitLoginAttempts, checkAccountLockout, incrementLoginAttempts, resetLoginAttempts } from '../auth';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Mock bcryptjs (not bcrypt)
jest.mock('bcryptjs', () => ({
    hash: jest.fn().mockResolvedValue('$2b$12$hashedpassword'),
    compare: jest.fn().mockResolvedValue(true),
    genSalt: jest.fn().mockResolvedValue('$2b$12$'),
}));

// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
    sign: jest.fn().mockReturnValue('mock-jwt-token'),
    verify: jest.fn().mockReturnValue({ userId: '1', email: 'test@example.com' }),
}));

// Mock prisma
jest.mock('../../config/database', () => ({
    __esModule: true,
    default: {
        session: {
            create: jest.fn().mockResolvedValue({
                id: 'session-1',
                token: 'session-token',
                userId: '1',
            }),
            updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        },
        user: {
            findUnique: jest.fn().mockResolvedValue({
                id: '1',
                loginAttempts: 0,
                lockoutUntil: null,
            }),
            update: jest.fn().mockResolvedValue({ id: '1' }),
        },
    },
}));

describe('Auth Utils', () => {
    describe('validatePasswordStrength', () => {
        it('should validate strong password', () => {
            const result = validatePasswordStrength('StrongP@ssw0rd');
            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should fail short password', () => {
            const result = validatePasswordStrength('Short1!');
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Password must be at least 8 characters long');
        });

        it('should fail password without uppercase', () => {
            const result = validatePasswordStrength('weakp@ssw0rd');
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Password must contain at least one uppercase letter');
        });

        it('should fail password without lowercase', () => {
            const result = validatePasswordStrength('WEAKP@SSW0RD');
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Password must contain at least one lowercase letter');
        });

        it('should fail password without number', () => {
            const result = validatePasswordStrength('WeakPassword!');
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Password must contain at least one number');
        });

        it('should fail password without special char', () => {
            const result = validatePasswordStrength('WeakPassword123');
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Password must contain at least one special character');
        });
    });

    describe('isValidEmail', () => {
        it('should return true for valid email', () => {
            expect(isValidEmail('test@example.com')).toBe(true);
        });

        it('should return false for invalid email', () => {
            expect(isValidEmail('invalid-email')).toBe(false);
            expect(isValidEmail('test@')).toBe(false);
            expect(isValidEmail('@example.com')).toBe(false);
        });
    });

    describe('sanitizeEmail', () => {
        it('should lowercase and trim email', () => {
            expect(sanitizeEmail('  Test@Example.COM  ')).toBe('test@example.com');
        });
    });

    describe('generateOAuthState', () => {
        it('should generate a state with expiration', () => {
            const result = generateOAuthState();
            expect(result).toHaveProperty('state');
            expect(result).toHaveProperty('expiresAt');
            expect(result.state).toHaveLength(64); // 32 bytes = 64 hex chars
            expect(result.expiresAt).toBeInstanceOf(Date);
            expect(result.expiresAt.getTime()).toBeGreaterThan(Date.now());
        });
    });

    describe('validateOAuthState', () => {
        it('should return true for valid matching state', () => {
            const { state, expiresAt } = generateOAuthState();
            const result = validateOAuthState(state, { state, expiresAt });
            expect(result).toBe(true);
        });

        it('should return false for expired state', () => {
            const state = 'a'.repeat(64);
            const expiredDate = new Date(Date.now() - 1000); // 1 second ago
            const result = validateOAuthState(state, { state, expiresAt: expiredDate });
            expect(result).toBe(false);
        });

        it('should return false for mismatched state', () => {
            const state1 = 'a'.repeat(64);
            const state2 = 'b'.repeat(64);
            const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
            const result = validateOAuthState(state1, { state: state2, expiresAt });
            expect(result).toBe(false);
        });

        it('should return false for different length states', () => {
            const state1 = 'short';
            const state2 = 'longer-state';
            const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
            const result = validateOAuthState(state1, { state: state2, expiresAt });
            expect(result).toBe(false);
        });
    });

    describe('hashPassword and comparePassword', () => {
        it('should hash a password', async () => {
            const password = 'TestP@ssw0rd';
            const hashed = await hashPassword(password);
            expect(hashed).toBeDefined();
            expect(hashed).not.toBe(password);
        });

        it('should compare passwords correctly', async () => {
            const password = 'TestP@ssw0rd';
            const hashed = await hashPassword(password);
            const isMatch = await comparePassword(password, hashed);
            expect(isMatch).toBe(true);
        });

        it('should return false for wrong password', async () => {
            const password = 'TestP@ssw0rd';
            const wrongPassword = 'WrongP@ssw0rd';
            const hashed = await hashPassword(password);
            const isMatch = await comparePassword(wrongPassword, hashed);
            expect(isMatch).toBe(false);
        });
    });

    describe('generateTokens and verifyToken', () => {
        it('should generate access and refresh tokens', () => {
            const tokens = generateTokens('user-123');
            expect(tokens).toHaveProperty('token');
            expect(tokens).toHaveProperty('refreshToken');
            expect(typeof tokens.token).toBe('string');
            expect(typeof tokens.refreshToken).toBe('string');
        });

        it('should verify a valid token', () => {
            const tokens = generateTokens('user-123');
            const decoded = verifyToken(tokens.token);
            expect(decoded).toHaveProperty('userId');
            expect(decoded.userId).toBe('user-123');
        });

        it('should return null for invalid token', () => {
            const decoded = verifyToken('invalid-token');
            expect(decoded).toBeNull();
        });
    });

    describe('rateLimitLoginAttempts', () => {
        it('should allow login when under limit', async () => {
            const result = await rateLimitLoginAttempts('test@example.com', '127.0.0.1');
            expect(result).toHaveProperty('allowed');
            expect(result).toHaveProperty('remaining');
        });
    });

    describe('checkAccountLockout', () => {
        it('should check if account is locked', async () => {
            const result = await checkAccountLockout('test@example.com');
            expect(result).toHaveProperty('locked');
            expect(result).toHaveProperty('remaining');
        });
    });

    describe('incrementLoginAttempts', () => {
        it('should increment login attempts', async () => {
            await expect(incrementLoginAttempts('test@example.com')).resolves.not.toThrow();
        });
    });

    describe('resetLoginAttempts', () => {
        it('should reset login attempts', async () => {
            await expect(resetLoginAttempts('test@example.com')).resolves.not.toThrow();
        });
    });

    describe('createSession', () => {
        it('should create a session', async () => {
            const result = await createSession('user-123', 'Chrome', '127.0.0.1', 'Mozilla/5.0');
            expect(result).toHaveProperty('session');
            expect(result).toHaveProperty('accessToken');
            expect(result).toHaveProperty('refreshToken');
        });
    });

    describe('invalidateAllUserSessions', () => {
        it('should invalidate all user sessions', async () => {
            await expect(invalidateAllUserSessions('user-123')).resolves.not.toThrow();
        });
    });
});
