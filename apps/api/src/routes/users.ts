// PagePress v0.0.18 - 2026-03-01
// Users management routes — CRUD for users (admin only)

import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { eq, desc, like, or, sql } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { db } from '../lib/db.js';
import { users } from '../lib/schema.js';
import { hashPassword, validatePasswordStrength } from '../lib/password.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { notFound, badRequest, conflict, forbidden } from '../lib/errors.js';
import { logActivity } from '../lib/activity-log.js';
import { deleteAllUserSessions } from '../lib/auth.js';

const createUserSchema = z.object({
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_-]+$/),
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  role: z.enum(['admin', 'editor', 'viewer']).default('editor'),
});

const updateUserSchema = z.object({
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_-]+$/).optional(),
  email: z.string().email().max(255).optional(),
  role: z.enum(['admin', 'editor', 'viewer']).optional(),
  password: z.string().min(8).max(128).optional(),
});

const listUsersSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
});

export async function usersRoutes(fastify: FastifyInstance): Promise<void> {
  /**
   * GET /users - List all users
   */
  fastify.get('/', { preHandler: [requireAuth, requireAdmin] }, async (request, reply) => {
    const { page, limit, search } = listUsersSchema.parse(request.query);
    const offset = (page - 1) * limit;

    const conditions = search
      ? or(
          like(users.username, `%${search}%`),
          like(users.email, `%${search}%`),
        )
      : undefined;

    const [userList, countResult] = await Promise.all([
      db
        .select({
          id: users.id,
          username: users.username,
          email: users.email,
          role: users.role,
          roleId: users.roleId,
          avatarUrl: users.avatarUrl,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
          lockedAt: users.lockedAt,
          failedLoginAttempts: users.failedLoginAttempts,
        })
        .from(users)
        .where(conditions)
        .orderBy(desc(users.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(users)
        .where(conditions),
    ]);

    const total = countResult[0]?.count ?? 0;

    return reply.send({
      success: true,
      data: {
        users: userList,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  });

  /**
   * GET /users/:id - Get user details
   */
  fastify.get('/:id', { preHandler: [requireAuth, requireAdmin] }, async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);

    const result = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        role: users.role,
        roleId: users.roleId,
        avatarUrl: users.avatarUrl,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        lockedAt: users.lockedAt,
        failedLoginAttempts: users.failedLoginAttempts,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (result.length === 0) {
      throw notFound('User not found');
    }

    return reply.send({ success: true, data: { user: result[0] } });
  });

  /**
   * POST /users - Create a new user
   */
  fastify.post('/', { preHandler: [requireAuth, requireAdmin] }, async (request, reply) => {
    const parsed = createUserSchema.parse(request.body);

    const strength = validatePasswordStrength(parsed.password);
    if (!strength.valid) {
      throw badRequest('Password does not meet requirements', { password: strength.errors });
    }

    // Check uniqueness
    const existingEmail = await db.select({ id: users.id }).from(users).where(eq(users.email, parsed.email)).limit(1);
    if (existingEmail.length > 0) throw conflict('Email already registered');

    const existingUsername = await db.select({ id: users.id }).from(users).where(eq(users.username, parsed.username)).limit(1);
    if (existingUsername.length > 0) throw conflict('Username already taken');

    const passwordHash = await hashPassword(parsed.password);
    const userId = randomUUID();
    const now = new Date();

    await db.insert(users).values({
      id: userId,
      username: parsed.username,
      email: parsed.email,
      passwordHash,
      role: parsed.role,
      createdAt: now,
      updatedAt: now,
    });

    await logActivity({
      userId: request.user!.id,
      username: request.user!.username,
      action: 'user.create',
      entityType: 'user',
      entityId: userId,
      entityName: parsed.username,
      ipAddress: request.ip,
    });

    return reply.status(201).send({
      success: true,
      data: {
        user: {
          id: userId,
          username: parsed.username,
          email: parsed.email,
          role: parsed.role,
          createdAt: now,
          updatedAt: now,
        },
      },
    });
  });

  /**
   * PUT /users/:id - Update a user
   */
  fastify.put('/:id', { preHandler: [requireAuth, requireAdmin] }, async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const parsed = updateUserSchema.parse(request.body);

    const existing = await db.select().from(users).where(eq(users.id, id)).limit(1);
    if (existing.length === 0) throw notFound('User not found');

    // Prevent demoting your own admin account
    if (id === request.user!.id && parsed.role && parsed.role !== 'admin') {
      throw forbidden('Cannot change your own role');
    }

    const updates: Record<string, unknown> = { updatedAt: new Date() };

    if (parsed.username && parsed.username !== existing[0]!.username) {
      const dup = await db.select({ id: users.id }).from(users).where(eq(users.username, parsed.username)).limit(1);
      if (dup.length > 0) throw conflict('Username already taken');
      updates.username = parsed.username;
    }

    if (parsed.email && parsed.email !== existing[0]!.email) {
      const dup = await db.select({ id: users.id }).from(users).where(eq(users.email, parsed.email)).limit(1);
      if (dup.length > 0) throw conflict('Email already registered');
      updates.email = parsed.email;
    }

    if (parsed.role) {
      updates.role = parsed.role;
    }

    if (parsed.password) {
      const strength = validatePasswordStrength(parsed.password);
      if (!strength.valid) {
        throw badRequest('Password does not meet requirements', { password: strength.errors });
      }
      updates.passwordHash = await hashPassword(parsed.password);
    }

    await db.update(users).set(updates).where(eq(users.id, id));

    await logActivity({
      userId: request.user!.id,
      username: request.user!.username,
      action: 'user.update',
      entityType: 'user',
      entityId: id,
      entityName: existing[0]!.username,
      details: { fields: Object.keys(parsed).filter((k) => parsed[k as keyof typeof parsed] !== undefined) },
      ipAddress: request.ip,
    });

    const updated = await db
      .select({
        id: users.id, username: users.username, email: users.email,
        role: users.role, roleId: users.roleId, avatarUrl: users.avatarUrl,
        createdAt: users.createdAt, updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return reply.send({ success: true, data: { user: updated[0] } });
  });

  /**
   * DELETE /users/:id - Delete a user
   */
  fastify.delete('/:id', { preHandler: [requireAuth, requireAdmin] }, async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);

    if (id === request.user!.id) {
      throw forbidden('Cannot delete your own account');
    }

    const existing = await db.select({ id: users.id, username: users.username }).from(users).where(eq(users.id, id)).limit(1);
    if (existing.length === 0) throw notFound('User not found');

    // Kill all sessions for the user
    await deleteAllUserSessions(id);

    await db.delete(users).where(eq(users.id, id));

    await logActivity({
      userId: request.user!.id,
      username: request.user!.username,
      action: 'user.delete',
      entityType: 'user',
      entityId: id,
      entityName: existing[0]!.username,
      ipAddress: request.ip,
    });

    return reply.send({ success: true, data: { message: 'User deleted' } });
  });

  /**
   * POST /users/:id/unlock - Unlock a locked user account
   */
  fastify.post('/:id/unlock', { preHandler: [requireAuth, requireAdmin] }, async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);

    const existing = await db.select({ id: users.id, username: users.username }).from(users).where(eq(users.id, id)).limit(1);
    if (existing.length === 0) throw notFound('User not found');

    await db.update(users).set({
      failedLoginAttempts: 0,
      lockedAt: null,
      updatedAt: new Date(),
    }).where(eq(users.id, id));

    await logActivity({
      userId: request.user!.id,
      username: request.user!.username,
      action: 'user.unlock',
      entityType: 'user',
      entityId: id,
      entityName: existing[0]!.username,
      ipAddress: request.ip,
    });

    return reply.send({ success: true, data: { message: 'Account unlocked' } });
  });
}
