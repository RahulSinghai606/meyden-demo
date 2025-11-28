import { createServer } from 'http';
import app from './app';
import { logger } from './utils/logger';
import { config } from './config/environment';
import { connectDatabase } from './config/database';

const PORT = config.port;

async function startServer() {
  try {
    // Connect to database
    await connectDatabase();
    logger.info('✅ Database connected successfully');

    // Create HTTP server
    const server = createServer(app);
    
    // Start server
    server.listen(PORT, () => {
      logger.info(`
🚀 Meyden Backend Server Started!

📍 Server running on: http://localhost:${PORT}
🔗 API prefix: ${config.apiPrefix}
🌍 Environment: ${config.nodeEnv}
⏰ Started at: ${new Date().toISOString()}
      `);
    });

    // Graceful shutdown handling
    process.on('SIGTERM', () => {
      logger.info('🔄 SIGTERM received, shutting down gracefully');
      server.close(() => {
        logger.info('✅ Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      logger.info('🔄 SIGINT received, shutting down gracefully');
      server.close(() => {
        logger.info('✅ Server closed');
        process.exit(0);
      });
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err: Error) => {
      logger.error('💥 Unhandled Promise Rejection:', err);
      server.close(() => {
        process.exit(1);
      });
    });

  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();
