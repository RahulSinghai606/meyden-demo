import request from 'supertest';
import express from 'express';
import vendorRoutes from '../vendor.routes';

// Mock dependencies
jest.mock('../../config/database', () => ({
    __esModule: true,
    default: {
        vendor: {
            findMany: jest.fn(),
            count: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
        },
        review: {
            findMany: jest.fn(),
            count: jest.fn(),
        },
    },
}));

import prisma from '../../config/database';

const app = express();
app.use(express.json());
app.use('/api/vendors', vendorRoutes);

describe('Vendor Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/vendors', () => {
        it('should return vendors with pagination', async () => {
            (prisma.vendor.findMany as jest.Mock).mockResolvedValue([{ id: '1', companyName: 'Vendor 1' }]);
            (prisma.vendor.count as jest.Mock).mockResolvedValue(1);

            const res = await request(app).get('/api/vendors');

            expect(res.status).toBe(200);
            expect(res.body.vendors).toHaveLength(1);
            expect(res.body.pagination.totalCount).toBe(1);
        });
    });

    describe('GET /api/vendors/:id', () => {
        it('should return vendor details', async () => {
            const mockVendor = { id: '1', status: 'ACTIVE', companyName: 'Vendor 1' };
            (prisma.vendor.findUnique as jest.Mock).mockResolvedValue(mockVendor);

            const res = await request(app).get('/api/vendors/1');

            expect(res.status).toBe(200);
            expect(res.body.vendor.id).toBe('1');
        });

        it('should return 404 if not found', async () => {
            (prisma.vendor.findUnique as jest.Mock).mockResolvedValue(null);

            const res = await request(app).get('/api/vendors/1');

            expect(res.status).toBe(404);
        });
    });

    describe('POST /api/vendors', () => {
        it('should create a vendor', async () => {
            const mockVendor = {
                companyName: 'New Vendor',
                businessName: 'Business',
                description: 'A description longer than 10 chars',
                email: 'vendor@example.com',
                businessType: 'Tech',
            };
            (prisma.vendor.create as jest.Mock).mockResolvedValue({ ...mockVendor, id: '1', status: 'PENDING_APPROVAL' });

            const res = await request(app).post('/api/vendors').send(mockVendor);

            expect(res.status).toBe(201);
            expect(res.body.vendor.status).toBe('PENDING_APPROVAL');
        });
    });

    describe('GET /api/vendors/:id/reviews', () => {
        it('should return reviews', async () => {
            (prisma.review.findMany as jest.Mock).mockResolvedValue([{ id: '1', content: 'Great' }]);
            (prisma.review.count as jest.Mock).mockResolvedValue(1);

            const res = await request(app).get('/api/vendors/1/reviews');

            expect(res.status).toBe(200);
            expect(res.body.reviews).toHaveLength(1);
        });
    });

    describe('GET /api/vendors/popular/list', () => {
        it('should return popular vendors', async () => {
            (prisma.vendor.findMany as jest.Mock).mockResolvedValue([{ id: '1', companyName: 'Popular' }]);

            const res = await request(app).get('/api/vendors/popular/list');

            expect(res.status).toBe(200);
            expect(res.body.vendors).toHaveLength(1);
        });
    });
});
