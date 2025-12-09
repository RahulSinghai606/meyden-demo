import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../config/database';
import { logger } from '../utils/logger';
import { requireAuth, requireAdmin } from '../middleware/requireAuth';
import { maskPII } from '../utils/sanitize';
import { handleRouteError } from '../utils/response';

const router = Router();

// All admin routes require authentication and admin role
router.use(requireAuth, requireAdmin);

// ============ VENDOR MANAGEMENT ============

// Get pending vendors
router.get('/vendors/pending', async (req: Request, res: Response) => {
  try {
    const vendors = await prisma.vendor.findMany({
      where: { status: 'PENDING_APPROVAL' },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ vendors });
  } catch (error) {
    handleRouteError(res, error, 'FETCH_PENDING_VENDORS_ERROR', 'Error fetching pending vendors');
  }
});

// Approve vendor
router.patch('/vendors/:id/approve', async (req: Request, res: Response) => {
  try {
    const vendor = await prisma.vendor.update({
      where: { id: req.params.id },
      data: { status: 'ACTIVE' },
    });

    logger.info('Vendor approved', maskPII({ vendorId: vendor.id }));
    res.json({ vendor, message: 'Vendor approved successfully' });
  } catch (error) {
    handleRouteError(res, error, 'APPROVE_VENDOR_ERROR', 'Error approving vendor');
  }
});

// Reject vendor
router.patch('/vendors/:id/reject', async (req: Request, res: Response) => {
  try {
    const vendor = await prisma.vendor.update({
      where: { id: req.params.id },
      data: { status: 'INACTIVE' },
    });

    logger.info('Vendor rejected', maskPII({ vendorId: vendor.id }));
    res.json({ vendor, message: 'Vendor rejected' });
  } catch (error) {
    handleRouteError(res, error, 'REJECT_VENDOR_ERROR', 'Error rejecting vendor');
  }
});

// ============ USER MANAGEMENT ============

const updateUserSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  role: z.enum(['USER', 'VENDOR', 'ADMIN']).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION']).optional(),
});

// Get all users with filters
router.get('/users', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    const role = req.query.role as string | undefined;
    const status = req.query.status as string | undefined;

    const where: any = {};
    if (role) where.role = role;
    if (status) where.status = status;

    const [users, total] = await Promise.all([
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
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    handleRouteError(res, error, 'FETCH_USERS_ERROR', 'Error fetching users');
  }
});

// Update user
router.patch('/users/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = updateUserSchema.parse(req.body);

    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
      },
    });

    logger.info('User updated by admin', maskPII({ userId: id, changes: Object.keys(data) }));
    res.json({ user, message: 'User updated successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    handleRouteError(res, error, 'UPDATE_USER_ERROR', 'Error updating user');
  }
});

// Suspend user
router.patch('/users/:id/suspend', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.update({
      where: { id },
      data: { status: 'SUSPENDED' },
    });

    // Invalidate all sessions
    await prisma.session.deleteMany({ where: { userId: id } });

    logger.info('User suspended', maskPII({ userId: id }));
    res.json({ message: 'User suspended successfully', user: { id: user.id, status: user.status } });
  } catch (error) {
    handleRouteError(res, error, 'SUSPEND_USER_ERROR', 'Error suspending user');
  }
});

// Activate user
router.patch('/users/:id/activate', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.update({
      where: { id },
      data: { status: 'ACTIVE' },
    });

    logger.info('User activated', maskPII({ userId: id }));
    res.json({ message: 'User activated successfully', user: { id: user.id, status: user.status } });
  } catch (error) {
    handleRouteError(res, error, 'ACTIVATE_USER_ERROR', 'Error activating user');
  }
});

// ============ CONTENT MODERATION ============

// Get pending posts
router.get('/posts/pending', async (req: Request, res: Response) => {
  try {
    const posts = await prisma.post.findMany({
      where: { status: 'DRAFT' },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ posts });
  } catch (error) {
    handleRouteError(res, error, 'FETCH_PENDING_POSTS_ERROR', 'Error fetching pending posts');
  }
});

// Approve post
router.patch('/posts/:id/approve', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const post = await prisma.post.update({
      where: { id },
      data: { status: 'PUBLISHED', publishedAt: new Date() },
    });

    logger.info('Post approved', { postId: id });
    res.json({ post, message: 'Post approved and published' });
  } catch (error) {
    handleRouteError(res, error, 'APPROVE_POST_ERROR', 'Error approving post');
  }
});

// Reject post
router.patch('/posts/:id/reject', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const post = await prisma.post.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    });

    logger.info('Post rejected', { postId: id });
    res.json({ post, message: 'Post rejected' });
  } catch (error) {
    handleRouteError(res, error, 'REJECT_POST_ERROR', 'Error rejecting post');
  }
});

// ============ ANALYTICS (SECURED) ============

// Get platform analytics
router.get('/analytics', async (req: Request, res: Response) => {
  try {
    const [userStats, vendorStats, surveyStats, postStats, recentUsers, recentVendors] = await Promise.all([
      prisma.user.groupBy({
        by: ['status'],
        _count: true,
      }),
      prisma.vendor.groupBy({
        by: ['status'],
        _count: true,
      }),
      prisma.surveyResponse.aggregate({
        _count: true,
        _avg: { percentage: true },
      }),
      prisma.post.count({ where: { status: 'PUBLISHED' } }),
      prisma.user.count({
        where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
      }),
      prisma.vendor.count({
        where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
      }),
    ]);

    const analytics = {
      users: {
        total: userStats.reduce((sum: number, stat) => sum + stat._count, 0),
        byStatus: userStats,
        newThisWeek: recentUsers,
      },
      vendors: {
        total: vendorStats.reduce((sum: number, stat) => sum + stat._count, 0),
        byStatus: vendorStats,
        newThisWeek: recentVendors,
      },
      surveys: {
        totalResponses: surveyStats._count,
        averageScore: surveyStats._avg.percentage || 0,
      },
      community: {
        totalPosts: postStats,
      },
    };

    res.json({ analytics });
  } catch (error) {
    handleRouteError(res, error, 'FETCH_ANALYTICS_ERROR', 'Error fetching analytics');
  }
});

// ============ SETTINGS (SECURED) ============

// Get platform settings
router.get('/settings', async (req: Request, res: Response) => {
  try {
    const settings = await prisma.platformSetting.findMany();
    res.json({ settings });
  } catch (error) {
    handleRouteError(res, error, 'FETCH_SETTINGS_ERROR', 'Error fetching settings');
  }
});

// Update platform setting
router.patch('/settings/:key', async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    const setting = await prisma.platformSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value, category: 'general' },
    });

    logger.info('Setting updated', { key });
    res.json({ setting, message: 'Setting updated successfully' });
  } catch (error) {
    handleRouteError(res, error, 'UPDATE_SETTING_ERROR', 'Error updating setting');
  }
});

export default router;