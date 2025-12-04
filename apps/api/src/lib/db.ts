// PagePress v0.0.10 - 2025-12-04

import { createClient, type Client } from '@libsql/client';
import { drizzle, type LibSQLDatabase } from 'drizzle-orm/libsql';
import { env } from './env.js';
import * as schema from './schema.js';
import * as fs from 'fs';
import * as path from 'path';

export * from './schema.js';

/**
 * Database instance type
 */
export type DatabaseInstance = LibSQLDatabase<typeof schema>;

// Ensure data directory exists
const dataDir = path.dirname(env.DATABASE_URL.replace('file:', ''));
if (dataDir && dataDir !== '.' && !fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Ensure uploads directory exists
const uploadsDir = path.join(dataDir || './data', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * LibSQL client connection
 */
const client: Client = createClient({
  url: `file:${env.DATABASE_URL}`,
});

/**
 * Drizzle ORM database instance
 */
export const db: DatabaseInstance = drizzle(client, { schema });

/**
 * Get the uploads directory path
 */
export function getUploadsDir(): string {
  return uploadsDir;
}

/**
 * Initialize database tables
 */
export async function initializeDatabase(): Promise<void> {
  // Create users table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'editor' NOT NULL,
      created_at INTEGER DEFAULT (unixepoch()) NOT NULL,
      updated_at INTEGER DEFAULT (unixepoch()) NOT NULL
    )
  `);

  // Create sessions table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at INTEGER NOT NULL,
      created_at INTEGER DEFAULT (unixepoch()) NOT NULL
    )
  `);

  // Create index on sessions for faster lookups
  await client.execute(`
    CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)
  `);

  await client.execute(`
    CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at)
  `);

  // Create pages table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS pages (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      content_json TEXT,
      published INTEGER DEFAULT 0 NOT NULL,
      type TEXT DEFAULT 'page' NOT NULL,
      author_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at INTEGER DEFAULT (unixepoch()) NOT NULL,
      updated_at INTEGER DEFAULT (unixepoch()) NOT NULL
    )
  `);

  // Create index on pages for slug lookups
  await client.execute(`
    CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug)
  `);

  await client.execute(`
    CREATE INDEX IF NOT EXISTS idx_pages_type ON pages(type)
  `);

  await client.execute(`
    CREATE INDEX IF NOT EXISTS idx_pages_published ON pages(published)
  `);

  // Create media table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS media (
      id TEXT PRIMARY KEY,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      url TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size INTEGER NOT NULL,
      alt_text TEXT,
      uploaded_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at INTEGER DEFAULT (unixepoch()) NOT NULL
    )
  `);

  // Create index on media for faster lookups
  await client.execute(`
    CREATE INDEX IF NOT EXISTS idx_media_uploaded_by ON media(uploaded_by)
  `);

  // Create site_settings table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT,
      updated_at INTEGER DEFAULT (unixepoch()) NOT NULL
    )
  `);

  // Create theme_settings table for global theme configuration
  await client.execute(`
    CREATE TABLE IF NOT EXISTS theme_settings (
      id TEXT PRIMARY KEY DEFAULT 'default',
      settings TEXT,
      updated_at INTEGER DEFAULT (unixepoch()) NOT NULL
    )
  `);

  // Create page_settings table for per-page SEO and custom settings
  await client.execute(`
    CREATE TABLE IF NOT EXISTS page_settings (
      page_id TEXT PRIMARY KEY REFERENCES pages(id) ON DELETE CASCADE,
      settings TEXT,
      updated_at INTEGER DEFAULT (unixepoch()) NOT NULL
    )
  `);

  // Insert default theme settings if not exists
  await client.execute(`
    INSERT OR IGNORE INTO theme_settings (id, settings) 
    VALUES ('default', '${JSON.stringify(getDefaultThemeSettings())}')
  `);
}

/**
 * Get default theme settings structure
 */
function getDefaultThemeSettings(): Record<string, unknown> {
  return {
    colors: [
      { id: 'primary', name: 'Primary', value: '#3b82f6', category: 'primary' },
      { id: 'secondary', name: 'Secondary', value: '#64748b', category: 'secondary' },
      { id: 'accent', name: 'Accent', value: '#8b5cf6', category: 'accent' },
      { id: 'background', name: 'Background', value: '#ffffff', category: 'neutral' },
      { id: 'foreground', name: 'Foreground', value: '#0f172a', category: 'neutral' },
    ],
    typography: {
      fontFamily: { heading: 'system-ui', body: 'system-ui' },
      baseFontSize: 16,
      headingSizes: {
        h1: { desktop: '3rem' },
        h2: { desktop: '2.25rem' },
        h3: { desktop: '1.875rem' },
        h4: { desktop: '1.5rem' },
        h5: { desktop: '1.25rem' },
        h6: { desktop: '1rem' },
      },
      bodyLineHeight: 1.6,
      headingLineHeight: 1.2,
    },
    elements: {
      button: { padding: '12px 24px', borderRadius: '6px', fontSize: '14px' },
      link: { color: '#3b82f6', hoverColor: '#2563eb', textDecoration: 'none' },
      container: { maxWidth: '1280px', padding: '16px' },
      form: { inputPadding: '8px 12px', inputBorderRadius: '4px', inputBorderColor: '#e5e7eb' },
    },
    breakpoints: [
      { id: 'desktop', label: 'Desktop', maxWidth: null, minWidth: 993 },
      { id: 'tablet', label: 'Tablet', maxWidth: 992, minWidth: 769 },
      { id: 'mobile', label: 'Mobile', maxWidth: 768, minWidth: 480 },
      { id: 'mobilePortrait', label: 'Mobile Portrait', maxWidth: 479, minWidth: 0 },
    ],
    spacing: {
      base: 4,
      scale: [0.25, 0.5, 1, 1.5, 2, 3, 4, 6, 8, 12, 16],
    },
  };
}

/**
 * Check if database is connected and working
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const result = await client.execute('SELECT 1');
    return result.rows.length > 0;
  } catch {
    return false;
  }
}

/**
 * Close database connection gracefully
 */
export function closeDatabase(): void {
  client.close();
}
