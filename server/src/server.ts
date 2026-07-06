/**
 * StadiumPulse AI - Server Entry Point
 *
 * Initializes HTTP server, Socket.io, and all background services.
 * Handles graceful shutdown for database connections and timers.
 */
import http from 'http';
import { Server as SocketServer } from 'socket.io';
import app from './app';
import { env } from './config/env';
import prisma from './config/database';
import { initCrowdSocket, cleanupCrowdSocket } from './features/crowd/crowd.socket';
import { createLogger } from './utils/logger';

const logger = createLogger('Server');

async function main() {
  // Create HTTP server
  const server = http.createServer(app);

  // Initialize Socket.io with CORS
  const io = new SocketServer(server, {
    cors: {
      origin: env.CORS_ORIGINS.split(',').map((o) => o.trim()),
      methods: ['GET', 'POST'],
      credentials: true,
    },
    // PRODUCTION SCALE NOTE:
    // Add Redis adapter for multi-instance deployments:
    // import { createAdapter } from '@socket.io/redis-adapter';
    // io.adapter(createAdapter(pubClient, subClient));
  });

  // Connect to database
  await prisma.$connect();
  logger.info('Database connected');

  // Initialize WebSocket handlers
  initCrowdSocket(io);

  // Start listening
  server.listen(env.PORT, () => {
    logger.info(`🏟️  StadiumPulse AI server running on port ${env.PORT}`);
    logger.info(`   Environment: ${env.NODE_ENV}`);
    logger.info(`   API:   http://localhost:${env.PORT}/api/health`);
    logger.info(`   WS:    ws://localhost:${env.PORT}/crowd`);
  });

  // ── Graceful Shutdown ───────────────────────────────────────
  const shutdown = async (signal: string) => {
    logger.info(`${signal} received. Shutting down gracefully...`);
    cleanupCrowdSocket();
    await prisma.$disconnect();
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

main().catch((error) => {
  logger.error('Failed to start server', error);
  process.exit(1);
});
