import { Router, Request, Response } from 'express';
import prisma from '../config/database';
import { logger } from '../utils/logger';
import { requireAuth, requireAdmin } from '../middleware/requireAuth';
import { maskPII } from '../utils/sanitize';

const router = Router();

// Get pending vendors
router.get('/vendors/pending', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const vendors = await prisma.vendor.findMany({
      where: { status: 'PENDING_APPROVAL' },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ vendors });
  } catch (error) {
    logger.error('Error fetching pending vendors:', maskPII(error));
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Approve vendor
router.patch('/vendors/:id/approve', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const vendor = await prisma.vendor.update({
      where: { id: req.params.id },
      data: { status: 'ACTIVE' },
    });

    logger.info('Vendor approved', maskPII({ vendorId: vendor.id }));
    res.json({ vendor });
  } catch (error) {
    logger.error('Error approving vendor:', maskPII(error));
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reject vendor
router.patch('/vendors/:id/reject', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const vendor = await prisma.vendor.update({
      where: { id: req.params.id },
      data: { status: 'INACTIVE' },
    });

    logger.info('Vendor rejected', maskPII({ vendorId: vendor.id }));
    res.json({ vendor });
  } catch (error) {
    logger.error('Error rejecting vendor:', maskPII(error));
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get platform analytics
router.get('/analytics', async (req: Request, res: Response) => {
  try {
    const [userStats, vendorStats, surveyStats, postStats] = await Promise.all([
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
        _avg: {
          percentage: true,
        },
      }),
      prisma.post.count({
        where: { status: 'PUBLISHED' },
      }),
    ]);

    const analytics = {
      users: {
        total: userStats.reduce((sum: number, stat) => sum + stat._count, 0),
        byStatus: userStats,
      },
      vendors: {
        total: vendorStats.reduce((sum: number, stat) => sum + stat._count, 0),
        byStatus: vendorStats,
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
    logger.error('Error fetching analytics:', maskPII(error));
    res.status(500).json({
      error: 'Internal server error',
      code: 'FETCH_ANALYTICS_ERROR',
    });
  }
});

// Get platform settings
router.get('/settings', async (req: Request, res: Response) => {
  try {
    const settings = await prisma.platformSetting.findMany({
      where: { isPublic: true },
    });

    res.json({ settings });

  } catch (error) {
    logger.error('Error fetching settings:', maskPII(error));
    res.status(500).json({
      error: 'Internal server error',
      code: 'FETCH_SETTINGS_ERROR',
    });
  }
});

export default router;