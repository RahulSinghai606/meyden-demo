import { createServer } from 'node:http';
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
    server.listen(PORT, '0.0.0.0', () => {
      logger.info(`
🚀 Meyden Backend Server Started!

📍 Server running on: http://0.0.0.0:${PORT}
🔗 API prefix: ${config.apiPrefix}
🌍 Environment: ${config.nodeEnv}
⏰ Started at: ${new Date().toISOString()}
      `);
    });

    // Heartbeat to keep process alive and logging
    setInterval(() => {
      logger.info('💓 Server heartbeat - Process is alive');
    }, 10000);

    // Note: Removed custom signal handlers to let the orchestrator manage the process lifecycle naturally.
    // This avoids potential conflicts where the process exits too early or swallows signals.

  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();
