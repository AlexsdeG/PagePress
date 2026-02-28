// PagePress v0.0.15 - 2026-02-28
// Global Elements CRUD routes — elements synced across all page instances

import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { eq, desc, like, and } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { db } from '../lib/db.js';
import { globalElements } from '../lib/schema.js';
import { requireAuth } from '../middleware/auth.js';
import { notFound } from '../lib/errors.js';

/**
 * Create global element schema
 */
const createGlobalElementSchema = z.object({
  name: z.string().min(1).max(255),
  contentJson: z.record(z.string(), z.unknown()),
});

/**
 * Update global element schema
 */
const updateGlobalElementSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  contentJson: z.record(z.string(), z.unknown()).optional(),
});

/**
 * Register global elements routes
 */
export async function globalElementsRoutes(fastify: FastifyInstance): Promise<void> {
  /**
   * GET /global-elements - List all global elements
   */
  fastify.get('/', { preHandler: [requireAuth] }, async (request, reply) => {
    const querySchema = z.object({
      search: z.string().optional(),
    });
    const { search } = querySchema.parse(request.query);

    const conditions = [];
    if (search) conditions.push(like(globalElements.name, `%${search}%`));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const result = await db
      .select()
      .from(globalElements)
      .where(whereClause)
      .orderBy(desc(globalElements.updatedAt));

    return reply.send({
      success: true,
      data: { globalElements: result },
    });
  });

  /**
   * GET /global-elements/:id - Get single global element
   */
  fastify.get('/:id', { preHandler: [requireAuth] }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const result = await db
      .select()
      .from(globalElements)
      .where(eq(globalElements.id, id))
      .limit(1);

    if (result.length === 0) {
      throw notFound('Global element not found');
    }

    return reply.send({ success: true, data: { globalElement: result[0] } });
  });

  /**
   * POST /global-elements - Create a global element
   */
  fastify.post('/', { preHandler: [requireAuth] }, async (request, reply) => {
    const { name, contentJson } = createGlobalElementSchema.parse(request.body);
    const user = request.user!;

    const elementId = randomUUID();
    const now = new Date();

    await db.insert(globalElements).values({
      id: elementId,
      name,
      contentJson,
      createdBy: user.id,
      createdAt: now,
      updatedAt: now,
    });

    return reply.status(201).send({
      success: true,
      data: {
        globalElement: {
          id: elementId, name, contentJson,
          createdBy: user.id,
          createdAt: now, updatedAt: now,
        },
      },
    });
  });

  /**
   * PUT /global-elements/:id - Update a global element (syncs to all instances)
   */
  fastify.put('/:id', { preHandler: [requireAuth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const { name, contentJson } = updateGlobalElementSchema.parse(request.body);

    const existing = await db
      .select({ id: globalElements.id })
      .from(globalElements)
      .where(eq(globalElements.id, id))
      .limit(1);

    if (existing.length === 0) {
      throw notFound('Global element not found');
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (name !== undefined) updateData.name = name;
    if (contentJson !== undefined) updateData.contentJson = contentJson;

    await db.update(globalElements).set(updateData).where(eq(globalElements.id, id));

    const result = await db.select().from(globalElements).where(eq(globalElements.id, id)).limit(1);

    return reply.send({ success: true, data: { globalElement: result[0] } });
  });

  /**
   * DELETE /global-elements/:id - Delete a global element
   */
  fastify.delete('/:id', { preHandler: [requireAuth] }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const existing = await db
      .select({ id: globalElements.id })
      .from(globalElements)
      .where(eq(globalElements.id, id))
      .limit(1);

    if (existing.length === 0) {
      throw notFound('Global element not found');
    }

    await db.delete(globalElements).where(eq(globalElements.id, id));

    return reply.send({ success: true, data: { message: 'Global element deleted' } });
  });
}
