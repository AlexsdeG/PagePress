// PagePress v0.0.18 - 2026-03-01
// Roles management routes — CRUD for roles (admin only)

import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { eq, desc } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { db } from '../lib/db.js';
import { roles, users } from '../lib/schema.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { notFound, badRequest, forbidden } from '../lib/errors.js';
import { logActivity } from '../lib/activity-log.js';

const createRoleSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().max(255).optional(),
  permissions: z.record(z.string(), z.boolean()),
});

const updateRoleSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  description: z.string().max(255).nullable().optional(),
  permissions: z.record(z.string(), z.boolean()).optional(),
});

export async function rolesRoutes(fastify: FastifyInstance): Promise<void> {
  /**
   * GET /roles - List all roles
   */
  fastify.get('/', { preHandler: [requireAuth] }, async (_request, reply) => {
    const roleList = await db
      .select()
      .from(roles)
      .orderBy(desc(roles.isSystem), roles.name);

    return reply.send({ success: true, data: { roles: roleList } });
  });

  /**
   * GET /roles/:id - Get a role by ID
   */
  fastify.get('/:id', { preHandler: [requireAuth] }, async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);

    const result = await db.select().from(roles).where(eq(roles.id, id)).limit(1);
    if (result.length === 0) throw notFound('Role not found');

    return reply.send({ success: true, data: { role: result[0] } });
  });

  /**
   * POST /roles - Create a new role
   */
  fastify.post('/', { preHandler: [requireAuth, requireAdmin] }, async (request, reply) => {
    const parsed = createRoleSchema.parse(request.body);

    // Check name uniqueness
    const existing = await db.select({ id: roles.id }).from(roles).where(eq(roles.name, parsed.name)).limit(1);
    if (existing.length > 0) throw badRequest('A role with this name already exists');

    const roleId = randomUUID();
    const now = new Date();

    await db.insert(roles).values({
      id: roleId,
      name: parsed.name,
      description: parsed.description ?? null,
      permissions: parsed.permissions as Record<string, boolean>,
      isSystem: false,
      createdAt: now,
      updatedAt: now,
    });

    await logActivity({
      userId: request.user!.id,
      username: request.user!.username,
      action: 'role.create',
      entityType: 'role',
      entityId: roleId,
      entityName: parsed.name,
      ipAddress: request.ip,
    });

    const created = await db.select().from(roles).where(eq(roles.id, roleId)).limit(1);

    return reply.status(201).send({ success: true, data: { role: created[0] } });
  });

  /**
   * PUT /roles/:id - Update a role
   */
  fastify.put('/:id', { preHandler: [requireAuth, requireAdmin] }, async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const parsed = updateRoleSchema.parse(request.body);

    const existing = await db.select().from(roles).where(eq(roles.id, id)).limit(1);
    if (existing.length === 0) throw notFound('Role not found');

    // Don't allow renaming system roles
    if (existing[0]!.isSystem && parsed.name && parsed.name !== existing[0]!.name) {
      throw forbidden('Cannot rename system roles');
    }

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (parsed.name !== undefined) updates.name = parsed.name;
    if (parsed.description !== undefined) updates.description = parsed.description;
    if (parsed.permissions !== undefined) updates.permissions = parsed.permissions;

    await db.update(roles).set(updates).where(eq(roles.id, id));

    await logActivity({
      userId: request.user!.id,
      username: request.user!.username,
      action: 'role.update',
      entityType: 'role',
      entityId: id,
      entityName: existing[0]!.name,
      ipAddress: request.ip,
    });

    const updated = await db.select().from(roles).where(eq(roles.id, id)).limit(1);

    return reply.send({ success: true, data: { role: updated[0] } });
  });

  /**
   * DELETE /roles/:id - Delete a role
   */
  fastify.delete('/:id', { preHandler: [requireAuth, requireAdmin] }, async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);

    const existing = await db.select().from(roles).where(eq(roles.id, id)).limit(1);
    if (existing.length === 0) throw notFound('Role not found');

    if (existing[0]!.isSystem) {
      throw forbidden('Cannot delete system roles');
    }

    // Check if any users are assigned to this role
    const usersWithRole = await db.select({ id: users.id }).from(users).where(eq(users.roleId, id)).limit(1);
    if (usersWithRole.length > 0) {
      throw badRequest('Cannot delete a role that is assigned to users. Reassign users first.');
    }

    await db.delete(roles).where(eq(roles.id, id));

    await logActivity({
      userId: request.user!.id,
      username: request.user!.username,
      action: 'role.delete',
      entityType: 'role',
      entityId: id,
      entityName: existing[0]!.name,
      ipAddress: request.ip,
    });

    return reply.send({ success: true, data: { message: 'Role deleted' } });
  });
}
