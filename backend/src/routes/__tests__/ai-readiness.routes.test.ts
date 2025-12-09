import request from 'supertest';
import express from 'express';
import aiReadinessRoutes from '../ai-readiness.routes';

// Mock dependencies
jest.mock('../../config/database', () => ({
    __esModule: true,
    default: {
        survey: {
            findMany: jest.fn(),
            count: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
        },
        surveyResponse: {
            create: jest.fn(),
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
app.use('/api/ai-readiness', aiReadinessRoutes);

describe('AI Readiness Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/ai-readiness/surveys', () => {
        it('should return surveys', async () => {
            (prisma.survey.findMany as jest.Mock).mockResolvedValue([{ id: '1', title: 'Survey 1' }]);
            (prisma.survey.count as jest.Mock).mockResolvedValue(1);

            const res = await request(app).get('/api/ai-readiness/surveys');

            expect(res.status).toBe(200);
            expect(res.body.surveys).toHaveLength(1);
        });
    });

    describe('GET /api/ai-readiness/surveys/:id', () => {
        it('should return survey details', async () => {
            const mockSurvey = { id: '1', title: 'Survey 1', status: 'ACTIVE' };
            (prisma.survey.findUnique as jest.Mock).mockResolvedValue(mockSurvey);

            const res = await request(app).get('/api/ai-readiness/surveys/1');

            expect(res.status).toBe(200);
            expect(res.body.survey.id).toBe('1');
        });
    });

    describe('POST /api/ai-readiness/surveys', () => {
        it('should create a survey', async () => {
            const mockSurvey = { title: 'New Survey' };
            (prisma.survey.create as jest.Mock).mockResolvedValue({ ...mockSurvey, id: '1' });

            const res = await request(app).post('/api/ai-readiness/surveys').send(mockSurvey);

            expect(res.status).toBe(201);
        });
    });

    describe('POST /api/ai-readiness/responses', () => {
        it('should submit response', async () => {
            const mockSurvey = { id: '1', questions: [{ id: 'q1', maxScore: 10 }] };
            (prisma.survey.findUnique as jest.Mock).mockResolvedValue(mockSurvey);
            (prisma.user.findFirst as jest.Mock).mockResolvedValue({ id: 'u1' });
            (prisma.surveyResponse.create as jest.Mock).mockResolvedValue({ id: 'r1' });
            (prisma.survey.update as jest.Mock).mockResolvedValue({});

            const res = await request(app).post('/api/ai-readiness/responses').send({
                surveyId: '1',
                answers: [{ questionId: 'q1', answer: 'A' }],
            });

            expect(res.status).toBe(201);
        });
    });
});
