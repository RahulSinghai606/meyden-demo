import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../config/database';

import { maskPII } from '../utils/sanitize';
import { logger } from '../utils/logger';
import { getCurrentUTC } from '../utils/datetime';
import { getPaginationParams } from '../utils/pagination';

const router = Router();

// Validation schemas
const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(10),
  type: z.enum(['ARTICLE', 'QUESTION', 'DISCUSSION', 'ANNOUNCEMENT', 'SHOWCASE']).default('ARTICLE'),
  categoryId: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

const createCommentSchema = z.object({
  content: z.string().min(1),
  postId: z.string().optional(),
  parentId: z.string().optional(),
});

// Get all posts
router.get('/posts', async (req: Request, res: Response) => {
  try {
    const { page, limit, offset } = getPaginationParams(req);
    const category = typeof req.query.category === 'string' ? req.query.category : undefined;
    const type = typeof req.query.type === 'string' ? req.query.type : undefined;

    // Build where clause
    const where: any = {
      status: 'PUBLISHED',
    };

    if (type) {
      where.type = type;
    }

    if (category) {
      where.category = {
        name: { contains: category, mode: 'insensitive' }
      };
    }

    const [posts, totalCount] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profile: true,
            }
          },
          category: true,
          comments: {
            where: { status: 'PUBLISHED' },
            take: 3,
            orderBy: { createdAt: 'desc' },
          },
          _count: {
            select: {
              comments: { where: { status: 'PUBLISHED' } },
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.post.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      posts,
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
    logger.error('Error fetching posts:', maskPII(error));
    res.status(500).json({
      error: 'Internal server error',
      code: 'FETCH_POSTS_ERROR',
    });
  }
});

// Get post by ID
router.get('/posts/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profile: true,
          }
        },
        category: true,
        comments: {
          where: { status: 'PUBLISHED' },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profile: true,
              }
            },
            replies: {
              where: { status: 'PUBLISHED' },
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                  }
                },
              },
              orderBy: { createdAt: 'asc' },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        // reactions field doesn't exist in Post model - removing this
      },
    });

    if (!post) {
      return res.status(404).json({
        error: 'Post not found',
        code: 'POST_NOT_FOUND',
      });
    }

    if (post.status !== 'PUBLISHED') {
      return res.status(404).json({
        error: 'Post not available',
        code: 'POST_UNAVAILABLE',
      });
    }

    // Increment view count
    await prisma.post.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    res.json({ post });

  } catch (error) {
    logger.error('Error fetching post:', maskPII(error));
    res.status(500).json({
      error: 'Internal server error',
      code: 'FETCH_POST_ERROR',
    });
  }
});

// Create post
router.post('/posts', async (req: Request, res: Response) => {
  try {
    const validatedData = createPostSchema.parse(req.body);

    // In a real implementation, get user ID from JWT token
    const user = await prisma.user.findFirst();

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND',
      });
    }

    const post = await prisma.post.create({
      data: {
        userId: user.id,
        title: validatedData.title,
        content: validatedData.content,
        type: validatedData.type || 'ARTICLE',
        status: 'PUBLISHED',
        publishedAt: getCurrentUTC(),
        slug: validatedData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        categoryId: validatedData.categoryId,
        tags: validatedData.tags ? validatedData.tags.join(',') : null,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          }
        },
        category: true,
      },
    });

    logger.info('Post created', { postId: post.id, userId: user.id });

    res.status(201).json({
      message: 'Post created successfully',
      post,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.errors,
      });
    }

    logger.error('Error creating post:', maskPII(error));
    res.status(500).json({
      error: 'Internal server error',
      code: 'CREATE_POST_ERROR',
    });
  }
});

// Create comment
router.post('/comments', async (req: Request, res: Response) => {
  try {
    const validatedData = createCommentSchema.parse(req.body);

    // In a real implementation, get user ID from JWT token
    const user = await prisma.user.findFirst();

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND',
      });
    }

    const comment = await prisma.comment.create({
      data: {
        userId: user.id,
        content: validatedData.content,
        status: 'PUBLISHED',
        postId: validatedData.postId,
        parentId: validatedData.parentId,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          }
        },
        post: {
          select: {
            id: true,
            title: true,
          }
        },
      },
    });

    // Update comment count on post
    if (validatedData.postId) {
      await prisma.post.update({
        where: { id: validatedData.postId },
        data: { commentCount: { increment: 1 } },
      });
    }

    logger.info('Comment created', { commentId: comment.id, userId: user.id });

    res.status(201).json({
      message: 'Comment created successfully',
      comment,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.errors,
      });
    }

    logger.error('Error creating comment:', maskPII(error));
    res.status(500).json({
      error: 'Internal server error',
      code: 'CREATE_COMMENT_ERROR',
    });
  }
});

// Get categories
router.get('/categories', async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });

    res.json({ categories });

  } catch (error) {
    logger.error('Error fetching categories:', maskPII(error));
    res.status(500).json({
      error: 'Internal server error',
      code: 'FETCH_CATEGORIES_ERROR',
    });
  }
});

// ============ TOPIC FOLLOWING ============
// NOTE: These routes require TopicFollow model. 
// They will work after Prisma generates the model on deployment.
// For now, we provide placeholder endpoints.

// Follow a category/topic (placeholder - returns success)
router.post('/categories/:id/follow', async (req: Request, res: Response) => {
  // TODO: Enable after TopicFollow model is available
  res.status(201).json({
    message: 'Topic follow feature coming soon',
    categoryId: req.params.id,
  });
});

// Unfollow a category/topic (placeholder)
router.delete('/categories/:id/follow', async (req: Request, res: Response) => {
  res.json({ message: 'Topic unfollow feature coming soon' });
});

// Get user's followed topics (placeholder)
router.get('/following', async (req: Request, res: Response) => {
  res.json({ following: [], message: 'Topic follow feature coming soon' });
});

// Follow a post/thread (placeholder)
router.post('/posts/:id/follow', async (req: Request, res: Response) => {
  res.status(201).json({
    message: 'Thread follow feature coming soon',
    postId: req.params.id,
  });
});

// Unfollow a post/thread (placeholder)
router.delete('/posts/:id/follow', async (req: Request, res: Response) => {
  res.json({ message: 'Thread unfollow feature coming soon' });
});

export default router;