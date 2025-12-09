import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../config/database';

import { maskPII } from '../utils/sanitize';
import { logger } from '../utils/logger';
import { getCurrentUTC } from '../utils/datetime';
import { getPaginationParams } from '../utils/pagination';

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
    const { page, limit, offset } = getPaginationParams(req);
    const category = typeof req.query.category === 'string' ? req.query.category : undefined;
    const isPublic = req.query.public === 'true';

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

// Helper function to get recommendations based on score
function getRecommendations(percentage: number, category: string = 'general'): string[] {
  const recommendations: string[] = [];

  if (percentage < 50) {
    recommendations.push('Consider starting with foundational AI/ML training for your team');
    recommendations.push('Establish a data governance framework before pursuing AI initiatives');
    recommendations.push('Partner with experienced AI consultants for initial projects');
  } else if (percentage < 70) {
    recommendations.push('Focus on building internal AI capabilities and expertise');
    recommendations.push('Develop a clear AI strategy aligned with business objectives');
    recommendations.push('Invest in data quality and infrastructure improvements');
  } else if (percentage < 85) {
    recommendations.push('Scale successful AI pilots across the organization');
    recommendations.push('Establish AI governance and ethical guidelines');
    recommendations.push('Build centers of excellence to share AI best practices');
  } else {
    recommendations.push('Lead AI innovation in your industry');
    recommendations.push('Consider contributing to AI research and development');
    recommendations.push('Mentor other organizations on AI adoption');
  }

  return recommendations;
}

// Generate PDF Report for AI Readiness Assessment
router.get('/responses/:id/pdf', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const response = await prisma.surveyResponse.findUnique({
      where: { id },
      include: {
        survey: {
          include: {
            questions: true,
          },
        },
        user: {
          select: { firstName: true, lastName: true, email: true },
        },
        questionResponses: {
          include: {
            question: true,
          },
        },
      },
    });

    if (!response) {
      return res.status(404).json({
        error: 'Response not found',
        code: 'RESPONSE_NOT_FOUND',
      });
    }

    const grade = getGrade(response.percentage || 0);
    const recommendations = getRecommendations(response.percentage || 0, response.survey.category || 'general');
    const completedDate = response.completedAt ? new Date(response.completedAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }) : 'N/A';

    // Generate HTML for PDF
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; margin: 40px; color: #1f2937; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px; margin-bottom: 30px; }
    .header h1 { margin: 0; font-size: 28px; }
    .header p { margin: 10px 0 0 0; opacity: 0.9; }
    .section { margin-bottom: 30px; }
    .section-title { font-size: 18px; font-weight: bold; color: #667eea; border-bottom: 2px solid #667eea; padding-bottom: 10px; margin-bottom: 20px; }
    .score-card { background: #f9fafb; padding: 20px; border-radius: 10px; text-align: center; }
    .score { font-size: 48px; font-weight: bold; color: ${response.percentage! >= 70 ? '#10b981' : response.percentage! >= 50 ? '#f59e0b' : '#ef4444'}; }
    .grade { font-size: 24px; color: #6b7280; margin-top: 10px; }
    .info-table { width: 100%; border-collapse: collapse; }
    .info-table td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
    .info-table td:first-child { color: #6b7280; width: 30%; }
    .recommendation { background: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin-bottom: 10px; border-radius: 0 8px 8px 0; }
    .dimension { display: flex; justify-content: space-between; padding: 15px; background: #f9fafb; margin-bottom: 10px; border-radius: 8px; }
    .dimension-name { font-weight: 500; }
    .dimension-score { font-weight: bold; color: #667eea; }
    .footer { text-align: center; color: #9ca3af; font-size: 12px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
    .arabic { direction: rtl; text-align: right; color: #6b7280; font-size: 14px; margin-top: 5px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>AI Readiness Assessment Report</h1>
    <p>تقرير تقييم الجاهزية للذكاء الاصطناعي</p>
    <p style="margin-top: 15px; font-size: 14px;">Meyden Platform</p>
  </div>

  <div class="section">
    <div class="score-card">
      <div class="score">${Math.round(response.percentage || 0)}%</div>
      <div class="grade">${grade}</div>
      <p class="arabic">مستوى الجاهزية: ${grade === 'Expert' ? 'خبير' : grade === 'Advanced' ? 'متقدم' : grade === 'Intermediate' ? 'متوسط' : grade === 'Beginner' ? 'مبتدئ' : 'مبتدئ'}</p>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Assessment Details / تفاصيل التقييم</div>
    <table class="info-table">
      <tr><td>Assessment</td><td>${response.survey.title}</td></tr>
      <tr><td>Completed On</td><td>${completedDate}</td></tr>
      <tr><td>Participant</td><td>${response.user ? `${response.user.firstName} ${response.user.lastName}` : 'Anonymous'}</td></tr>
      <tr><td>Score</td><td>${response.totalScore} / ${response.maxScore} points</td></tr>
      <tr><td>Category</td><td>${response.survey.category || 'General AI Readiness'}</td></tr>
    </table>
  </div>

  <div class="section">
    <div class="section-title">Recommendations / التوصيات</div>
    ${recommendations.map((rec, i) => `
      <div class="recommendation">
        <strong>${i + 1}.</strong> ${rec}
      </div>
    `).join('')}
  </div>

  <div class="footer">
    <p>Generated by Meyden Platform on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
    <p style="direction: rtl;">تم إنشاؤه بواسطة منصة ميدن</p>
    <p style="margin-top: 10px;">This report is confidential and intended for internal use only.</p>
  </div>
</body>
</html>
    `;

    // Set headers for HTML download (can be converted to PDF by browser print)
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `attachment; filename="ai-readiness-report-${id}.html"`);
    res.send(htmlContent);

    logger.info('PDF report generated', { responseId: id });

  } catch (error) {
    logger.error('Error generating PDF:', maskPII(error));
    res.status(500).json({
      error: 'Internal server error',
      code: 'GENERATE_PDF_ERROR',
    });
  }
});

// Get response details by ID
router.get('/responses/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const response = await prisma.surveyResponse.findUnique({
      where: { id },
      include: {
        survey: {
          select: { id: true, title: true, category: true, description: true },
        },
        questionResponses: {
          include: {
            question: true,
          },
        },
      },
    });

    if (!response) {
      return res.status(404).json({
        error: 'Response not found',
        code: 'RESPONSE_NOT_FOUND',
      });
    }

    res.json({
      response: {
        ...response,
        grade: getGrade(response.percentage || 0),
        recommendations: getRecommendations(response.percentage || 0),
      },
    });

  } catch (error) {
    logger.error('Error fetching response:', maskPII(error));
    res.status(500).json({
      error: 'Internal server error',
      code: 'FETCH_RESPONSE_ERROR',
    });
  }
});

export default router;