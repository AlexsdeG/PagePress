// PagePress v0.0.4 - 2025-11-30
// Site settings routes

import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '../lib/db.js';
import { siteSettings } from '../lib/schema.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

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
    // Get all settings from database
    const result = await db.select().from(siteSettings);
    
    // Merge with defaults
    const settings: Record<string, SettingsValue> = { ...DEFAULT_SETTINGS };
    
    for (const row of result) {
      if (row.value !== null) {
        settings[row.key] = row.value as SettingsValue;
      }
    }

    return reply.send({ settings });
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

    return reply.send({ key, value });
  });

  /**
   * PUT /settings - Update multiple settings
   */
  fastify.put('/', { preHandler: [requireAuth, requireAdmin] }, async (request, reply) => {
    const parseResult = updateSettingsSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: 'Validation Error',
        message: 'Invalid settings data',
        details: parseResult.error.flatten().fieldErrors,
      });
    }

    const updates = parseResult.data;
    const now = new Date();

    // Update each setting
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        // Check if setting exists
        const existing = await db
          .select({ key: siteSettings.key })
          .from(siteSettings)
          .where(eq(siteSettings.key, key))
          .limit(1);

        if (existing.length > 0) {
          // Update existing
          await db
            .update(siteSettings)
            .set({ value: value as Record<string, unknown>, updatedAt: now })
            .where(eq(siteSettings.key, key));
        } else {
          // Insert new
          await db.insert(siteSettings).values({
            key,
            value: value as Record<string, unknown>,
            updatedAt: now,
          });
        }
      }
    }

    // Return updated settings
    const result = await db.select().from(siteSettings);
    const settings: Record<string, SettingsValue> = { ...DEFAULT_SETTINGS };
    
    for (const row of result) {
      if (row.value !== null) {
        settings[row.key] = row.value as SettingsValue;
      }
    }

    return reply.send({
      message: 'Settings updated',
      settings,
    });
  });

  /**
   * PUT /settings/:key - Update a specific setting
   */
  fastify.put('/:key', { preHandler: [requireAuth, requireAdmin] }, async (request, reply) => {
    const { key } = request.params as { key: string };
    const body = request.body as { value: unknown };

    // Validate the key exists in schema
    if (!(key in SETTINGS_SCHEMA)) {
      return reply.status(400).send({
        error: 'Validation Error',
        message: `Unknown setting key: ${key}`,
      });
    }

    // Validate the value
    const schema = SETTINGS_SCHEMA[key as keyof typeof SETTINGS_SCHEMA];
    const parseResult = schema.safeParse(body.value);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: 'Validation Error',
        message: 'Invalid setting value',
        details: parseResult.error.flatten(),
      });
    }

    const now = new Date();
    const value = parseResult.data;

    // Check if setting exists
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

    return reply.send({
      message: 'Setting updated',
      key,
      value,
    });
  });

  /**
   * DELETE /settings/:key - Reset a setting to default
   */
  fastify.delete('/:key', { preHandler: [requireAuth, requireAdmin] }, async (request, reply) => {
    const { key } = request.params as { key: string };

    await db.delete(siteSettings).where(eq(siteSettings.key, key));

    return reply.send({
      message: 'Setting reset to default',
      key,
      value: DEFAULT_SETTINGS[key] ?? null,
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

    return reply.send({ settings });
  });
}
