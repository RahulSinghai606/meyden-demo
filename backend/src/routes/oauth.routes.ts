import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../config/database';
import { config } from '../config/environment';
import { createSession } from '../utils/auth';
import { logger } from '../utils/logger';
import { maskPII } from '../utils/sanitize';
import { emailService } from '../services/email.service';

const router = Router();

// Store OAuth state temporarily (in production, use Redis)
const oauthStates = new Map<string, { expiresAt: Date; redirectUrl: string }>();

// ============ GOOGLE OAUTH ============

/**
 * Initiate Google OAuth flow
 * GET /api/v1/auth/oauth/google
 */
router.get('/google', (req: Request, res: Response) => {
    if (!config.googleClientId) {
        return res.status(503).json({
            error: 'Google OAuth not configured',
            code: 'OAUTH_NOT_CONFIGURED',
            setup: 'Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to environment variables',
        });
    }

    const state = uuidv4();
    const redirectUrl = (req.query.redirect as string) || '/';

    // Store state for validation
    oauthStates.set(state, {
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        redirectUrl,
    });

    // Clean up old states
    for (const [key, value] of oauthStates.entries()) {
        if (value.expiresAt < new Date()) {
            oauthStates.delete(key);
        }
    }

    const params = new URLSearchParams({
        client_id: config.googleClientId,
        redirect_uri: config.googleCallbackUrl,
        response_type: 'code',
        scope: 'openid email profile',
        state,
        access_type: 'offline',
        prompt: 'consent',
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    res.redirect(authUrl);
});

/**
 * Google OAuth callback
 * GET /api/v1/auth/oauth/google/callback
 */
router.get('/google/callback', async (req: Request, res: Response) => {
    try {
        const { code, state, error } = req.query;

        if (error) {
            logger.warn('Google OAuth error:', { error });
            return res.redirect(`/login?error=${encodeURIComponent(error as string)}`);
        }

        if (!code || !state) {
            return res.redirect('/login?error=missing_params');
        }

        // Validate state
        const storedState = oauthStates.get(state as string);
        if (!storedState || storedState.expiresAt < new Date()) {
            oauthStates.delete(state as string);
            return res.redirect('/login?error=invalid_state');
        }
        oauthStates.delete(state as string);

        // Exchange code for tokens
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                code: code as string,
                client_id: config.googleClientId,
                client_secret: config.googleClientSecret,
                redirect_uri: config.googleCallbackUrl,
                grant_type: 'authorization_code',
            }),
        });

        if (!tokenResponse.ok) {
            const error = await tokenResponse.json();
            logger.error('Google token exchange failed:', error);
            return res.redirect('/login?error=token_exchange_failed');
        }

        const tokens = await tokenResponse.json() as { access_token: string; refresh_token?: string };

        // Get user info
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${tokens.access_token}` },
        });

        if (!userInfoResponse.ok) {
            logger.error('Failed to get Google user info');
            return res.redirect('/login?error=user_info_failed');
        }

        const googleUser = await userInfoResponse.json() as {
            id: string;
            email: string;
            given_name?: string;
            family_name?: string;
            picture?: string;
        };
        const { id: googleId, email, given_name: firstName, family_name: lastName, picture } = googleUser;

        // Find or create user
        let user = await prisma.user.findFirst({
            where: {
                OR: [
                    { googleId },
                    { email },
                ],
            },
        });

        if (!user) {
            // Create new user
            user = await prisma.user.create({
                data: {
                    email,
                    googleId,
                    firstName: firstName || 'User',
                    lastName: lastName || '',
                    role: 'USER',
                    status: 'ACTIVE',
                    emailVerified: true, // Google emails are verified
                },
            });

            // Send welcome email
            await emailService.sendWelcomeEmail(email, firstName || 'User');
            logger.info('New user created via Google OAuth', maskPII({ userId: user.id, email }));
        } else if (!user.googleId) {
            // Link Google account to existing user
            user = await prisma.user.update({
                where: { id: user.id },
                data: {
                    googleId,
                    emailVerified: true,
                },
            });
            logger.info('Google account linked to existing user', maskPII({ userId: user.id }));
        }

        // Create session
        const { accessToken, refreshToken } = await createSession(
            user.id,
            'Google OAuth',
            req.ip || 'unknown',
            req.get('user-agent')
        );

        // Update last login
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() },
        });

        logger.info('User logged in via Google OAuth', maskPII({ userId: user.id, email: user.email }));

        // Redirect with tokens (in production, use secure cookies or session)
        const redirectUrl = storedState.redirectUrl || '/';
        res.redirect(`${redirectUrl}?token=${accessToken}&refresh=${refreshToken}`);

    } catch (error) {
        logger.error('Google OAuth callback error:', error);
        res.redirect('/login?error=oauth_failed');
    }
});

// ============ OAUTH STATUS ============

/**
 * Get OAuth configuration status
 * GET /api/v1/auth/oauth/status
 */
router.get('/status', (req: Request, res: Response) => {
    res.json({
        google: {
            enabled: !!config.googleClientId,
            configured: !!config.googleClientId && !!config.googleClientSecret,
        },
        microsoft: {
            enabled: !!config.microsoftClientId,
            configured: !!config.microsoftClientId && !!config.microsoftClientSecret,
        },
    });
});

export default router;
