import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../config/database';

import { maskPII } from '../utils/sanitize';
import { logger } from '../utils/logger';
import { getCurrentUTC } from '../utils/datetime';

const router = Router();

// Validation schemas
const createSurveySchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  timeLimit: z.number().int().min(1).optional(),
  maxAttempts: z.number().int().min(1).optional(),
  passingScore: z.number().min(0).max(100).optional(),
  isPublic: z.boolean().default(false),
  category: z.string().optional(),
});

const submitResponseSchema = z.object({
  surveyId: z.string(),
  answers: z.array(z.object({
    questionId: z.string(),
    answer: z.any(),
    timeSpent: z.number().int().optional(),
  })),
  deviceInfo: z.string().optional(),
  feedback: z.string().optional(),
});

// Get all surveys
router.get('/surveys', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const category = req.query.category as string;
    const isPublic = req.query.public === 'true';
    const offset = (page - 1) * limit;

    // Build where clause
    const where: any = {
      status: 'ACTIVE',
    };

    if (category) {
      where.category = category;
    }

    if (isPublic) {
      where.isPublic = true;
    }

    const [surveys, totalCount] = await Promise.all([
      prisma.survey.findMany({
        where,
        include: {
          _count: {
            select: {
              questions: true,
              responses: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.survey.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      surveys,
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
    logger.error('Error fetching surveys:', maskPII(error));
    res.status(500).json({
      error: 'Internal server error',
      code: 'FETCH_SURVEYS_ERROR',
    });
  }
});

// Get survey by ID with questions
router.get('/surveys/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const survey = await prisma.survey.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
        _count: {
          select: {
            responses: true,
          }
        }
      },
    });

    if (!survey) {
      return res.status(404).json({
        error: 'Survey not found',
        code: 'SURVEY_NOT_FOUND',
      });
    }

    if (survey.status !== 'ACTIVE') {
      return res.status(404).json({
        error: 'Survey not available',
        code: 'SURVEY_UNAVAILABLE',
      });
    }

    res.json({ survey });

  } catch (error) {
    logger.error('Error fetching survey:', maskPII(error));
    res.status(500).json({
      error: 'Internal server error',
      code: 'FETCH_SURVEY_ERROR',
    });
  }
});

// Create survey (admin only)
router.post('/surveys', async (req: Request, res: Response) => {
  try {
    const validatedData = createSurveySchema.parse(req.body);

    // In a real implementation, check admin permissions
    const survey = await prisma.survey.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        timeLimit: validatedData.timeLimit,
        maxAttempts: validatedData.maxAttempts,
        passingScore: validatedData.passingScore,
        isPublic: validatedData.isPublic,
        category: validatedData.category,
        status: 'ACTIVE',
        publishedAt: getCurrentUTC(),
      },
    });

    logger.info('Survey created', { surveyId: survey.id });

    res.status(201).json({
      message: 'Survey created successfully',
      survey,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.errors,
      });
    }

    logger.error('Error creating survey:', maskPII(error));
    res.status(500).json({
      error: 'Internal server error',
      code: 'CREATE_SURVEY_ERROR',
    });
  }
});

// Submit survey response
router.post('/responses', async (req: Request, res: Response) => {
  try {
    const validatedData = submitResponseSchema.parse(req.body);

    // Get survey and questions
    const survey = await prisma.survey.findUnique({
      where: { id: validatedData.surveyId },
      include: {
        questions: true,
      },
    });

    if (!survey) {
      return res.status(404).json({
        error: 'Survey not found',
        code: 'SURVEY_NOT_FOUND',
      });
    }

    // In a real implementation, get user ID from JWT token
    const user = await prisma.user.findFirst();

    // Calculate score
    let totalScore = 0;
    let maxScore = 0;

    for (const question of survey.questions) {
      maxScore += question.maxScore;
      
      const answer = validatedData.answers.find(a => a.questionId === question.id);
      if (answer) {
        // Simple scoring logic - in reality, this would be more complex
        totalScore += question.maxScore; // Assuming all answers are correct for demo
      }
    }

    const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

    // Create response
    const response = await prisma.surveyResponse.create({
      data: {
        surveyId: validatedData.surveyId,
        userId: user?.id,
        status: 'completed',
        completedAt: getCurrentUTC(),
        totalScore,
        maxScore,
        percentage,
        deviceInfo: validatedData.deviceInfo,
        feedback: validatedData.feedback,
        questionResponses: {
          create: validatedData.answers.map(answer => ({
            questionId: answer.questionId,
            answer: answer.answer.toString(), // Convert to string as expected by schema
            score: 0, // Would calculate based on answer
            timeSpent: answer.timeSpent,
          })),
        },
      },
    });

    // Update survey stats
    await prisma.survey.update({
      where: { id: validatedData.surveyId },
      data: {
        totalResponses: { increment: 1 },
        averageScore: percentage, // Simplified for demo
      },
    });

    logger.info('Survey response submitted', { responseId: response.id });

    res.status(201).json({
      message: 'Survey completed successfully',
      response: {
        id: response.id,
        totalScore,
        maxScore,
        percentage: Math.round(percentage * 100) / 100,
        grade: getGrade(percentage),
      },
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.errors,
      });
    }

    logger.error('Error submitting response:', maskPII(error));
    res.status(500).json({
      error: 'Internal server error',
      code: 'SUBMIT_RESPONSE_ERROR',
    });
  }
});

// Get user's responses
router.get('/responses/my', async (req: Request, res: Response) => {
  try {
    // In a real implementation, get user ID from JWT token
    const user = await prisma.user.findFirst();
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND',
      });
    }

    const responses = await prisma.surveyResponse.findMany({
      where: { userId: user.id },
      include: {
        survey: {
          select: {
            id: true,
            title: true,
            category: true,
          }
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ responses });

  } catch (error) {
    logger.error('Error fetching user responses:', maskPII(error));
    res.status(500).json({
      error: 'Internal server error',
      code: 'FETCH_RESPONSES_ERROR',
    });
  }
});

// Helper function to determine grade
function getGrade(percentage: number): string {
  if (percentage >= 90) return 'Expert';
  if (percentage >= 80) return 'Advanced';
  if (percentage >= 70) return 'Intermediate';
  if (percentage >= 60) return 'Beginner';
  return 'Novice';
}

export default router;