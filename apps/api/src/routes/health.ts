// PagePress v0.0.2 - 2025-11-30

import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { checkDatabaseHealth } from '../lib/db.js';

/**
 * Health check response interface
 */
interface HealthResponse {
  status: 'ok' | 'error';
  timestamp: string;
  version: string;
  database: 'connected' | 'disconnected';
  uptime: number;
}

/**
 * Health check routes plugin
 */
export async function healthRoutes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions
): Promise<void> {
  /**
   * GET /health - Basic health check
   */
  fastify.get<{ Reply: HealthResponse }>('/health', async (_request, _reply) => {
    const dbHealthy = await checkDatabaseHealth();
    
    return {
      status: dbHealthy ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      version: '0.0.2',
      database: dbHealthy ? 'connected' : 'disconnected',
      uptime: process.uptime(),
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
        reason: 'database unavailable' 
      });
    }
    
    return reply.code(200).send({ status: 'ready' });
  });
}
