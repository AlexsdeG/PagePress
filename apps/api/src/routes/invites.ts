// PagePress v0.0.18 - 2026-03-01
// Invite management routes — generate, list, validate, and use invite links

import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { eq, desc } from 'drizzle-orm';
import { randomUUID, randomBytes } from 'crypto';
import { db } from '../lib/db.js';
import { invites, users } from '../lib/schema.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { notFound, badRequest } from '../lib/errors.js';
import { logActivity } from '../lib/activity-log.js';

const createInviteSchema = z.object({
  email: z.string().email().optional(),
  role: z.enum(['admin', 'editor', 'viewer']).default('editor'),
  expiresInHours: z.number().int().min(1).max(720).default(72),
});

export async function invitesRoutes(fastify: FastifyInstance): Promise<void> {
  /**
   * GET /invites - List all invites
   */
  fastify.get('/', { preHandler: [requireAuth, requireAdmin] }, async (_request, reply) => {
    const inviteList = await db
      .select({
        id: invites.id,
        token: invites.token,
        email: invites.email,
        role: invites.role,
        usedAt: invites.usedAt,
        usedBy: invites.usedBy,
        createdBy: invites.createdBy,
        expiresAt: invites.expiresAt,
        createdAt: invites.createdAt,
      })
      .from(invites)
      .orderBy(desc(invites.createdAt));

    // Join creator usernames
    const creatorIds = [...new Set(inviteList.map((i) => i.createdBy))];
    const creators = creatorIds.length > 0
      ? await db.select({ id: users.id, username: users.username }).from(users)
      : [];
    const creatorMap = new Map(creators.map((c) => [c.id, c.username]));

    const enriched = inviteList.map((inv) => ({
      ...inv,
      createdByUsername: creatorMap.get(inv.createdBy) ?? 'unknown',
    }));

    return reply.send({ success: true, data: { invites: enriched } });
  });

  /**
   * POST /invites - Create a new invite link
   */
  fastify.post('/', { preHandler: [requireAuth, requireAdmin] }, async (request, reply) => {
    const parsed = createInviteSchema.parse(request.body);

    const token = randomBytes(32).toString('hex');
    const inviteId = randomUUID();
    const expiresAt = new Date(Date.now() + parsed.expiresInHours * 60 * 60 * 1000);

    await db.insert(invites).values({
      id: inviteId,
      token,
      email: parsed.email ?? null,
      role: parsed.role,
      createdBy: request.user!.id,
      expiresAt,
      createdAt: new Date(),
    });

    await logActivity({
      userId: request.user!.id,
      username: request.user!.username,
      action: 'invite.create',
      entityType: 'invite',
      entityId: inviteId,
      entityName: parsed.email ?? 'open invite',
      details: { role: parsed.role, expiresInHours: parsed.expiresInHours },
      ipAddress: request.ip,
    });

    return reply.status(201).send({
      success: true,
      data: {
        invite: {
          id: inviteId,
          token,
          email: parsed.email ?? null,
          role: parsed.role,
          expiresAt,
          createdAt: new Date(),
        },
      },
    });
  });

  /**
   * GET /invites/validate/:token - Validate an invite token (public, no auth)
   */
  fastify.get('/validate/:token', async (request, reply) => {
    const { token } = z.object({ token: z.string() }).parse(request.params);

    const result = await db
      .select()
      .from(invites)
      .where(eq(invites.token, token))
      .limit(1);

    if (result.length === 0) {
      throw notFound('Invalid invite link');
    }

    const invite = result[0]!;

    if (invite.usedAt) {
      throw badRequest('This invite has already been used');
    }

    if (invite.expiresAt <= new Date()) {
      throw badRequest('This invite has expired');
    }

    return reply.send({
      success: true,
      data: {
        invite: {
          email: invite.email,
          role: invite.role,
          expiresAt: invite.expiresAt,
        },
      },
    });
  });

  /**
   * DELETE /invites/:id - Delete an invite
   */
  fastify.delete('/:id', { preHandler: [requireAuth, requireAdmin] }, async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);

    const existing = await db.select().from(invites).where(eq(invites.id, id)).limit(1);
    if (existing.length === 0) throw notFound('Invite not found');

    await db.delete(invites).where(eq(invites.id, id));

    await logActivity({
      userId: request.user!.id,
      username: request.user!.username,
      action: 'invite.delete',
      entityType: 'invite',
      entityId: id,
      ipAddress: request.ip,
    });

    return reply.send({ success: true, data: { message: 'Invite deleted' } });
  });
}
