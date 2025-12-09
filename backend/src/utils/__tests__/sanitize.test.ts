import { sanitizeInput, sanitizeHTML, maskPII, sanitizeEmail, sanitizeUserForBroadcast, sanitizeRequestBody } from '../sanitize';

describe('Sanitize Utils', () => {
    describe('sanitizeInput', () => {
        it('should sanitize string input', () => {
            const input = '<script>alert("xss")</script>Hello';
            expect(sanitizeInput(input)).toBe('Hello');
        });

        it('should sanitize array input', () => {
            const input = ['<script>alert("xss")</script>', 'Hello'];
            expect(sanitizeInput(input)).toEqual(['', 'Hello']);
        });

        it('should sanitize object input', () => {
            const input = { key: '<script>alert("xss")</script>Value' };
            expect(sanitizeInput(input)).toEqual({ key: 'Value' });
        });

        it('should handle null', () => {
            expect(sanitizeInput(null)).toBeNull();
        });
    });

    describe('sanitizeHTML', () => {
        it('should allow safe tags', () => {
            const input = '<b>Bold</b><script>alert("xss")</script>';
            expect(sanitizeHTML(input)).toBe('<b>Bold</b>');
        });
    });

    describe('maskPII', () => {
        it('should mask email', () => {
            const input = { email: 'test@example.com' };
            expect(maskPII(input)).toEqual({ email: 't***@example.com' });
        });

        it('should mask password', () => {
            const input = { password: 'secret123' };
            expect(maskPII(input)).toEqual({ password: '***MASKED***' });
        });

        it('should mask nested objects', () => {
            const input = { user: { email: 'test@example.com' } };
            expect(maskPII(input)).toEqual({ user: { email: 't***@example.com' } });
        });

        it('should handle arrays', () => {
            const input = [{ email: 'test@example.com' }];
            expect(maskPII(input)).toEqual([{ email: 't***@example.com' }]);
        });

        it('should handle null', () => {
            expect(maskPII(null)).toBeNull();
        });
    });

    describe('sanitizeEmail', () => {
        it('should lowercase and trim email', () => {
            expect(sanitizeEmail('  Test@Example.COM  ')).toBe('test@example.com');
        });
    });

    describe('sanitizeUserForBroadcast', () => {
        it('should remove sensitive fields', () => {
            const user = {
                id: '1',
                email: 'test@example.com',
                password: 'secret',
                refreshToken: 'token',
                resetToken: 'reset',
                verificationToken: 'verify',
                loginAttempts: 5,
                lockoutUntil: new Date(),
                firstName: 'John',
            };

            const sanitized = sanitizeUserForBroadcast(user);
            expect(sanitized).toEqual({
                id: '1',
                email: 'test@example.com',
                firstName: 'John',
            });
            expect(sanitized.password).toBeUndefined();
            expect(sanitized.refreshToken).toBeUndefined();
        });

        it('should return null for null input', () => {
            expect(sanitizeUserForBroadcast(null)).toBeNull();
        });
    });

    describe('sanitizeRequestBody', () => {
        it('should sanitize body content', () => {
            const body = {
                name: '<script>alert("xss")</script>John',
                age: 30,
            };
            expect(sanitizeRequestBody(body)).toEqual({
                name: 'John',
                age: 30,
            });
        });
    });
});
