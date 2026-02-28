// PagePress v0.0.15 - 2026-02-28
// Pages CRUD routes — hardened with consistent responses, thrown errors

import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { eq, desc, asc, like, and, ne } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { db } from '../lib/db.js';
import { pages, users } from '../lib/schema.js';
import { requireAuth } from '../middleware/auth.js';
import { generateUniqueSlug, isValidSlug, isSlugUnique } from '../lib/slug.js';
import { notFound, badRequest, conflict } from '../lib/errors.js';

/**
 * Page type enum values - Fixed: unified with frontend types
 */
const pageTypes = ['page', 'post', 'template'] as const;

/**
 * Create page request schema
 */
const createPageSchema = z.object({
  title: z.string().min(1).max(255),
  slug: z.string().min(1).max(255).optional(),
  contentJson: z.record(z.string(), z.unknown()).optional(),
  published: z.boolean().optional().default(false),
  type: z.enum(pageTypes).optional().default('page'),
  isHomepage: z.boolean().optional().default(false),
});

/**
 * Update page request schema
 */
const updatePageSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  slug: z.string().min(1).max(255).optional(),
  contentJson: z.record(z.string(), z.unknown()).optional(),
  published: z.boolean().optional(),
  type: z.enum(pageTypes).optional(),
  isHomepage: z.boolean().optional(),
});

/**
 * Query parameters schema
 */
const querySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  type: z.enum(pageTypes).optional(),
  published: z.coerce.boolean().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['title', 'createdAt', 'updatedAt']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

/**
 * Register pages routes
 */
export async function pagesRoutes(fastify: FastifyInstance): Promise<void> {
  /**
   * GET /pages - List all pages with pagination and filtering
   */
  fastify.get('/', { preHandler: [requireAuth] }, async (request, reply) => {
    const { page, limit, type, published, search, sortBy, sortOrder } = querySchema.parse(request.query);
    const offset = (page - 1) * limit;

    // Build conditions — exclude templates unless type='template' is explicitly requested
    const conditions = [];
    if (type) {
      conditions.push(eq(pages.type, type));
    } else {
      // By default, exclude templates from pages listing
      conditions.push(ne(pages.type, 'template'));
    }
    if (published !== undefined) conditions.push(eq(pages.published, published));
    if (search) conditions.push(like(pages.title, `%${search}%`));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const countResult = await db
      .select({ id: pages.id })
      .from(pages)
      .where(whereClause);
    const total = countResult.length;

    // Get pages with author info
    const sortColumn = sortBy === 'title' ? pages.title : sortBy === 'updatedAt' ? pages.updatedAt : pages.createdAt;
    const sortFn = sortOrder === 'asc' ? asc : desc;

    const result = await db
      .select({
        id: pages.id,
        title: pages.title,
        slug: pages.slug,
        contentJson: pages.contentJson,
        published: pages.published,
        isHomepage: pages.isHomepage,
        type: pages.type,
        templateType: pages.templateType,
        headerTemplateId: pages.headerTemplateId,
        footerTemplateId: pages.footerTemplateId,
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
        pages: result,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
    });
  });

  /**
   * GET /pages/:id - Get single page by ID
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
        isHomepage: pages.isHomepage,
        type: pages.type,
        templateType: pages.templateType,
        headerTemplateId: pages.headerTemplateId,
        footerTemplateId: pages.footerTemplateId,
        authorId: pages.authorId,
        authorUsername: users.username,
        createdAt: pages.createdAt,
        updatedAt: pages.updatedAt,
      })
      .from(pages)
      .leftJoin(users, eq(pages.authorId, users.id))
      .where(eq(pages.id, id))
      .limit(1);

    const page = result[0];
    if (!page) {
      throw notFound('Page not found');
    }

    return reply.send({ success: true, data: { page } });
  });

  /**
   * GET /pages/slug/:slug - Get page by slug (for public access)
   */
  fastify.get('/slug/:slug', async (request, reply) => {
    const { slug } = request.params as { slug: string };

    const result = await db
      .select({
        id: pages.id,
        title: pages.title,
        slug: pages.slug,
        contentJson: pages.contentJson,
        published: pages.published,
        type: pages.type,
        createdAt: pages.createdAt,
        updatedAt: pages.updatedAt,
      })
      .from(pages)
      .where(and(eq(pages.slug, slug), eq(pages.published, true)))
      .limit(1);

    const page = result[0];
    if (!page) {
      throw notFound('Page not found');
    }

    return reply.send({ success: true, data: { page } });
  });

  /**
   * POST /pages - Create a new page
   */
  fastify.post('/', { preHandler: [requireAuth] }, async (request, reply) => {
    const { title, slug: requestedSlug, contentJson, published, type, isHomepage } = createPageSchema.parse(request.body);
    const user = request.user!;

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
      slug = await generateUniqueSlug(title);
    }

    // If setting as homepage, clear any existing homepage first
    if (isHomepage) {
      await db.update(pages).set({ isHomepage: false, updatedAt: new Date() }).where(eq(pages.isHomepage, true));
    }

    const pageId = randomUUID();
    const now = new Date();

    await db.insert(pages).values({
      id: pageId,
      title,
      slug,
      contentJson: contentJson ?? {},
      published,
      isHomepage,
      type,
      authorId: user.id,
      createdAt: now,
      updatedAt: now,
    });

    return reply.status(201).send({
      success: true,
      data: {
        page: {
          id: pageId, title, slug,
          contentJson: contentJson ?? {},
          published, isHomepage, type,
          authorId: user.id,
          createdAt: now, updatedAt: now,
        },
      },
    });
  });

  /**
   * PUT /pages/:id - Update a page
   */
  fastify.put('/:id', { preHandler: [requireAuth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const { title, slug: requestedSlug, contentJson, published, type, isHomepage } = updatePageSchema.parse(request.body);

    // Check if page exists
    const existing = await db
      .select({ id: pages.id })
      .from(pages)
      .where(eq(pages.id, id))
      .limit(1);

    if (existing.length === 0) {
      throw notFound('Page not found');
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

    // If setting as homepage, clear any existing homepage first
    if (isHomepage === true) {
      await db.update(pages).set({ isHomepage: false, updatedAt: new Date() }).where(eq(pages.isHomepage, true));
    }

    // Build update object
    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (title !== undefined) updateData.title = title;
    if (requestedSlug !== undefined) updateData.slug = requestedSlug;
    if (contentJson !== undefined) updateData.contentJson = contentJson;
    if (published !== undefined) updateData.published = published;
    if (type !== undefined) updateData.type = type;
    if (isHomepage !== undefined) updateData.isHomepage = isHomepage;

    await db.update(pages).set(updateData).where(eq(pages.id, id));

    // Fetch updated page
    const result = await db.select().from(pages).where(eq(pages.id, id)).limit(1);

    return reply.send({ success: true, data: { page: result[0] } });
  });

  /**
   * DELETE /pages/:id - Delete a page
   */
  fastify.delete('/:id', { preHandler: [requireAuth] }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const existing = await db
      .select({ id: pages.id, isHomepage: pages.isHomepage })
      .from(pages)
      .where(eq(pages.id, id))
      .limit(1);

    if (existing.length === 0) {
      throw notFound('Page not found');
    }

    if (existing[0]!.isHomepage) {
      throw badRequest('Cannot delete the homepage. Set another page as homepage first.');
    }

    await db.delete(pages).where(eq(pages.id, id));

    return reply.send({ success: true, data: { message: 'Page deleted' } });
  });

  /**
   * POST /pages/:id/duplicate - Duplicate a page
   */
  fastify.post('/:id/duplicate', { preHandler: [requireAuth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const user = request.user!;

    const result = await db.select().from(pages).where(eq(pages.id, id)).limit(1);
    const original = result[0];
    if (!original) {
      throw notFound('Page not found');
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
      isHomepage: false,
      type: original.type,
      authorId: user.id,
      createdAt: now,
      updatedAt: now,
    });

    return reply.status(201).send({
      success: true,
      data: {
        page: {
          id: newId, title: newTitle, slug: newSlug,
          contentJson: original.contentJson,
          published: false, isHomepage: false, type: original.type,
          authorId: user.id,
          createdAt: now, updatedAt: now,
        },
      },
    });
  });
}
