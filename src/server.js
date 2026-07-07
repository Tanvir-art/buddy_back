
import app from './app.js';
import { env } from './config/env.js';
import logger from './utils/logger.js';
import { testDatabaseConnection } from './config/database.js';

const PORT = env.PORT || 5000;

// Start server
const startServer = async () => {
  try {
    // Test database connection first
    await testDatabaseConnection();
    
    // Start Express server
    app.listen(PORT, () => {
      logger.info(`Server running on http://localhost:${PORT}`);
      logger.info(` API Documentation: http://localhost:${PORT}/health`);
      logger.info(` Environment: ${env.NODE_ENV}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

startServer();