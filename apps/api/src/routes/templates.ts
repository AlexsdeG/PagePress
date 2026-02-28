// PagePress v0.0.15 - 2026-02-28
// Templates CRUD routes — manages page-level templates (header, footer, 404, custom)

import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { eq, desc, asc, like, and } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { db } from '../lib/db.js';
import { pages, users } from '../lib/schema.js';
import { requireAuth } from '../middleware/auth.js';
import { generateUniqueSlug, isValidSlug, isSlugUnique } from '../lib/slug.js';
import { notFound, badRequest, conflict } from '../lib/errors.js';

/**
 * Template type enum values
 */
const templateTypes = ['header', 'footer', 'notfound', 'custom'] as const;

/**
 * Create template request schema
 */
const createTemplateSchema = z.object({
  title: z.string().min(1).max(255),
  slug: z.string().min(1).max(255).optional(),
  contentJson: z.record(z.string(), z.unknown()).optional(),
  published: z.boolean().optional().default(false),
  templateType: z.enum(templateTypes).optional().default('custom'),
});

/**
 * Update template request schema
 */
const updateTemplateSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  slug: z.string().min(1).max(255).optional(),
  contentJson: z.record(z.string(), z.unknown()).optional(),
  published: z.boolean().optional(),
  templateType: z.enum(templateTypes).optional(),
});

/**
 * Query parameters schema
 */
const querySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  templateType: z.enum(templateTypes).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['title', 'createdAt', 'updatedAt']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

/**
 * Register templates routes
 */
export async function templatesRoutes(fastify: FastifyInstance): Promise<void> {
  /**
   * GET /templates - List all templates with pagination
   */
  fastify.get('/', { preHandler: [requireAuth] }, async (request, reply) => {
    const { page, limit, templateType, search, sortBy, sortOrder } = querySchema.parse(request.query);
    const offset = (page - 1) * limit;

    // Build conditions - always filter for type='template'
    const conditions = [eq(pages.type, 'template')];
    if (templateType) conditions.push(eq(pages.templateType, templateType));
    if (search) conditions.push(like(pages.title, `%${search}%`));

    const whereClause = and(...conditions);

    // Get total count
    const countResult = await db
      .select({ id: pages.id })
      .from(pages)
      .where(whereClause);
    const total = countResult.length;

    // Get templates with author info
    const sortColumn = sortBy === 'title' ? pages.title : sortBy === 'updatedAt' ? pages.updatedAt : pages.createdAt;
    const sortFn = sortOrder === 'asc' ? asc : desc;

    const result = await db
      .select({
        id: pages.id,
        title: pages.title,
        slug: pages.slug,
        contentJson: pages.contentJson,
        published: pages.published,
        type: pages.type,
        templateType: pages.templateType,
        authorId: pages.authorId,
        authorUsername: users.username,
        createdAt: pages.createdAt,
        updatedAt: pages.updatedAt,
      })
      .from(pages)
      .leftJoin(users, eq(pages.authorId, users.id))
      .where(whereClause)
      .orderBy(sortFn(sortColumn))
      .limit(limit)
      .offset(offset);

    return reply.send({
      success: true,
      data: {
        templates: result,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
    });
  });

  /**
   * GET /templates/:id - Get single template by ID
   */
  fastify.get('/:id', { preHandler: [requireAuth] }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const result = await db
      .select({
        id: pages.id,
        title: pages.title,
        slug: pages.slug,
        contentJson: pages.contentJson,
        published: pages.published,
        type: pages.type,
        templateType: pages.templateType,
        authorId: pages.authorId,
        authorUsername: users.username,
        createdAt: pages.createdAt,
        updatedAt: pages.updatedAt,
      })
      .from(pages)
      .leftJoin(users, eq(pages.authorId, users.id))
      .where(and(eq(pages.id, id), eq(pages.type, 'template')))
      .limit(1);

    const template = result[0];
    if (!template) {
      throw notFound('Template not found');
    }

    return reply.send({ success: true, data: { template } });
  });

  /**
   * POST /templates - Create a new template
   */
  fastify.post('/', { preHandler: [requireAuth] }, async (request, reply) => {
    const { title, slug: requestedSlug, contentJson, published, templateType } = createTemplateSchema.parse(request.body);
    const user = request.user!;

    // For system templates (header, footer, notfound), check uniqueness
    if (templateType && templateType !== 'custom') {
      const existing = await db
        .select({ id: pages.id })
        .from(pages)
        .where(and(eq(pages.type, 'template'), eq(pages.templateType, templateType)))
        .limit(1);

      if (existing.length > 0) {
        throw conflict(`A ${templateType} template already exists. Edit the existing one or delete it first.`);
      }
    }

    // Generate or validate slug
    let slug: string;
    if (requestedSlug) {
      if (!isValidSlug(requestedSlug)) {
        throw badRequest('Invalid slug format. Use lowercase letters, numbers, and hyphens only.');
      }
      const isUnique = await isSlugUnique(requestedSlug);
      if (!isUnique) {
        throw conflict('Slug already in use');
      }
      slug = requestedSlug;
    } else {
      slug = await generateUniqueSlug(`template-${title}`);
    }

    const templateId = randomUUID();
    const now = new Date();

    await db.insert(pages).values({
      id: templateId,
      title,
      slug,
      contentJson: contentJson ?? {},
      published,
      type: 'template',
      templateType,
      authorId: user.id,
      createdAt: now,
      updatedAt: now,
    });

    return reply.status(201).send({
      success: true,
      data: {
        template: {
          id: templateId, title, slug,
          contentJson: contentJson ?? {},
          published, type: 'template' as const,
          templateType,
          authorId: user.id,
          createdAt: now, updatedAt: now,
        },
      },
    });
  });

  /**
   * PUT /templates/:id - Update a template
   */
  fastify.put('/:id', { preHandler: [requireAuth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const { title, slug: requestedSlug, contentJson, published, templateType } = updateTemplateSchema.parse(request.body);

    // Check if template exists
    const existing = await db
      .select({ id: pages.id, templateType: pages.templateType })
      .from(pages)
      .where(and(eq(pages.id, id), eq(pages.type, 'template')))
      .limit(1);

    if (existing.length === 0) {
      throw notFound('Template not found');
    }

    // If changing template type to a system type, check uniqueness
    if (templateType && templateType !== 'custom') {
      const conflict_existing = await db
        .select({ id: pages.id })
        .from(pages)
        .where(and(
          eq(pages.type, 'template'),
          eq(pages.templateType, templateType),
        ))
        .limit(1);

      if (conflict_existing.length > 0 && conflict_existing[0] && conflict_existing[0].id !== id) {
        throw conflict(`A ${templateType} template already exists.`);
      }
    }

    // Validate slug if provided
    if (requestedSlug) {
      if (!isValidSlug(requestedSlug)) {
        throw badRequest('Invalid slug format. Use lowercase letters, numbers, and hyphens only.');
      }
      const isUnique = await isSlugUnique(requestedSlug, id);
      if (!isUnique) {
        throw conflict('Slug already in use');
      }
    }

    // Build update object
    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (title !== undefined) updateData.title = title;
    if (requestedSlug !== undefined) updateData.slug = requestedSlug;
    if (contentJson !== undefined) updateData.contentJson = contentJson;
    if (published !== undefined) updateData.published = published;
    if (templateType !== undefined) updateData.templateType = templateType;

    await db.update(pages).set(updateData).where(eq(pages.id, id));

    // Fetch updated template
    const result = await db
      .select({
        id: pages.id,
        title: pages.title,
        slug: pages.slug,
        contentJson: pages.contentJson,
        published: pages.published,
        type: pages.type,
        templateType: pages.templateType,
        authorId: pages.authorId,
        createdAt: pages.createdAt,
        updatedAt: pages.updatedAt,
      })
      .from(pages)
      .where(eq(pages.id, id))
      .limit(1);

    return reply.send({ success: true, data: { template: result[0] } });
  });

  /**
   * DELETE /templates/:id - Delete a template
   */
  fastify.delete('/:id', { preHandler: [requireAuth] }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const existing = await db
      .select({ id: pages.id })
      .from(pages)
      .where(and(eq(pages.id, id), eq(pages.type, 'template')))
      .limit(1);

    if (existing.length === 0) {
      throw notFound('Template not found');
    }

    // Clear references from pages that use this template
    await db.update(pages)
      .set({ headerTemplateId: null })
      .where(eq(pages.headerTemplateId, id));
    await db.update(pages)
      .set({ footerTemplateId: null })
      .where(eq(pages.footerTemplateId, id));

    await db.delete(pages).where(eq(pages.id, id));

    return reply.send({ success: true, data: { message: 'Template deleted' } });
  });

  /**
   * POST /templates/:id/duplicate - Duplicate a template
   */
  fastify.post('/:id/duplicate', { preHandler: [requireAuth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const user = request.user!;

    const result = await db.select().from(pages).where(and(eq(pages.id, id), eq(pages.type, 'template'))).limit(1);
    const original = result[0];
    if (!original) {
      throw notFound('Template not found');
    }

    const newTitle = `${original.title} (Copy)`;
    const newSlug = await generateUniqueSlug(newTitle);
    const newId = randomUUID();
    const now = new Date();

    await db.insert(pages).values({
      id: newId,
      title: newTitle,
      slug: newSlug,
      contentJson: original.contentJson,
      published: false,
      type: 'template',
      templateType: 'custom', // duplicates are always custom
      authorId: user.id,
      createdAt: now,
      updatedAt: now,
    });

    return reply.status(201).send({
      success: true,
      data: {
        template: {
          id: newId, title: newTitle, slug: newSlug,
          contentJson: original.contentJson,
          published: false, type: 'template' as const,
          templateType: 'custom' as const,
          authorId: user.id,
          createdAt: now, updatedAt: now,
        },
      },
    });
  });

  /**
   * PUT /templates/assign/:pageId - Assign header/footer template to a page
   */
  fastify.put('/assign/:pageId', { preHandler: [requireAuth] }, async (request, reply) => {
    const { pageId } = request.params as { pageId: string };
    const assignSchema = z.object({
      headerTemplateId: z.string().nullable().optional(),
      footerTemplateId: z.string().nullable().optional(),
    });

    const { headerTemplateId, footerTemplateId } = assignSchema.parse(request.body);

    // Check if target page exists
    const existing = await db
      .select({ id: pages.id })
      .from(pages)
      .where(eq(pages.id, pageId))
      .limit(1);

    if (existing.length === 0) {
      throw notFound('Page not found');
    }

    // Validate template IDs if provided
    if (headerTemplateId) {
      const header = await db
        .select({ id: pages.id })
        .from(pages)
        .where(and(eq(pages.id, headerTemplateId), eq(pages.type, 'template')))
        .limit(1);
      if (header.length === 0) {
        throw notFound('Header template not found');
      }
    }

    if (footerTemplateId) {
      const footer = await db
        .select({ id: pages.id })
        .from(pages)
        .where(and(eq(pages.id, footerTemplateId), eq(pages.type, 'template')))
        .limit(1);
      if (footer.length === 0) {
        throw notFound('Footer template not found');
      }
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (headerTemplateId !== undefined) updateData.headerTemplateId = headerTemplateId;
    if (footerTemplateId !== undefined) updateData.footerTemplateId = footerTemplateId;

    await db.update(pages).set(updateData).where(eq(pages.id, pageId));

    return reply.send({ success: true, data: { message: 'Template assignment updated' } });
  });

  /**
   * GET /templates/system - Get all system templates (header, footer, 404)
   */
  fastify.get('/system', { preHandler: [requireAuth] }, async (_request, reply) => {
    const result = await db
      .select({
        id: pages.id,
        title: pages.title,
        slug: pages.slug,
        templateType: pages.templateType,
        published: pages.published,
        createdAt: pages.createdAt,
        updatedAt: pages.updatedAt,
      })
      .from(pages)
      .where(and(
        eq(pages.type, 'template'),
      ));

    // Organize by template type
    const systemTemplates: Record<string, typeof result[0] | null> = {
      header: null,
      footer: null,
      notfound: null,
    };

    for (const tmpl of result) {
      if (tmpl.templateType && tmpl.templateType in systemTemplates) {
        systemTemplates[tmpl.templateType] = tmpl;
      }
    }

    return reply.send({ success: true, data: { systemTemplates } });
  });
}
