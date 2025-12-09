import request from 'supertest';
import express from 'express';
import adminRoutes from '../admin.routes';

// Mock dependencies
jest.mock('../../middleware/requireAuth', () => ({
    requireAuth: (req: any, res: any, next: any) => {
        req.user = { userId: '1', role: 'ADMIN' };
        next();
    },
    requireAdmin: (req: any, res: any, next: any) => {
        next();
    },
}));

jest.mock('../../config/database', () => ({
    __esModule: true,
    default: {
        vendor: {
            findMany: jest.fn(),
            update: jest.fn(),
            groupBy: jest.fn(),
        },
        user: {
            groupBy: jest.fn(),
        },
        surveyResponse: {
            aggregate: jest.fn(),
        },
        post: {
            count: jest.fn(),
        },
        platformSetting: {
            findMany: jest.fn(),
        },
    },
}));

import prisma from '../../config/database';

const app = express();
app.use(express.json());
app.use('/api/admin', adminRoutes);

describe('Admin Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/admin/vendors/pending', () => {
        it('should return pending vendors', async () => {
            const mockVendors = [{ id: '1', status: 'PENDING_APPROVAL' }];
            (prisma.vendor.findMany as jest.Mock).mockResolvedValue(mockVendors);

            const res = await request(app).get('/api/admin/vendors/pending');

            expect(res.status).toBe(200);
            expect(res.body.vendors).toHaveLength(1);
        });

        it('should handle errors', async () => {
            (prisma.vendor.findMany as jest.Mock).mockRejectedValue(new Error('DB Error'));
            const res = await request(app).get('/api/admin/vendors/pending');
            expect(res.status).toBe(500);
        });
    });

    describe('PATCH /api/admin/vendors/:id/approve', () => {
        it('should approve vendor', async () => {
            const mockVendor = { id: '1', status: 'ACTIVE' };
            (prisma.vendor.update as jest.Mock).mockResolvedValue(mockVendor);

            const res = await request(app).patch('/api/admin/vendors/1/approve');

            expect(res.status).toBe(200);
            expect(res.body.vendor.status).toBe('ACTIVE');
        });
    });

    describe('PATCH /api/admin/vendors/:id/reject', () => {
        it('should reject vendor', async () => {
            const mockVendor = { id: '1', status: 'INACTIVE' };
            (prisma.vendor.update as jest.Mock).mockResolvedValue(mockVendor);

            const res = await request(app).patch('/api/admin/vendors/1/reject');

            expect(res.status).toBe(200);
            expect(res.body.vendor.status).toBe('INACTIVE');
        });
    });

    describe('GET /api/admin/analytics', () => {
        it('should return analytics', async () => {
            (prisma.user.groupBy as jest.Mock).mockResolvedValue([{ status: 'ACTIVE', _count: 10 }]);
            (prisma.vendor.groupBy as jest.Mock).mockResolvedValue([{ status: 'ACTIVE', _count: 5 }]);
            (prisma.surveyResponse.aggregate as jest.Mock).mockResolvedValue({ _count: 20, _avg: { percentage: 80 } });
            (prisma.post.count as jest.Mock).mockResolvedValue(15);

            const res = await request(app).get('/api/admin/analytics');

            expect(res.status).toBe(200);
            expect(res.body.analytics.users.total).toBe(10);
        });
    });

    describe('GET /api/admin/settings', () => {
        it('should return settings', async () => {
            const mockSettings = [{ key: 'site_name', value: 'Meyden' }];
            (prisma.platformSetting.findMany as jest.Mock).mockResolvedValue(mockSettings);

            const res = await request(app).get('/api/admin/settings');

            expect(res.status).toBe(200);
            expect(res.body.settings).toHaveLength(1);
        });
    });
});
