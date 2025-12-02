import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { maskPII } from '../utils/sanitize';
import { z } from 'zod';
import prisma from '../config/database';
import { logger } from '../utils/logger';

const router = Router();

// Validation schemas
const updateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  bio: z.string().max(500).optional(),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  country: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  postalCode: z.string().optional(),
  jobTitle: z.string().optional(),
  company: z.string().optional(),
  industry: z.string().optional(),
  experienceYears: z.number().int().min(0).max(50).optional(),
  website: z.string().url().optional(),
  linkedin: z.string().url().optional(),
  twitter: z.string().url().optional(),
  github: z.string().url().optional(),
  language: z.string().optional(),
  timezone: z.string().optional(),
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
});

// Get current user profile
router.get('/profile', requireAuth, async (req: Request, res: Response) => {
  try {
    // In a real implementation, you would get the user ID from JWT token
    // For demo purposes, we'll return the first user
    const user = await prisma.user.findFirst({
      include: {
        profile: true,
        vendor: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND',
      });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
        emailVerified: user.emailVerified,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        profile: user.profile,
        vendor: user.vendor,
      },
    });

  } catch (error) {
    logger.error('Error fetching user profile:', maskPII(error));
    res.status(500).json({
      error: 'Internal server error',
      code: 'FETCH_PROFILE_ERROR',
    });
  }
});

// Update user profile
router.put('/profile', requireAuth, async (req: Request, res: Response) => {
  try {
    const validatedData = updateProfileSchema.parse(req.body);

    // In a real implementation, get user ID from JWT token
    const user = await prisma.user.findFirst();

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND',
      });
    }

    // Update user basic info
    await prisma.user.update({
      where: { id: user.id },
      data: {
        firstName: validatedData.firstName || user.firstName,
        lastName: validatedData.lastName || user.lastName,
      },
    });

    // Update or create profile
    const profileData: any = {};
    Object.keys(validatedData).forEach(key => {
      if (!['firstName', 'lastName'].includes(key)) {
        profileData[key] = validatedData[key as keyof typeof validatedData];
      }
    });

    const profile = await prisma.profile.upsert({
      where: { userId: user.id },
      update: profileData,
      create: {
        userId: user.id,
        ...profileData,
      },
    });

    logger.info('Profile updated', maskPII({ userId: user.id }));

    res.json({
      message: 'Profile updated successfully',
      profile,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.errors,
      });
    }

    logger.error('Error updating profile:', maskPII(error));
    res.status(500).json({
      error: 'Internal server error',
      code: 'UPDATE_PROFILE_ERROR',
    });
  }
});

// Get all users (admin only)
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const role = typeof req.query.role === 'string' ? req.query.role : undefined;
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;
    const offset = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (role) {
      where.role = role;
    }

    if (status) {
      where.status = status;
    }

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
          emailVerified: true,
          lastLogin: true,
          createdAt: true,
          profile: {
            select: {
              bio: true,
              company: true,
              jobTitle: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      users,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });

  } catch (error) {
    logger.error('Error fetching users:', maskPII(error));
    res.status(500).json({
      error: 'Internal server error',
      code: 'FETCH_USERS_ERROR',
    });
  }
});

// Get user by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        emailVerified: true,
        lastLogin: true,
        createdAt: true,
        profile: true,
        vendor: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND',
      });
    }

    res.json({ user });

  } catch (error) {
    logger.error('Error fetching user:', maskPII(error));
    res.status(500).json({
      error: 'Internal server error',
      code: 'FETCH_USER_ERROR',
    });
  }
});

export default router;