// PagePress v0.0.4 - 2025-11-30

import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import cookie from '@fastify/cookie';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import * as path from 'path';
import { env } from './lib/env.js';
import { initializeDatabase, closeDatabase, getUploadsDir } from './lib/db.js';
import { healthRoutes } from './routes/health.js';
import { authRoutes } from './routes/auth.js';
import { pagesRoutes } from './routes/pages.js';
import { mediaRoutes } from './routes/media.js';
import { settingsRoutes } from './routes/settings.js';

/**
 * Create and configure Fastify server
 */
const server = Fastify({
  logger: {
    level: env.NODE_ENV === 'development' ? 'debug' : 'info',
    transport: env.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
  },
});

/**
 * Register plugins
 */
async function registerPlugins(): Promise<void> {
  // Helmet - Security headers
  await server.register(helmet, {
    contentSecurityPolicy: env.NODE_ENV === 'production',
  });

  // Rate limiting - Prevent abuse
  await server.register(rateLimit, {
    max: 100, // Max 100 requests per window
    timeWindow: '1 minute',
    // More strict limits for auth routes
    keyGenerator: (request) => {
      return request.ip;
    },
  });

  // Cookie support for sessions
  await server.register(cookie, {
    secret: env.COOKIE_SECRET,
    parseOptions: {},
  });

  // Multipart support for file uploads
  await server.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB max file size
      files: 1, // Single file upload
    },
  });

  // Static file serving for uploads
  await server.register(fastifyStatic, {
    root: path.resolve(getUploadsDir()),
    prefix: '/uploads/',
    decorateReply: false,
  });

  // CORS - Allow frontend to connect
  await server.register(cors, {
    origin: env.NODE_ENV === 'development' ? true : ['http://localhost:5173'],
    credentials: true,
  });
}

/**
 * Register routes
 */
async function registerRoutes(): Promise<void> {
  // Health check routes
  await server.register(healthRoutes);

  // Authentication routes
  await server.register(authRoutes, { prefix: '/auth' });

  // Pages routes
  await server.register(pagesRoutes, { prefix: '/pages' });

  // Media routes
  await server.register(mediaRoutes, { prefix: '/media' });

  // Settings routes
  await server.register(settingsRoutes, { prefix: '/settings' });

  // Root route
  server.get('/', async (_request, _reply) => {
    return {
      status: 'ok',
      message: 'PagePress API Running',
      version: '0.0.4',
      documentation: '/docs',
    };
  });
}

/**
 * Graceful shutdown handler
 */
async function gracefulShutdown(signal: string): Promise<void> {
  server.log.info(`Received ${signal}. Shutting down gracefully...`);
  
  try {
    await server.close();
    closeDatabase();
    server.log.info('Server closed successfully');
    process.exit(0);
  } catch (err) {
    server.log.error(err, 'Error during shutdown');
    process.exit(1);
  }
}

/**
 * Start the server
 */
async function start(): Promise<void> {
  try {
    // Initialize database
    server.log.info('Initializing database...');
    await initializeDatabase();
    server.log.info(`Database connected: ${env.DATABASE_URL}`);

    // Register plugins and routes
    await registerPlugins();
    await registerRoutes();

    // Start listening
    await server.listen({
      port: env.PORT,
      host: '0.0.0.0',
    });

    server.log.info(`🚀 PagePress API v0.0.4 running on port ${env.PORT}`);
    server.log.info(`📊 Environment: ${env.NODE_ENV}`);

  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start the server
start();