// PagePress v0.0.4 - 2025-11-30
// Pages CRUD routes

import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { eq, desc, asc, like, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../lib/db.js';
import { pages, users } from '../lib/schema.js';
import { requireAuth } from '../middleware/auth.js';
import { generateUniqueSlug, isValidSlug, isSlugUnique } from '../lib/slug.js';

/**
 * Page type enum values
 */
const pageTypes = ['page', 'header', 'footer'] as const;

/**
 * Create page request schema
 */
const createPageSchema = z.object({
  title: z.string().min(1).max(255),
  slug: z.string().min(1).max(255).optional(),
  contentJson: z.record(z.string(), z.unknown()).optional(),
  published: z.boolean().optional().default(false),
  type: z.enum(pageTypes).optional().default('page'),
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
    const parseResult = querySchema.safeParse(request.query);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: 'Validation Error',
        message: 'Invalid query parameters',
        details: parseResult.error.flatten().fieldErrors,
      });
    }

    const { page, limit, type, published, search, sortBy, sortOrder } = parseResult.data;
    const offset = (page - 1) * limit;

    // Build conditions
    const conditions = [];
    if (type) conditions.push(eq(pages.type, type));
    if (published !== undefined) conditions.push(eq(pages.published, published));
    if (search) conditions.push(like(pages.title, `%${search}%`));

    // Get total count
    const countResult = await db
      .select({ id: pages.id })
      .from(pages)
      .where(conditions.length > 0 ? and(...conditions) : undefined);
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
        type: pages.type,
        authorId: pages.authorId,
        authorUsername: users.username,
        createdAt: pages.createdAt,
        updatedAt: pages.updatedAt,
      })
      .from(pages)
      .leftJoin(users, eq(pages.authorId, users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(sortFn(sortColumn))
      .limit(limit)
      .offset(offset);

    return reply.send({
      pages: result,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
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
        type: pages.type,
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
      return reply.status(404).send({
        error: 'Not Found',
        message: 'Page not found',
      });
    }

    return reply.send({ page });
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
      return reply.status(404).send({
        error: 'Not Found',
        message: 'Page not found',
      });
    }

    return reply.send({ page });
  });

  /**
   * POST /pages - Create a new page
   */
  fastify.post('/', { preHandler: [requireAuth] }, async (request, reply) => {
    const parseResult = createPageSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: 'Validation Error',
        message: 'Invalid page data',
        details: parseResult.error.flatten().fieldErrors,
      });
    }

    const { title, slug: requestedSlug, contentJson, published, type } = parseResult.data;
    const user = request.user!;

    // Generate or validate slug
    let slug: string;
    if (requestedSlug) {
      if (!isValidSlug(requestedSlug)) {
        return reply.status(400).send({
          error: 'Validation Error',
          message: 'Invalid slug format. Use lowercase letters, numbers, and hyphens only.',
        });
      }
      const isUnique = await isSlugUnique(requestedSlug);
      if (!isUnique) {
        return reply.status(409).send({
          error: 'Conflict',
          message: 'Slug already in use',
        });
      }
      slug = requestedSlug;
    } else {
      slug = await generateUniqueSlug(title);
    }

    const pageId = uuidv4();
    const now = new Date();

    await db.insert(pages).values({
      id: pageId,
      title,
      slug,
      contentJson: contentJson ?? {},
      published,
      type,
      authorId: user.id,
      createdAt: now,
      updatedAt: now,
    });

    return reply.status(201).send({
      message: 'Page created',
      page: {
        id: pageId,
        title,
        slug,
        contentJson: contentJson ?? {},
        published,
        type,
        authorId: user.id,
        createdAt: now,
        updatedAt: now,
      },
    });
  });

  /**
   * PUT /pages/:id - Update a page
   */
  fastify.put('/:id', { preHandler: [requireAuth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    
    const parseResult = updatePageSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: 'Validation Error',
        message: 'Invalid page data',
        details: parseResult.error.flatten().fieldErrors,
      });
    }

    // Check if page exists
    const existing = await db
      .select({ id: pages.id })
      .from(pages)
      .where(eq(pages.id, id))
      .limit(1);

    if (existing.length === 0) {
      return reply.status(404).send({
        error: 'Not Found',
        message: 'Page not found',
      });
    }

    const { title, slug: requestedSlug, contentJson, published, type } = parseResult.data;

    // Validate slug if provided
    if (requestedSlug) {
      if (!isValidSlug(requestedSlug)) {
        return reply.status(400).send({
          error: 'Validation Error',
          message: 'Invalid slug format. Use lowercase letters, numbers, and hyphens only.',
        });
      }
      const isUnique = await isSlugUnique(requestedSlug, id);
      if (!isUnique) {
        return reply.status(409).send({
          error: 'Conflict',
          message: 'Slug already in use',
        });
      }
    }

    // Build update object
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };
    if (title !== undefined) updateData.title = title;
    if (requestedSlug !== undefined) updateData.slug = requestedSlug;
    if (contentJson !== undefined) updateData.contentJson = contentJson;
    if (published !== undefined) updateData.published = published;
    if (type !== undefined) updateData.type = type;

    await db.update(pages).set(updateData).where(eq(pages.id, id));

    // Fetch updated page
    const result = await db
      .select()
      .from(pages)
      .where(eq(pages.id, id))
      .limit(1);

    return reply.send({
      message: 'Page updated',
      page: result[0],
    });
  });

  /**
   * DELETE /pages/:id - Delete a page
   */
  fastify.delete('/:id', { preHandler: [requireAuth] }, async (request, reply) => {
    const { id } = request.params as { id: string };

    // Check if page exists
    const existing = await db
      .select({ id: pages.id })
      .from(pages)
      .where(eq(pages.id, id))
      .limit(1);

    if (existing.length === 0) {
      return reply.status(404).send({
        error: 'Not Found',
        message: 'Page not found',
      });
    }

    await db.delete(pages).where(eq(pages.id, id));

    return reply.send({
      message: 'Page deleted',
    });
  });

  /**
   * POST /pages/:id/duplicate - Duplicate a page
   */
  fastify.post('/:id/duplicate', { preHandler: [requireAuth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const user = request.user!;

    // Get original page
    const result = await db
      .select()
      .from(pages)
      .where(eq(pages.id, id))
      .limit(1);

    const original = result[0];
    if (!original) {
      return reply.status(404).send({
        error: 'Not Found',
        message: 'Page not found',
      });
    }

    // Generate new slug
    const newTitle = `${original.title} (Copy)`;
    const newSlug = await generateUniqueSlug(newTitle);
    const newId = uuidv4();
    const now = new Date();

    await db.insert(pages).values({
      id: newId,
      title: newTitle,
      slug: newSlug,
      contentJson: original.contentJson,
      published: false, // Always unpublished
      type: original.type,
      authorId: user.id,
      createdAt: now,
      updatedAt: now,
    });

    return reply.status(201).send({
      message: 'Page duplicated',
      page: {
        id: newId,
        title: newTitle,
        slug: newSlug,
        contentJson: original.contentJson,
        published: false,
        type: original.type,
        authorId: user.id,
        createdAt: now,
        updatedAt: now,
      },
    });
  });
}
