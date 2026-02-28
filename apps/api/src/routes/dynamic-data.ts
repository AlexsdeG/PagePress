// PagePress v0.0.16 - 2026-02-28
// Dynamic data resolution route — resolves dynamic tags to actual values

import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '../lib/db.js';
import { pages, siteSettings, users } from '../lib/schema.js';
import { requireAuth } from '../middleware/auth.js';

/**
 * The set of supported dynamic data fields.
 * Maps to DynamicDataField in packages/types.
 */
const dynamicDataFieldSchema = z.enum([
  'site.title',
  'site.description',
  'site.url',
  'page.title',
  'page.slug',
  'page.date',
  'page.author',
  'user.name',
  'user.email',
  'user.role',
]);

/**
 * Request body schema for resolving dynamic data
 */
const resolveRequestSchema = z.object({
  fields: z.array(dynamicDataFieldSchema).min(1).max(50),
  context: z.object({
    pageId: z.string().optional(),
    userId: z.string().optional(),
  }).optional(),
});

/**
 * Fetch all site settings as a flat map
 */
async function getSiteSettingsMap(): Promise<Record<string, unknown>> {
  const rows = await db.select().from(siteSettings);
  const map: Record<string, unknown> = {};
  for (const row of rows) {
    map[row.key] = row.value;
  }
  return map;
}

/**
 * Register dynamic data routes
 */
export async function dynamicDataRoutes(fastify: FastifyInstance): Promise<void> {
  /**
   * POST /dynamic-data/resolve
   * Resolves a list of dynamic data fields to their current values.
   */
  fastify.post(
    '/resolve',
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const body = resolveRequestSchema.parse(request.body);
      const { fields, context } = body;

      const resolved: Record<string, string> = {};

      // Only fetch what we need
      const needsSite = fields.some((f) => f.startsWith('site.'));
      const needsPage = fields.some((f) => f.startsWith('page.'));

      // Fetch site settings if needed
      let settings: Record<string, unknown> = {};
      if (needsSite) {
        settings = await getSiteSettingsMap();
      }

      // Fetch page data if needed
      let pageData: { title: string; slug: string; createdAt: Date; authorId: string } | null = null;
      let pageAuthorName: string | null = null;
      if (needsPage && context?.pageId) {
        const [row] = await db
          .select({
            title: pages.title,
            slug: pages.slug,
            createdAt: pages.createdAt,
            authorId: pages.authorId,
          })
          .from(pages)
          .where(eq(pages.id, context.pageId))
          .limit(1);

        if (row) {
          pageData = row;
          // Fetch author name if page.author is requested
          if (fields.includes('page.author')) {
            const [author] = await db
              .select({ username: users.username })
              .from(users)
              .where(eq(users.id, row.authorId))
              .limit(1);
            pageAuthorName = author?.username ?? null;
          }
        }
      }

      // Current user data (from session)
      const currentUser = request.user;

      // Resolve each field
      for (const field of fields) {
        switch (field) {
          // Site fields
          case 'site.title':
            resolved[field] = (settings.siteTitle as string) || 'My PagePress Site';
            break;
          case 'site.description':
            resolved[field] = (settings.siteDescription as string) || '';
            break;
          case 'site.url':
            resolved[field] = (settings.siteUrl as string) || '';
            break;

          // Page fields
          case 'page.title':
            resolved[field] = pageData?.title ?? '';
            break;
          case 'page.slug':
            resolved[field] = pageData?.slug ?? '';
            break;
          case 'page.date':
            resolved[field] = pageData?.createdAt
              ? new Date(pageData.createdAt).toLocaleDateString()
              : '';
            break;
          case 'page.author':
            resolved[field] = pageAuthorName ?? '';
            break;

          // User fields
          case 'user.name':
            resolved[field] = currentUser?.username ?? '';
            break;
          case 'user.email':
            resolved[field] = currentUser?.email ?? '';
            break;
          case 'user.role':
            resolved[field] = currentUser?.role ?? '';
            break;

          default:
            resolved[field] = '';
        }
      }

      return reply.send({
        success: true,
        data: { resolved },
      });
    }
  );

  /**
   * GET /dynamic-data/sources
   * Returns the list of available dynamic data sources for the picker UI.
   */
  fastify.get(
    '/sources',
    { preHandler: [requireAuth] },
    async (_request, reply) => {
      const sources = [
        // Site
        { field: 'site.title', label: 'Site Title', category: 'site', description: 'The name of the website', valueType: 'text' },
        { field: 'site.description', label: 'Site Description', category: 'site', description: 'The site meta description', valueType: 'text' },
        { field: 'site.url', label: 'Site URL', category: 'site', description: 'The site base URL', valueType: 'url' },
        // Page
        { field: 'page.title', label: 'Page Title', category: 'page', description: 'Current page title', valueType: 'text' },
        { field: 'page.slug', label: 'Page Slug', category: 'page', description: 'Current page slug', valueType: 'text' },
        { field: 'page.date', label: 'Page Date', category: 'page', description: 'Page creation date', valueType: 'date' },
        { field: 'page.author', label: 'Page Author', category: 'page', description: 'Page author username', valueType: 'text' },
        // User
        { field: 'user.name', label: 'User Name', category: 'user', description: 'Current logged-in user name', valueType: 'text' },
        { field: 'user.email', label: 'User Email', category: 'user', description: 'Current logged-in user email', valueType: 'text' },
        { field: 'user.role', label: 'User Role', category: 'user', description: 'Current user role (admin/editor)', valueType: 'text' },
      ];

      return reply.send({
        success: true,
        data: { sources },
      });
    }
  );
}
