import { config } from '../config/environment';
import { logger } from '../utils/logger';

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

/**
 * Email Service using Resend (free tier: 100 emails/day)
 * Setup: Get API key from https://resend.com and add RESEND_API_KEY to env
 */
export class EmailService {
    private apiKey: string;
    private fromAddress: string;
    private fromName: string;
    private isConfigured: boolean;

    constructor() {
        this.apiKey = config.resendApiKey;
        this.fromAddress = config.emailFromAddress;
        this.fromName = config.emailFromName;
        this.isConfigured = !!this.apiKey;

        if (!this.isConfigured) {
            logger.warn('Email service not configured. Set RESEND_API_KEY in environment.');
        }
    }

    async send(options: EmailOptions): Promise<boolean> {
        if (!this.isConfigured) {
            logger.info('Email would be sent (service not configured):', { to: options.to, subject: options.subject });
            return true; // Return true for development
        }

        try {
            const response = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    from: `${this.fromName} <${this.fromAddress}>`,
                    to: options.to,
                    subject: options.subject,
                    html: options.html,
                    text: options.text,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                logger.error('Failed to send email:', error);
                return false;
            }

            const result = await response.json() as { id: string };
            logger.info('Email sent successfully:', { id: result.id, to: options.to });
            return true;
        } catch (error) {
            logger.error('Email sending error:', error);
            return false;
        }
    }

    // ============ EMAIL TEMPLATES ============

    async sendVerificationEmail(to: string, token: string, baseUrl: string): Promise<boolean> {
        const verifyUrl = `${baseUrl}/api/v1/auth/verify-email?token=${token}`;

        return this.send({
            to,
            subject: 'Verify your Meyden account - تحقق من حسابك في ميدن',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">Meyden Platform</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">منصة ميدن</p>
          </div>
          <div style="padding: 30px; background: #f9fafb;">
            <h2 style="color: #1f2937;">Verify Your Email / تحقق من بريدك الإلكتروني</h2>
            <p style="color: #4b5563; line-height: 1.6;">
              Thank you for registering with Meyden. Please click the button below to verify your email address.
            </p>
            <p style="color: #4b5563; line-height: 1.6; direction: rtl;">
              شكراً لتسجيلك في ميدن. يرجى النقر على الزر أدناه للتحقق من عنوان بريدك الإلكتروني.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verifyUrl}" style="background: #667eea; color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                Verify Email / تحقق
              </a>
            </div>
            <p style="color: #9ca3af; font-size: 12px;">
              This link expires in 24 hours. If you didn't create an account, please ignore this email.
            </p>
          </div>
        </div>
      `,
        });
    }

    async sendPasswordResetEmail(to: string, token: string, baseUrl: string): Promise<boolean> {
        const resetUrl = `${baseUrl}/reset-password?token=${token}`;

        return this.send({
            to,
            subject: 'Reset your Meyden password - إعادة تعيين كلمة المرور',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">Meyden Platform</h1>
          </div>
          <div style="padding: 30px; background: #f9fafb;">
            <h2 style="color: #1f2937;">Password Reset / إعادة تعيين كلمة المرور</h2>
            <p style="color: #4b5563; line-height: 1.6;">
              You requested a password reset. Click the button below to set a new password.
            </p>
            <p style="color: #4b5563; line-height: 1.6; direction: rtl;">
              لقد طلبت إعادة تعيين كلمة المرور. انقر على الزر أدناه لتعيين كلمة مرور جديدة.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background: #ef4444; color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                Reset Password / إعادة تعيين
              </a>
            </div>
            <p style="color: #9ca3af; font-size: 12px;">
              This link expires in 1 hour. If you didn't request this, please ignore this email.
            </p>
          </div>
        </div>
      `,
        });
    }

    async sendVendorContactEmail(
        vendorEmail: string,
        senderName: string,
        senderEmail: string,
        message: string,
        vendorName: string
    ): Promise<boolean> {
        return this.send({
            to: vendorEmail,
            subject: `New inquiry from ${senderName} - استفسار جديد`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">New Contact Request</h1>
            <p style="color: rgba(255,255,255,0.9);">طلب اتصال جديد</p>
          </div>
          <div style="padding: 30px; background: #f9fafb;">
            <p style="color: #4b5563;">Hi ${vendorName},</p>
            <p style="color: #4b5563; line-height: 1.6;">
              You have received a new inquiry through Meyden Platform:
            </p>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
              <p style="margin: 0 0 10px 0;"><strong>From:</strong> ${senderName}</p>
              <p style="margin: 0 0 10px 0;"><strong>Email:</strong> ${senderEmail}</p>
              <p style="margin: 0;"><strong>Message:</strong></p>
              <p style="color: #1f2937; white-space: pre-wrap;">${message}</p>
            </div>
            <p style="color: #9ca3af; font-size: 12px;">
              Reply directly to this email or contact ${senderEmail}
            </p>
          </div>
        </div>
      `,
        });
    }

    async sendWelcomeEmail(to: string, firstName: string): Promise<boolean> {
        return this.send({
            to,
            subject: 'Welcome to Meyden! - أهلاً بك في ميدن',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">Welcome to Meyden!</h1>
            <p style="color: rgba(255,255,255,0.9);">!أهلاً بك في ميدن</p>
          </div>
          <div style="padding: 30px; background: #f9fafb;">
            <h2 style="color: #1f2937;">Hello ${firstName}! / مرحباً ${firstName}</h2>
            <p style="color: #4b5563; line-height: 1.6;">
              Thank you for joining Meyden Platform. Here's what you can do:
            </p>
            <ul style="color: #4b5563; line-height: 1.8;">
              <li>🏢 Discover AI-ready vendors</li>
              <li>📊 Assess your organization's AI readiness</li>
              <li>💬 Join our community discussions</li>
              <li>📈 Track your progress with analytics</li>
            </ul>
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://meyden.com" style="background: #667eea; color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                Get Started / ابدأ الآن
              </a>
            </div>
          </div>
        </div>
      `,
        });
    }
}

// Singleton instance
export const emailService = new EmailService();
