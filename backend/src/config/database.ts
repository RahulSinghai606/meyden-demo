import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const globalForPrisma = globalThis as unknown as {
  __prisma: PrismaClient | undefined;
};

// Prevent multiple instances of Prisma Client in development
const prisma = globalForPrisma.__prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  global.__prisma = prisma;
}

export const connectDatabase = async (): Promise<void> => {
  try {
    // Check if DATABASE_URL is provided
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      if (process.env.NODE_ENV === 'production') {
        logger.warn('⚠️  DATABASE_URL not provided. Running without database connection.');
        return; // Allow app to start without database in production
      } else {
        throw new Error('DATABASE_URL is required for database connection');
      }
    }

    await prisma.$connect();
    logger.info('✅ Database connection established');
  } catch (error) {
    if (process.env.NODE_ENV === 'production') {
      logger.warn('⚠️  Database connection failed. Running without database:', error);
      return; // Allow app to continue without database in production
    }
    logger.error('❌ Database connection failed:', error);
    throw error;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    logger.info('✅ Database disconnected');
  } catch (error) {
    logger.error('❌ Database disconnection failed:', error);
    throw error;
  }
};

// Graceful shutdown handlers
process.on('SIGINT', async () => {
  logger.info('SIGINT received, closing database connection');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, closing database connection');
  await prisma.$disconnect();
  process.exit(0);
});

export default prisma;