// PagePress v0.0.15 - 2026-02-28
// Section Templates CRUD routes — reusable saved element/group templates

import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { eq, desc, asc, like, and } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { db } from '../lib/db.js';
import { sectionTemplates } from '../lib/schema.js';
import { requireAuth } from '../middleware/auth.js';
import { notFound, badRequest } from '../lib/errors.js';

/**
 * Section template categories
 */
const categories = [
  'hero', 'features', 'cta', 'contact', 'testimonials',
  'pricing', 'faq', 'footer', 'header', 'content', 'gallery', 'other',
] as const;

/**
 * Create section template request schema
 */
const createSectionTemplateSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  category: z.enum(categories).optional().default('other'),
  contentJson: z.record(z.string(), z.unknown()),
  thumbnail: z.string().max(2000).optional(),
});

/**
 * Update section template request schema
 */
const updateSectionTemplateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).nullable().optional(),
  category: z.enum(categories).optional(),
  contentJson: z.record(z.string(), z.unknown()).optional(),
  thumbnail: z.string().max(2000).nullable().optional(),
});

/**
 * Query parameters schema
 */
const querySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(50),
  category: z.enum(categories).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'createdAt', 'updatedAt', 'category']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

/**
 * Import schema - array of section templates
 */
const importSchema = z.object({
  templates: z.array(z.object({
    name: z.string().min(1).max(255),
    description: z.string().max(1000).optional(),
    category: z.enum(categories).optional().default('other'),
    contentJson: z.record(z.string(), z.unknown()),
    thumbnail: z.string().max(2000).optional(),
  })),
});

/**
 * Register section templates routes
 */
export async function sectionTemplatesRoutes(fastify: FastifyInstance): Promise<void> {
  /**
   * GET /section-templates - List all section templates
   */
  fastify.get('/', { preHandler: [requireAuth] }, async (request, reply) => {
    const { page, limit, category, search, sortBy, sortOrder } = querySchema.parse(request.query);
    const offset = (page - 1) * limit;

    const conditions = [];
    if (category) conditions.push(eq(sectionTemplates.category, category));
    if (search) conditions.push(like(sectionTemplates.name, `%${search}%`));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const countResult = await db
      .select({ id: sectionTemplates.id })
      .from(sectionTemplates)
      .where(whereClause);
    const total = countResult.length;

    // Get templates
    const sortColumn = sortBy === 'name'
      ? sectionTemplates.name
      : sortBy === 'category'
        ? sectionTemplates.category
        : sortBy === 'updatedAt'
          ? sectionTemplates.updatedAt
          : sectionTemplates.createdAt;
    const sortFn = sortOrder === 'asc' ? asc : desc;

    const result = await db
      .select()
      .from(sectionTemplates)
      .where(whereClause)
      .orderBy(sortFn(sortColumn))
      .limit(limit)
      .offset(offset);

    return reply.send({
      success: true,
      data: {
        sectionTemplates: result,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
    });
  });

  /**
   * GET /section-templates/categories - Get list of categories with counts
   */
  fastify.get('/categories', { preHandler: [requireAuth] }, async (_request, reply) => {
    const result = await db
      .select({
        category: sectionTemplates.category,
        id: sectionTemplates.id,
      })
      .from(sectionTemplates);

    const categoryCounts: Record<string, number> = {};
    for (const row of result) {
      categoryCounts[row.category] = (categoryCounts[row.category] || 0) + 1;
    }

    return reply.send({
      success: true,
      data: { categories: categoryCounts },
    });
  });

  /**
   * GET /section-templates/:id - Get single section template
   */
  fastify.get('/:id', { preHandler: [requireAuth] }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const result = await db
      .select()
      .from(sectionTemplates)
      .where(eq(sectionTemplates.id, id))
      .limit(1);

    if (result.length === 0) {
      throw notFound('Section template not found');
    }

    return reply.send({ success: true, data: { sectionTemplate: result[0] } });
  });

  /**
   * POST /section-templates - Create a section template
   */
  fastify.post('/', { preHandler: [requireAuth] }, async (request, reply) => {
    const { name, description, category, contentJson, thumbnail } = createSectionTemplateSchema.parse(request.body);
    const user = request.user!;

    const templateId = randomUUID();
    const now = new Date();

    await db.insert(sectionTemplates).values({
      id: templateId,
      name,
      description: description ?? null,
      category,
      contentJson,
      thumbnail: thumbnail ?? null,
      createdBy: user.id,
      createdAt: now,
      updatedAt: now,
    });

    return reply.status(201).send({
      success: true,
      data: {
        sectionTemplate: {
          id: templateId, name,
          description: description ?? null,
          category, contentJson,
          thumbnail: thumbnail ?? null,
          createdBy: user.id,
          createdAt: now, updatedAt: now,
        },
      },
    });
  });

  /**
   * PUT /section-templates/:id - Update a section template
   */
  fastify.put('/:id', { preHandler: [requireAuth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const { name, description, category, contentJson, thumbnail } = updateSectionTemplateSchema.parse(request.body);

    const existing = await db
      .select({ id: sectionTemplates.id })
      .from(sectionTemplates)
      .where(eq(sectionTemplates.id, id))
      .limit(1);

    if (existing.length === 0) {
      throw notFound('Section template not found');
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (contentJson !== undefined) updateData.contentJson = contentJson;
    if (thumbnail !== undefined) updateData.thumbnail = thumbnail;

    await db.update(sectionTemplates).set(updateData).where(eq(sectionTemplates.id, id));

    const result = await db.select().from(sectionTemplates).where(eq(sectionTemplates.id, id)).limit(1);

    return reply.send({ success: true, data: { sectionTemplate: result[0] } });
  });

  /**
   * DELETE /section-templates/:id - Delete a section template
   */
  fastify.delete('/:id', { preHandler: [requireAuth] }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const existing = await db
      .select({ id: sectionTemplates.id })
      .from(sectionTemplates)
      .where(eq(sectionTemplates.id, id))
      .limit(1);

    if (existing.length === 0) {
      throw notFound('Section template not found');
    }

    await db.delete(sectionTemplates).where(eq(sectionTemplates.id, id));

    return reply.send({ success: true, data: { message: 'Section template deleted' } });
  });

  /**
   * POST /section-templates/import - Import section templates from JSON
   */
  fastify.post('/import', { preHandler: [requireAuth] }, async (request, reply) => {
    const { templates } = importSchema.parse(request.body);
    const user = request.user!;

    if (templates.length === 0) {
      throw badRequest('No templates to import');
    }

    if (templates.length > 50) {
      throw badRequest('Cannot import more than 50 templates at once');
    }

    const now = new Date();
    const imported: Array<{ id: string; name: string }> = [];

    for (const tmpl of templates) {
      const templateId = randomUUID();
      await db.insert(sectionTemplates).values({
        id: templateId,
        name: tmpl.name,
        description: tmpl.description ?? null,
        category: tmpl.category,
        contentJson: tmpl.contentJson,
        thumbnail: tmpl.thumbnail ?? null,
        createdBy: user.id,
        createdAt: now,
        updatedAt: now,
      });
      imported.push({ id: templateId, name: tmpl.name });
    }

    return reply.status(201).send({
      success: true,
      data: { imported, count: imported.length },
    });
  });

  /**
   * POST /section-templates/export - Export section templates as JSON
   */
  fastify.post('/export', { preHandler: [requireAuth] }, async (request, reply) => {
    const exportSchema = z.object({
      ids: z.array(z.string()).optional(),
      category: z.enum(categories).optional(),
    });

    const { ids, category } = exportSchema.parse(request.body);

    let result;
    if (ids && ids.length > 0) {
      // Export specific templates
      const templates = [];
      for (const id of ids) {
        const tmpl = await db.select().from(sectionTemplates).where(eq(sectionTemplates.id, id)).limit(1);
        if (tmpl.length > 0) templates.push(tmpl[0]);
      }
      result = templates;
    } else if (category) {
      result = await db.select().from(sectionTemplates).where(eq(sectionTemplates.category, category));
    } else {
      result = await db.select().from(sectionTemplates);
    }

    // Strip internal fields for export
    const exportData = result.map(t => ({
      name: t!.name,
      description: t!.description,
      category: t!.category,
      contentJson: t!.contentJson,
      thumbnail: t!.thumbnail,
    }));

    return reply.send({
      success: true,
      data: { templates: exportData, count: exportData.length },
    });
  });
}
