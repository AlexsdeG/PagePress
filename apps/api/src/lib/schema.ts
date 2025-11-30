// PagePress v0.0.2 - 2025-11-30

import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

/**
 * Users table - Stores admin and editor accounts
 */
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role', { enum: ['admin', 'editor'] }).default('editor').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .notNull(),
});

/**
 * Site Settings table - Key-value store for global configuration
 */
export const siteSettings = sqliteTable('site_settings', {
  key: text('key').primaryKey(),
  value: text('value', { mode: 'json' }),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .notNull(),
});

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type SiteSetting = typeof siteSettings.$inferSelect;
export type NewSiteSetting = typeof siteSettings.$inferInsert;
