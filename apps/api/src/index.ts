// PagePress v0.0.18 - 2026-03-01

import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import cookie from '@fastify/cookie';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import * as path from 'path';
import { z } from 'zod';
import { env } from './lib/env.js';
import { initializeDatabase, closeDatabase, getUploadsDir } from './lib/db.js';
import { AppError, formatZodError } from './lib/errors.js';
import { startSessionCleanup, stopSessionCleanup } from './lib/session-cleanup.js';
import { healthRoutes } from './routes/health.js';
import { authRoutes } from './routes/auth.js';
import { pagesRoutes } from './routes/pages.js';
import { mediaRoutes } from './routes/media.js';
import { settingsRoutes } from './routes/settings.js';
import { themeRoutes } from './routes/theme.js';
import { templatesRoutes } from './routes/templates.js';
import { sectionTemplatesRoutes } from './routes/section-templates.js';
import { globalElementsRoutes } from './routes/global-elements.js';
import { dynamicDataRoutes } from './routes/dynamic-data.js';
import { publicRendererRoutes } from './routes/public.js';
import { usersRoutes } from './routes/users.js';
import { rolesRoutes } from './routes/roles.js';
import { invitesRoutes } from './routes/invites.js';
import { activityLogsRoutes } from './routes/activity-logs.js';

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
    serializers: {
      // Redact sensitive fields from logs
      req(request) {
        return {
          method: request.method,
          url: request.url,
          hostname: request.hostname,
          remoteAddress: request.ip,
        };
      },
    },
  },
  trustProxy: env.TRUST_PROXY,
});

/**
 * Register global error handlers
 */
function registerErrorHandlers(): void {
  // Global error handler — consistent JSON error responses
  server.setErrorHandler((error: Error & { statusCode?: number; validation?: unknown }, request, reply) => {
    // Zod validation errors
    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        success: false,
        error: formatZodError(error),
        details: error.flatten().fieldErrors,
      });
    }

    // App-level errors
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        success: false,
        error: error.message,
        ...(error.details ? { details: error.details } : {}),
      });
    }

    // Rate limit errors
    if (error.statusCode === 429) {
      return reply.status(429).send({
        success: false,
        error: 'Too many requests. Please try again later.',
      });
    }

    // Fastify validation errors
    if (error.validation) {
      return reply.status(400).send({
        success: false,
        error: error.message,
      });
    }

    // Log unexpected errors (don't expose internals in production)
    request.log.error(error, 'Unhandled error');
    const message = env.NODE_ENV === 'development'
      ? error.message
      : 'Internal server error';

    return reply.status(error.statusCode ?? 500).send({
      success: false,
      error: message,
    });
  });

  // Not found handler — JSON for API routes, HTML for public routes
  server.setNotFoundHandler(async (request, reply) => {
    if (request.url.startsWith('/pp-admin/api/')) {
      return reply.status(404).send({
        success: false,
        error: 'Route not found',
      });
    }
    // For non-API routes, let the public renderer handle it
    return reply.status(404).send({
      success: false,
      error: 'Not found',
    });
  });
}

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
    max: 100,
    timeWindow: '1 minute',
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
      files: 1,
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
  // Admin API routes — all behind /pp-admin/api prefix
  await server.register(async function adminApiRoutes(adminApi) {
    await adminApi.register(healthRoutes);
    await adminApi.register(authRoutes, { prefix: '/auth' });
    await adminApi.register(pagesRoutes, { prefix: '/pages' });
    await adminApi.register(mediaRoutes, { prefix: '/media' });
    await adminApi.register(settingsRoutes, { prefix: '/settings' });
    await adminApi.register(themeRoutes, { prefix: '/theme' });
    await adminApi.register(templatesRoutes, { prefix: '/templates' });
    await adminApi.register(sectionTemplatesRoutes, { prefix: '/section-templates' });
    await adminApi.register(globalElementsRoutes, { prefix: '/global-elements' });
    await adminApi.register(dynamicDataRoutes, { prefix: '/dynamic-data' });
    await adminApi.register(usersRoutes, { prefix: '/users' });
    await adminApi.register(rolesRoutes, { prefix: '/roles' });
    await adminApi.register(invitesRoutes, { prefix: '/invites' });
    await adminApi.register(activityLogsRoutes, { prefix: '/activity-logs' });
  }, { prefix: '/pp-admin/api' });

  // Public renderer — catches / and /:slug for frontend pages
  await server.register(publicRendererRoutes);
}

/**
 * Graceful shutdown handler
 */
async function gracefulShutdown(signal: string): Promise<void> {
  server.log.info(`Received ${signal}. Shutting down gracefully...`);

  try {
    stopSessionCleanup();
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
    // Register global error handlers first
    registerErrorHandlers();

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

    // Start session cleanup cron after server is listening
    startSessionCleanup(server.log);

    server.log.info(`🚀 PagePress API v0.0.18 running on port ${env.PORT}`);
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