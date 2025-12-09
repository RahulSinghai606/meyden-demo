import { validatePasswordStrength, isValidEmail, sanitizeEmail } from '../auth';

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
});
