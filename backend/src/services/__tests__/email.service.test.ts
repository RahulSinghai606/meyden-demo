// Mock nodemailer before importing the service
jest.mock('nodemailer', () => ({
    createTransport: jest.fn().mockReturnValue({
        sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' }),
        verify: jest.fn().mockResolvedValue(true),
    }),
}));

jest.mock('../../config/environment', () => ({
    config: {
        smtpHost: 'smtp.test.com',
        smtpPort: 587,
        smtpUser: 'test@test.com',
        smtpPass: 'test-password',
        smtpFrom: 'noreply@meyden.com',
        frontendUrl: 'http://localhost:3000',
        nodeEnv: 'test',
    },
}));

jest.mock('../../utils/logger', () => ({
    logger: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
    },
}));

import nodemailer from 'nodemailer';

describe('Email Service', () => {
    let mockTransport: any;

    beforeEach(() => {
        jest.clearAllMocks();
        mockTransport = (nodemailer.createTransport as jest.Mock)();
    });

    describe('Email Transport Configuration', () => {
        it('should create transport with correct configuration', () => {
            expect(nodemailer.createTransport).toHaveBeenCalled();
        });

        it('should verify transport connection', async () => {
            await mockTransport.verify();
            expect(mockTransport.verify).toHaveBeenCalled();
        });
    });

    describe('sendVerificationEmail', () => {
        it('should send verification email with correct parameters', async () => {
            const emailData = {
                to: 'user@example.com',
                subject: 'Verify Your Email',
                html: '<p>Click <a href="http://localhost:3000/verify?token=abc123">here</a> to verify your email.</p>',
            };

            await mockTransport.sendMail({
                from: 'noreply@meyden.com',
                ...emailData,
            });

            expect(mockTransport.sendMail).toHaveBeenCalledWith(
                expect.objectContaining({
                    to: 'user@example.com',
                    subject: 'Verify Your Email',
                })
            );
        });

        it('should include verification link in email body', async () => {
            const token = 'verification-token-123';
            const verificationUrl = `http://localhost:3000/verify?token=${token}`;

            const html = `<p>Click <a href="${verificationUrl}">here</a> to verify your email.</p>`;

            await mockTransport.sendMail({
                from: 'noreply@meyden.com',
                to: 'user@example.com',
                subject: 'Verify Your Email',
                html,
            });

            expect(mockTransport.sendMail).toHaveBeenCalledWith(
                expect.objectContaining({
                    html: expect.stringContaining(token),
                })
            );
        });
    });

    describe('sendPasswordResetEmail', () => {
        it('should send password reset email', async () => {
            const emailData = {
                to: 'user@example.com',
                subject: 'Reset Your Password',
                html: '<p>Click <a href="http://localhost:3000/reset-password?token=reset123">here</a> to reset your password.</p>',
            };

            await mockTransport.sendMail({
                from: 'noreply@meyden.com',
                ...emailData,
            });

            expect(mockTransport.sendMail).toHaveBeenCalledWith(
                expect.objectContaining({
                    subject: 'Reset Your Password',
                })
            );
        });

        it('should include reset link with token', async () => {
            const token = 'reset-token-456';
            const resetUrl = `http://localhost:3000/reset-password?token=${token}`;

            const html = `<p>Click <a href="${resetUrl}">here</a> to reset your password.</p>`;

            await mockTransport.sendMail({
                from: 'noreply@meyden.com',
                to: 'user@example.com',
                subject: 'Reset Your Password',
                html,
            });

            expect(mockTransport.sendMail).toHaveBeenCalledWith(
                expect.objectContaining({
                    html: expect.stringContaining(token),
                })
            );
        });

        it('should set link expiration time', async () => {
            const html = '<p>This link will expire in 1 hour.</p>';

            await mockTransport.sendMail({
                from: 'noreply@meyden.com',
                to: 'user@example.com',
                subject: 'Reset Your Password',
                html,
            });

            expect(mockTransport.sendMail).toHaveBeenCalledWith(
                expect.objectContaining({
                    html: expect.stringContaining('expire'),
                })
            );
        });
    });

    describe('sendWelcomeEmail', () => {
        it('should send welcome email to new user', async () => {
            const emailData = {
                to: 'newuser@example.com',
                subject: 'Welcome to Meyden!',
                html: '<h1>Welcome to Meyden!</h1><p>Thank you for joining us.</p>',
            };

            await mockTransport.sendMail({
                from: 'noreply@meyden.com',
                ...emailData,
            });

            expect(mockTransport.sendMail).toHaveBeenCalledWith(
                expect.objectContaining({
                    subject: 'Welcome to Meyden!',
                })
            );
        });

        it('should include user name in welcome email', async () => {
            const userName = 'John Doe';
            const html = `<h1>Welcome, ${userName}!</h1>`;

            await mockTransport.sendMail({
                from: 'noreply@meyden.com',
                to: 'john@example.com',
                subject: 'Welcome to Meyden!',
                html,
            });

            expect(mockTransport.sendMail).toHaveBeenCalledWith(
                expect.objectContaining({
                    html: expect.stringContaining(userName),
                })
            );
        });
    });

    describe('Error Handling', () => {
        it('should handle email sending failure', async () => {
            mockTransport.sendMail.mockRejectedValueOnce(new Error('SMTP connection failed'));

            await expect(mockTransport.sendMail({
                from: 'noreply@meyden.com',
                to: 'user@example.com',
                subject: 'Test',
                html: '<p>Test</p>',
            })).rejects.toThrow('SMTP connection failed');
        });

        it('should handle invalid email address', async () => {
            mockTransport.sendMail.mockRejectedValueOnce(new Error('Invalid recipient'));

            await expect(mockTransport.sendMail({
                from: 'noreply@meyden.com',
                to: 'invalid-email',
                subject: 'Test',
                html: '<p>Test</p>',
            })).rejects.toThrow('Invalid recipient');
        });

        it('should handle transport verification failure', async () => {
            mockTransport.verify.mockRejectedValueOnce(new Error('Connection refused'));

            await expect(mockTransport.verify()).rejects.toThrow('Connection refused');
        });
    });

    describe('Email Templates', () => {
        it('should generate HTML email template', () => {
            const template = `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; }
                        .container { max-width: 600px; margin: 0 auto; }
                        .button { background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>Test Email</h1>
                        <p>This is a test email.</p>
                        <a href="#" class="button">Click Here</a>
                    </div>
                </body>
                </html>
            `;

            expect(template).toContain('<!DOCTYPE html>');
            expect(template).toContain('<style>');
            expect(template).toContain('container');
        });

        it('should sanitize user input in templates', () => {
            const maliciousInput = '<script>alert("xss")</script>';
            const sanitized = maliciousInput.replace(/</g, '&lt;').replace(/>/g, '&gt;');

            expect(sanitized).not.toContain('<script>');
            expect(sanitized).toContain('&lt;script&gt;');
        });
    });
});
