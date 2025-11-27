import { Router, Request, Response } from 'express';
import prisma from '../config/database';
import { logger } from '../utils/logger';

const router = Router();

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
    logger.error('Error fetching analytics:', error);
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
    logger.error('Error fetching settings:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'FETCH_SETTINGS_ERROR',
    });
  }
});

export default router;