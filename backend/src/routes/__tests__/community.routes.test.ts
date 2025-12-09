import request from 'supertest';
import express from 'express';
import communityRoutes from '../community.routes';

// Mock dependencies
jest.mock('../../config/database', () => ({
    __esModule: true,
    default: {
        post: {
            findMany: jest.fn(),
            count: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
        },
        comment: {
            create: jest.fn(),
        },
        category: {
            findMany: jest.fn(),
        },
        user: {
            findFirst: jest.fn(),
        },
    },
}));

import prisma from '../../config/database';

const app = express();
app.use(express.json());
app.use('/api/community', communityRoutes);

describe('Community Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/community/posts', () => {
        it('should return posts', async () => {
            (prisma.post.findMany as jest.Mock).mockResolvedValue([{ id: '1', title: 'Post 1' }]);
            (prisma.post.count as jest.Mock).mockResolvedValue(1);

            const res = await request(app).get('/api/community/posts');

            expect(res.status).toBe(200);
            expect(res.body.posts).toHaveLength(1);
        });
    });

    describe('GET /api/community/posts/:id', () => {
        it('should return post details', async () => {
            const mockPost = { id: '1', title: 'Post 1', status: 'PUBLISHED' };
            (prisma.post.findUnique as jest.Mock).mockResolvedValue(mockPost);
            (prisma.post.update as jest.Mock).mockResolvedValue(mockPost);

            const res = await request(app).get('/api/community/posts/1');

            expect(res.status).toBe(200);
            expect(res.body.post.id).toBe('1');
        });
    });

    describe('POST /api/community/posts', () => {
        it('should create a post', async () => {
            (prisma.user.findFirst as jest.Mock).mockResolvedValue({ id: 'u1' });
            (prisma.post.create as jest.Mock).mockResolvedValue({ id: '1', title: 'New Post' });

            const res = await request(app).post('/api/community/posts').send({
                title: 'New Post',
                content: 'Content must be longer than 10 chars',
                type: 'ARTICLE',
            });

            expect(res.status).toBe(201);
        });
    });

    describe('POST /api/community/comments', () => {
        it('should create a comment', async () => {
            (prisma.user.findFirst as jest.Mock).mockResolvedValue({ id: 'u1' });
            (prisma.comment.create as jest.Mock).mockResolvedValue({ id: 'c1' });
            (prisma.post.update as jest.Mock).mockResolvedValue({});

            const res = await request(app).post('/api/community/comments').send({
                content: 'Nice post',
                postId: '1',
            });

            expect(res.status).toBe(201);
        });
    });
});
