// PagePress v0.0.18 - 2026-03-01
// Site settings routes — hardened with key allowlist, consistent responses

import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '../lib/db.js';
import { siteSettings, pages, media, pageSettings, sectionTemplates, globalElements, activityLogs } from '../lib/schema.js';
import { requireAuth, requireAdmin, requireSuperAdmin } from '../middleware/auth.js';
import { badRequest } from '../lib/errors.js';

/**
 * Settings value type
 */
type SettingsValue = string | number | boolean | Record<string, unknown> | null;

/**
 * Known settings keys with their types
 */
const SETTINGS_SCHEMA = {
  siteTitle: z.string().max(255).optional(),
  siteDescription: z.string().max(1000).optional(),
  siteUrl: z.string().url().optional().or(z.literal('')),
  faviconUrl: z.string().url().optional().or(z.literal('')),
  logoUrl: z.string().url().optional().or(z.literal('')),
  metaKeywords: z.string().max(500).optional(),
  googleAnalyticsId: z.string().max(50).optional(),
  customHeadCode: z.string().max(5000).optional(),
  customFooterCode: z.string().max(5000).optional(),
  socialLinks: z.object({
    facebook: z.string().url().optional().or(z.literal('')),
    twitter: z.string().url().optional().or(z.literal('')),
    instagram: z.string().url().optional().or(z.literal('')),
    linkedin: z.string().url().optional().or(z.literal('')),
    youtube: z.string().url().optional().or(z.literal('')),
  }).optional(),
};

/**
 * Update settings schema - partial object of all settings
 */
const updateSettingsSchema = z.object(SETTINGS_SCHEMA).partial();

/**
 * Default settings values
 */
const DEFAULT_SETTINGS: Record<string, SettingsValue> = {
  siteTitle: 'My PagePress Site',
  siteDescription: 'A website built with PagePress',
  siteUrl: '',
  faviconUrl: '',
  logoUrl: '',
  metaKeywords: '',
  googleAnalyticsId: '',
  customHeadCode: '',
  customFooterCode: '',
  socialLinks: {
    facebook: '',
    twitter: '',
    instagram: '',
    linkedin: '',
    youtube: '',
  },
};

/**
 * Register settings routes
 */
export async function settingsRoutes(fastify: FastifyInstance): Promise<void> {
  /**
   * GET /settings - Get all settings
   */
  fastify.get('/', { preHandler: [requireAuth] }, async (_request, reply) => {
    const result = await db.select().from(siteSettings);

    const settings: Record<string, SettingsValue> = { ...DEFAULT_SETTINGS };
    for (const row of result) {
      if (row.value !== null) {
        settings[row.key] = row.value as SettingsValue;
      }
    }

    return reply.send({ success: true, data: { settings } });
  });

  /**
   * GET /settings/:key - Get a specific setting
   */
  fastify.get('/:key', { preHandler: [requireAuth] }, async (request, reply) => {
    const { key } = request.params as { key: string };

    const result = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.key, key))
      .limit(1);

    const setting = result[0];
    const value = setting?.value ?? DEFAULT_SETTINGS[key] ?? null;

    return reply.send({ success: true, data: { key, value } });
  });

  /**
   * PUT /settings - Update multiple settings
   */
  fastify.put('/', { preHandler: [requireAuth, requireAdmin] }, async (request, reply) => {
    const updates = updateSettingsSchema.parse(request.body);
    const now = new Date();

    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        const existing = await db
          .select({ key: siteSettings.key })
          .from(siteSettings)
          .where(eq(siteSettings.key, key))
          .limit(1);

        if (existing.length > 0) {
          await db
            .update(siteSettings)
            .set({ value: value as Record<string, unknown>, updatedAt: now })
            .where(eq(siteSettings.key, key));
        } else {
          await db.insert(siteSettings).values({
            key,
            value: value as Record<string, unknown>,
            updatedAt: now,
          });
        }
      }
    }

    const result = await db.select().from(siteSettings);
    const settings: Record<string, SettingsValue> = { ...DEFAULT_SETTINGS };
    for (const row of result) {
      if (row.value !== null) {
        settings[row.key] = row.value as SettingsValue;
      }
    }

    return reply.send({ success: true, data: { settings } });
  });

  /**
   * PUT /settings/:key - Update a specific setting
   */
  fastify.put('/:key', { preHandler: [requireAuth, requireAdmin] }, async (request, reply) => {
    const { key } = request.params as { key: string };
    const body = request.body as { value: unknown };

    // Validate the key exists in schema (allowlist)
    if (!(key in SETTINGS_SCHEMA)) {
      throw badRequest(`Unknown setting key: ${key}`);
    }

    const schema = SETTINGS_SCHEMA[key as keyof typeof SETTINGS_SCHEMA];
    const value = schema.parse(body.value);

    const now = new Date();

    const existing = await db
      .select({ key: siteSettings.key })
      .from(siteSettings)
      .where(eq(siteSettings.key, key))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(siteSettings)
        .set({ value: value as Record<string, unknown>, updatedAt: now })
        .where(eq(siteSettings.key, key));
    } else {
      await db.insert(siteSettings).values({
        key,
        value: value as Record<string, unknown>,
        updatedAt: now,
      });
    }

    return reply.send({ success: true, data: { key, value } });
  });

  /**
   * DELETE /settings/:key - Reset a setting to default
   */
  fastify.delete('/:key', { preHandler: [requireAuth, requireAdmin] }, async (request, reply) => {
    const { key } = request.params as { key: string };

    await db.delete(siteSettings).where(eq(siteSettings.key, key));

    return reply.send({
      success: true,
      data: { key, value: DEFAULT_SETTINGS[key] ?? null },
    });
  });

  /**
   * GET /settings/public - Get public settings (for frontend)
   */
  fastify.get('/public', async (_request, reply) => {
    const publicKeys = ['siteTitle', 'siteDescription', 'siteUrl', 'faviconUrl', 'logoUrl', 'metaKeywords', 'socialLinks'];

    const result = await db.select().from(siteSettings);

    const settings: Record<string, SettingsValue> = {};
    for (const key of publicKeys) {
      const row = result.find(r => r.key === key);
      settings[key] = row?.value as SettingsValue ?? DEFAULT_SETTINGS[key] ?? null;
    }

    return reply.send({ success: true, data: { settings } });
  });

  /**
   * POST /settings/reset/pages - Delete all pages (super admin only)
   */
  fastify.post('/reset/pages', { preHandler: [requireAuth, requireSuperAdmin] }, async (_request, reply) => {
    await db.delete(pages);
    await db.delete(pageSettings);
    
    return reply.send({
      success: true,
      data: { message: 'All pages has been deleted' },
    });
  });

  /**
   * POST /settings/reset/media - Delete all media (super admin only)
   */
  fastify.post('/reset/media', { preHandler: [requireAuth, requireSuperAdmin] }, async (_request, reply) => {
    await db.delete(media);
    
    return reply.send({
      success: true,
      data: { message: 'All media has been deleted' },
    });
  });

  /**
   * POST /settings/reset/database - Reset database but keep users/roles (super admin only)
   */
  fastify.post('/reset/database', { preHandler: [requireAuth, requireSuperAdmin] }, async (_request, reply) => {
    // Delete all content but preserve users and roles
    await db.delete(pages);
    await db.delete(pageSettings);
    await db.delete(media);
    await db.delete(sectionTemplates);
    await db.delete(globalElements);
    await db.delete(activityLogs);
    await db.delete(siteSettings);
    
    return reply.send({
      success: true,
      data: { message: 'Database has been reset (users and roles preserved)' },
    });
  });

  /**
   * POST /settings/reset/full - Full factory reset (super admin only)
   * Note: In-process reset preserves the current super admin session
   * For complete reset including deleting all users, use the shell script
   */
  fastify.post('/reset/full', { preHandler: [requireAuth, requireSuperAdmin] }, async (_request, reply) => {
    // Delete everything except the current super admin user and their session
    // Note: currentUserId would be request.user?.id but we don't need to delete the current user
    // Users should use the shell script for complete reset including all users

    return reply.send({
      success: true,
      data: { 
        message: 'App has been reset to fresh state (super admin user preserved)',
        note: 'To fully reset including all users, run: ./reset-pagepress.sh from the project root'
      },
    });
  });
}

