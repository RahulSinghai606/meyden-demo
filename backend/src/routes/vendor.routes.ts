import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../config/database';

import { maskPII } from '../utils/sanitize';
import { logger } from '../utils/logger';
import { getCurrentUTC } from '../utils/datetime';
import { getPaginationParams } from '../utils/pagination';

const router = Router();

// Validation schemas
const createVendorSchema = z.object({
  companyName: z.string().min(1),
  businessName: z.string().min(1),
  description: z.string().min(10),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  businessType: z.string().min(1),
  yearEstablished: z.number().int().min(1800).max(getCurrentUTC().getFullYear()).optional(),
  employeeCount: z.string().optional(),
  website: z.string().url().optional(),
});

// Get all vendors with search and filtering
router.get('/', async (req: Request, res: Response) => {
  try {
    const query = typeof req.query.query === 'string' ? req.query.query : undefined;
    const industry = typeof req.query.industry === 'string' ? req.query.industry : undefined;
    const country = typeof req.query.country === 'string' ? req.query.country : undefined;
    const city = typeof req.query.city === 'string' ? req.query.city : undefined;
    const minRatingStr = typeof req.query.minRating === 'string' ? req.query.minRating : undefined;
    const minRating = minRatingStr ? Number.parseFloat(minRatingStr) : undefined;
    const { page, limit, offset } = getPaginationParams(req);

    // Build where clause
    const where: any = {
      status: 'ACTIVE',
    };

    // Text search
    if (query) {
      where.OR = [
        { companyName: { contains: query, mode: 'insensitive' } },
        { businessName: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ];
    }

    // Location filters
    if (country) {
      where.country = { contains: country, mode: 'insensitive' };
    }

    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }

    if (minRating) {
      where.averageRating = { gte: minRating };
    }

    // Execute query
    const [vendors, totalCount] = await Promise.all([
      prisma.vendor.findMany({
        where,
        include: {
          services: {
            where: { isActive: true },
            take: 5,
          },
          reviews: {
            where: { status: 'APPROVED', isPublic: true },
            take: 3,
          },
        },
        orderBy: [
          { averageRating: 'desc' },
          { totalReviews: 'desc' },
        ],
        skip: offset,
        take: limit,
      }),
      prisma.vendor.count({ where }),
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    logger.info('Vendors fetched', { count: vendors.length, total: totalCount });

    res.json({
      vendors,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    });

  } catch (error) {
    logger.error('Error fetching vendors:', maskPII(error));
    res.status(500).json({
      error: 'Internal server error',
      code: 'FETCH_VENDORS_ERROR',
    });
  }
});

// Get vendor by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const vendor = await prisma.vendor.findUnique({
      where: { id },
      include: {
        services: {
          where: { isActive: true },
          orderBy: { isFeatured: 'desc' },
        },
        reviews: {
          where: { status: 'APPROVED', isPublic: true },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!vendor) {
      return res.status(404).json({
        error: 'Vendor not found',
        code: 'VENDOR_NOT_FOUND',
      });
    }

    if (vendor.status !== 'ACTIVE') {
      return res.status(404).json({
        error: 'Vendor not available',
        code: 'VENDOR_UNAVAILABLE',
      });
    }

    logger.info('Vendor details fetched', { vendorId: id });

    res.json({
      vendor,
    });

  } catch (error) {
    logger.error('Error fetching vendor:', maskPII(error));
    res.status(500).json({
      error: 'Internal server error',
      code: 'FETCH_VENDOR_ERROR',
    });
  }
});

// Create vendor (simplified for demo)
router.post('/', async (req: Request, res: Response) => {
  try {
    const validatedData = createVendorSchema.parse(req.body);

    // Create a demo vendor with PENDING_APPROVAL status
    const vendor = await prisma.vendor.create({
      data: {
        companyName: validatedData.companyName,
        businessName: validatedData.businessName,
        description: validatedData.description,
        email: validatedData.email,
        phone: validatedData.phone,
        address: validatedData.address,
        city: validatedData.city,
        state: validatedData.state,
        country: validatedData.country,
        postalCode: validatedData.postalCode,
        businessType: validatedData.businessType,
        yearEstablished: validatedData.yearEstablished,
        employeeCount: validatedData.employeeCount,
        website: validatedData.website,
        status: 'PENDING_APPROVAL',
      },
    });

    logger.info('Vendor created', { vendorId: vendor.id });

    res.status(201).json({
      message: 'Vendor profile created successfully',
      vendor,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.errors,
      });
    }

    logger.error('Error creating vendor:', maskPII(error));
    res.status(500).json({
      error: 'Internal server error',
      code: 'CREATE_VENDOR_ERROR',
    });
  }
});

// Get vendor reviews
router.get('/:id/reviews', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { page, limit, offset } = getPaginationParams(req, 10);

    const [reviews, totalCount] = await Promise.all([
      prisma.review.findMany({
        where: {
          vendorId: id,
          status: 'APPROVED',
          isPublic: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.review.count({
        where: {
          vendorId: id,
          status: 'APPROVED',
          isPublic: true,
        },
      }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      reviews,
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
    logger.error('Error fetching vendor reviews:', maskPII(error));
    res.status(500).json({
      error: 'Internal server error',
      code: 'FETCH_REVIEWS_ERROR',
    });
  }
});

// Get popular vendors
router.get('/popular/list', async (req: Request, res: Response) => {
  try {
    const limit = Number.parseInt(req.query.limit as string, 10) || 10;

    const vendors = await prisma.vendor.findMany({
      where: {
        status: 'ACTIVE',
        totalReviews: { gt: 0 },
      },
      orderBy: [
        { averageRating: 'desc' },
        { totalReviews: 'desc' },
      ],
      take: limit,
      include: {
        services: {
          where: { isActive: true },
          take: 3,
        },
        reviews: {
          where: { status: 'APPROVED', isPublic: true },
          take: 2,
        },
      },
    });

    res.json({
      vendors,
    });

  } catch (error) {
    logger.error('Error fetching popular vendors:', maskPII(error));
    res.status(500).json({
      error: 'Internal server error',
      code: 'FETCH_POPULAR_VENDORS_ERROR',
    });
  }
});

export default router;