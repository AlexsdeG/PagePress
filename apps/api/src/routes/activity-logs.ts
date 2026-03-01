// PagePress v0.0.18 - 2026-03-01
// Activity logs routes — read-only listing for admins

import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { desc, eq, like, sql, and } from 'drizzle-orm';
import { db } from '../lib/db.js';
import { activityLogs } from '../lib/schema.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const listLogsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  action: z.string().optional(),
  userId: z.string().optional(),
  entityType: z.string().optional(),
});

export async function activityLogsRoutes(fastify: FastifyInstance): Promise<void> {
  /**
   * GET /activity-logs - List activity logs
   */
  fastify.get('/', { preHandler: [requireAuth, requireAdmin] }, async (request, reply) => {
    const { page, limit, action, userId, entityType } = listLogsSchema.parse(request.query);
    const offset = (page - 1) * limit;

    const conditions = [];
    if (action) conditions.push(like(activityLogs.action, `%${action}%`));
    if (userId) conditions.push(eq(activityLogs.userId, userId));
    if (entityType) conditions.push(eq(activityLogs.entityType, entityType));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [logs, countResult] = await Promise.all([
      db
        .select()
        .from(activityLogs)
        .where(whereClause)
        .orderBy(desc(activityLogs.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(activityLogs)
        .where(whereClause),
    ]);

    const total = countResult[0]?.count ?? 0;

    return reply.send({
      success: true,
      data: {
        logs,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  });
}
