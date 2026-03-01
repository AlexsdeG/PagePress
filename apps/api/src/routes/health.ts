// PagePress v0.0.14 - 2026-02-28

import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { checkDatabaseHealth } from '../lib/db.js';

/**
 * Server start time for uptime calculation
 */
const serverStartTime = Date.now();

/**
 * Health check routes plugin
 */
export async function healthRoutes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions
): Promise<void> {
  /**
   * GET /health - Basic health check with uptime and response time
   */
  fastify.get('/health', async (_request, _reply) => {
    const start = performance.now();
    const dbHealthy = await checkDatabaseHealth();
    const responseTimeMs = Math.round((performance.now() - start) * 100) / 100;
    const memoryUsage = process.memoryUsage();

    return {
      success: true,
      data: {
        status: dbHealthy ? 'ok' : 'error',
        version: '0.0.18',
        timestamp: new Date().toISOString(),
        uptime: Math.floor((Date.now() - serverStartTime) / 1000),
        responseTimeMs,
        database: {
          connected: dbHealthy,
          type: 'sqlite',
        },
        memory: {
          heapUsed: memoryUsage.heapUsed,
          heapTotal: memoryUsage.heapTotal,
          rss: memoryUsage.rss,
        },
      },
    };
  });

  /**
   * GET /health/live - Kubernetes liveness probe
   */
  fastify.get('/health/live', async (_request, reply) => {
    return reply.code(200).send({ status: 'alive' });
  });

  /**
   * GET /health/ready - Kubernetes readiness probe
   */
  fastify.get('/health/ready', async (_request, reply) => {
    const dbHealthy = await checkDatabaseHealth();

    if (!dbHealthy) {
      return reply.code(503).send({
        status: 'not ready',
        reason: 'database unavailable',
      });
    }

    return reply.code(200).send({ status: 'ready' });
  });
}
