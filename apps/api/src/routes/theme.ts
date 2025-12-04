// PagePress v0.0.10 - 2025-12-04
// Theme and page settings routes

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db, themeSettings, pageSettings } from '../lib/db.js';
import { requireAuth } from '../middleware/auth.js';

/**
 * Zod schema for global color
 */
const globalColorSchema = z.object({
  id: z.string(),
  name: z.string(),
  value: z.string(),
  category: z.enum(['primary', 'secondary', 'accent', 'neutral', 'custom']),
});

/**
 * Zod schema for responsive value
 */
const responsiveValueSchema = z.object({
  desktop: z.string(),
  tablet: z.string().optional(),
  mobile: z.string().optional(),
  mobilePortrait: z.string().optional(),
});

/**
 * Zod schema for typography settings
 */
const typographySchema = z.object({
  fontFamily: z.object({
    heading: z.string(),
    body: z.string(),
  }).optional(),
  baseFontSize: z.number().optional(),
  headingSizes: z.record(z.string(), responsiveValueSchema).optional(),
  bodyLineHeight: z.number().optional(),
  headingLineHeight: z.number().optional(),
}).partial();

/**
 * Zod schema for element defaults
 */
const elementDefaultsSchema = z.object({
  button: z.object({
    padding: z.string(),
    borderRadius: z.string(),
    fontSize: z.string(),
  }).partial().optional(),
  link: z.object({
    color: z.string(),
    hoverColor: z.string(),
    textDecoration: z.string(),
  }).partial().optional(),
  container: z.object({
    maxWidth: z.string(),
    padding: z.string(),
  }).partial().optional(),
  form: z.object({
    inputPadding: z.string(),
    inputBorderRadius: z.string(),
    inputBorderColor: z.string(),
  }).partial().optional(),
}).partial();

/**
 * Zod schema for breakpoint
 */
const breakpointSchema = z.object({
  id: z.string(),
  label: z.string(),
  maxWidth: z.number().nullable(),
  minWidth: z.number(),
});

/**
 * Zod schema for spacing settings
 */
const spacingSchema = z.object({
  base: z.number(),
  scale: z.array(z.number()),
}).partial();

/**
 * Zod schema for theme settings update
 */
const themeSettingsUpdateSchema = z.object({
  colors: z.array(globalColorSchema).optional(),
  typography: typographySchema.optional(),
  elements: elementDefaultsSchema.optional(),
  breakpoints: z.array(breakpointSchema).optional(),
  spacing: spacingSchema.optional(),
}).partial();

/**
 * Zod schema for page SEO settings
 */
const seoSettingsSchema = z.object({
  metaTitle: z.string(),
  metaDescription: z.string(),
  noIndex: z.boolean(),
  noFollow: z.boolean(),
}).partial();

/**
 * Zod schema for page social settings
 */
const socialSettingsSchema = z.object({
  ogTitle: z.string(),
  ogDescription: z.string(),
  ogImage: z.string(),
}).partial();

/**
 * Zod schema for page custom code
 */
const customCodeSchema = z.object({
  css: z.string(),
  jsHead: z.string(),
  jsBody: z.string(),
}).partial();

/**
 * Zod schema for page settings update
 */
const pageSettingsUpdateSchema = z.object({
  disableHeader: z.boolean().optional(),
  disableFooter: z.boolean().optional(),
  customBodyClass: z.string().optional(),
  seo: seoSettingsSchema.optional(),
  social: socialSettingsSchema.optional(),
  customCode: customCodeSchema.optional(),
}).partial();

/**
 * Default theme settings for new installations
 */
const DEFAULT_THEME_SETTINGS = {
  colors: [
    { id: 'primary', name: 'Primary', value: '#3b82f6', category: 'primary' },
    { id: 'secondary', name: 'Secondary', value: '#64748b', category: 'secondary' },
    { id: 'accent', name: 'Accent', value: '#f59e0b', category: 'accent' },
    { id: 'background', name: 'Background', value: '#ffffff', category: 'neutral' },
    { id: 'foreground', name: 'Foreground', value: '#0f172a', category: 'neutral' },
    { id: 'muted', name: 'Muted', value: '#f1f5f9', category: 'neutral' },
  ],
  typography: {
    fontFamily: {
      heading: 'Inter, system-ui, sans-serif',
      body: 'Inter, system-ui, sans-serif',
    },
    baseFontSize: 16,
    headingSizes: {
      h1: { desktop: '3rem', tablet: '2.5rem', mobile: '2rem' },
      h2: { desktop: '2.25rem', tablet: '2rem', mobile: '1.75rem' },
      h3: { desktop: '1.875rem', tablet: '1.5rem', mobile: '1.25rem' },
      h4: { desktop: '1.5rem', tablet: '1.25rem', mobile: '1.125rem' },
      h5: { desktop: '1.25rem', tablet: '1.125rem', mobile: '1rem' },
      h6: { desktop: '1rem', tablet: '1rem', mobile: '0.875rem' },
    },
    bodyLineHeight: 1.6,
    headingLineHeight: 1.2,
  },
  elements: {
    button: {
      padding: '0.75rem 1.5rem',
      borderRadius: '0.375rem',
      fontSize: '1rem',
    },
    link: {
      color: '#3b82f6',
      hoverColor: '#2563eb',
      textDecoration: 'none',
    },
    container: {
      maxWidth: '1280px',
      padding: '1rem',
    },
    form: {
      inputPadding: '0.5rem 0.75rem',
      inputBorderRadius: '0.375rem',
      inputBorderColor: '#e2e8f0',
    },
  },
  breakpoints: [
    { id: 'desktop', label: 'Desktop', minWidth: 1024, maxWidth: null },
    { id: 'tablet', label: 'Tablet', minWidth: 768, maxWidth: 1023 },
    { id: 'mobileLandscape', label: 'Mobile Landscape', minWidth: 480, maxWidth: 767 },
    { id: 'mobilePortrait', label: 'Mobile Portrait', minWidth: 0, maxWidth: 479 },
  ],
  spacing: {
    base: 4,
    scale: [0, 0.25, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10, 12, 16],
  },
};

/**
 * Theme routes registration
 */
export async function themeRoutes(fastify: FastifyInstance): Promise<void> {
  /**
   * GET /theme - Get global theme settings
   */
  fastify.get(
    '/',
    { preHandler: [requireAuth] },
    async (_request: FastifyRequest, reply: FastifyReply) => {
      try {
        const result = await db
          .select()
          .from(themeSettings)
          .where(eq(themeSettings.id, 'default'));

        let settings = result[0];
        
        // Create default settings if none exist
        if (!settings) {
          await db.insert(themeSettings).values({
            id: 'default',
            settings: DEFAULT_THEME_SETTINGS,
            updatedAt: new Date(),
          });
          
          return reply.send({
            settings: DEFAULT_THEME_SETTINGS,
          });
        }

        return reply.send({
          settings: settings.settings,
        });
      } catch (error) {
        fastify.log.error(error, 'Failed to get theme settings');
        return reply.status(500).send({
          error: 'Failed to get theme settings',
        });
      }
    }
  );

  /**
   * PUT /theme - Update global theme settings
   */
  fastify.put(
    '/',
    { preHandler: [requireAuth] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const parseResult = themeSettingsUpdateSchema.safeParse(request.body);

        if (!parseResult.success) {
          return reply.status(400).send({
            error: 'Invalid settings',
            details: parseResult.error.flatten(),
          });
        }

        // Get existing settings
        const existing = await db
          .select()
          .from(themeSettings)
          .where(eq(themeSettings.id, 'default'));

        const currentSettings = (existing[0]?.settings as Record<string, unknown>) || {};
        
        // Deep merge settings
        const newSettings = deepMerge(currentSettings, parseResult.data);

        // Update settings
        await db
          .update(themeSettings)
          .set({
            settings: newSettings,
            updatedAt: new Date(),
          })
          .where(eq(themeSettings.id, 'default'));

        return reply.send({
          message: 'Theme settings updated',
          settings: newSettings,
        });
      } catch (error) {
        fastify.log.error(error, 'Failed to update theme settings');
        return reply.status(500).send({
          error: 'Failed to update theme settings',
        });
      }
    }
  );

  /**
   * GET /theme/page/:pageId - Get page-specific settings
   */
  fastify.get<{ Params: { pageId: string } }>(
    '/page/:pageId',
    { preHandler: [requireAuth] },
    async (request: FastifyRequest<{ Params: { pageId: string } }>, reply: FastifyReply) => {
      try {
        const { pageId } = request.params;

        const result = await db
          .select()
          .from(pageSettings)
          .where(eq(pageSettings.pageId, pageId));

        return reply.send({
          settings: result[0]?.settings || {},
        });
      } catch (error) {
        fastify.log.error(error, 'Failed to get page settings');
        return reply.status(500).send({
          error: 'Failed to get page settings',
        });
      }
    }
  );

  /**
   * PUT /theme/page/:pageId - Update page-specific settings
   */
  fastify.put<{ Params: { pageId: string } }>(
    '/page/:pageId',
    { preHandler: [requireAuth] },
    async (request: FastifyRequest<{ Params: { pageId: string } }>, reply: FastifyReply) => {
      try {
        const { pageId } = request.params;

        const parseResult = pageSettingsUpdateSchema.safeParse(request.body);

        if (!parseResult.success) {
          return reply.status(400).send({
            error: 'Invalid settings',
            details: parseResult.error.flatten(),
          });
        }

        // Get existing settings
        const existing = await db
          .select()
          .from(pageSettings)
          .where(eq(pageSettings.pageId, pageId));

        const currentSettings = (existing[0]?.settings as Record<string, unknown>) || {};
        const newSettings = { ...currentSettings, ...parseResult.data };

        // Upsert settings
        if (existing.length === 0) {
          await db.insert(pageSettings).values({
            pageId,
            settings: newSettings,
            updatedAt: new Date(),
          });
        } else {
          await db
            .update(pageSettings)
            .set({
              settings: newSettings,
              updatedAt: new Date(),
            })
            .where(eq(pageSettings.pageId, pageId));
        }

        return reply.send({
          message: 'Page settings updated',
          settings: newSettings,
        });
      } catch (error) {
        fastify.log.error(error, 'Failed to update page settings');
        return reply.status(500).send({
          error: 'Failed to update page settings',
        });
      }
    }
  );
}

/**
 * Deep merge utility for nested objects
 */
function deepMerge(
  target: Record<string, unknown>,
  source: Record<string, unknown>
): Record<string, unknown> {
  const result = { ...target };

  for (const key of Object.keys(source)) {
    const sourceValue = source[key];
    const targetValue = target[key];

    if (
      sourceValue !== null &&
      typeof sourceValue === 'object' &&
      !Array.isArray(sourceValue) &&
      targetValue !== null &&
      typeof targetValue === 'object' &&
      !Array.isArray(targetValue)
    ) {
      result[key] = deepMerge(
        targetValue as Record<string, unknown>,
        sourceValue as Record<string, unknown>
      );
    } else {
      result[key] = sourceValue;
    }
  }

  return result;
}
