import request from 'supertest';
import express from 'express';
import userRoutes from '../user.routes';
import { requireAuth } from '../../middleware/requireAuth';

// Mock dependencies
jest.mock('../../middleware/requireAuth', () => ({
    requireAuth: (req: any, res: any, next: any) => {
        req.user = { userId: '1', role: 'USER' };
        next();
    },
}));

jest.mock('../../config/database', () => ({
    __esModule: true,
    default: {
        user: {
            findFirst: jest.fn(),
            update: jest.fn(),
            findMany: jest.fn(),
            count: jest.fn(),
            findUnique: jest.fn(),
        },
        profile: {
            upsert: jest.fn(),
        },
    },
}));

import prisma from '../../config/database';

const app = express();
app.use(express.json());
app.use('/api/users', userRoutes);

describe('User Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/users/profile', () => {
        it('should return user profile', async () => {
            const mockUser = {
                id: '1',
                email: 'test@example.com',
                firstName: 'John',
                lastName: 'Doe',
                role: 'USER',
                profile: {},
                vendor: null,
            };

            (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);

            const res = await request(app).get('/api/users/profile');

            expect(res.status).toBe(200);
            expect(res.body.user.email).toBe('test@example.com');
        });

        it('should return 404 if user not found', async () => {
            (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);

            const res = await request(app).get('/api/users/profile');

            expect(res.status).toBe(404);
        });
    });

    describe('PUT /api/users/profile', () => {
        it('should update user profile', async () => {
            const mockUser = { id: '1', firstName: 'John', lastName: 'Doe' };
            (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);
            (prisma.user.update as jest.Mock).mockResolvedValue({ ...mockUser, firstName: 'Jane' });
            (prisma.profile.upsert as jest.Mock).mockResolvedValue({});

            const res = await request(app)
                .put('/api/users/profile')
                .send({ firstName: 'Jane', bio: 'New bio' });

            expect(res.status).toBe(200);
            expect(prisma.user.update).toHaveBeenCalled();
            expect(prisma.profile.upsert).toHaveBeenCalled();
        });
    });
});
