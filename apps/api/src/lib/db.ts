// PagePress v0.0.18 - 2026-03-01

import { createClient, type Client } from '@libsql/client';
import { drizzle, type LibSQLDatabase } from 'drizzle-orm/libsql';
import { env } from './env.js';
import * as schema from './schema.js';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';

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
  // Enable WAL mode for better concurrent read performance
  await client.execute('PRAGMA journal_mode=WAL');
  await client.execute('PRAGMA busy_timeout=5000');

  // Create users table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'editor' NOT NULL,
      failed_login_attempts INTEGER DEFAULT 0 NOT NULL,
      locked_at INTEGER,
      created_at INTEGER DEFAULT (unixepoch()) NOT NULL,
      updated_at INTEGER DEFAULT (unixepoch()) NOT NULL
    )
  `);

  // Add new columns to existing users table (safe migration)
  await client.execute(`ALTER TABLE users ADD COLUMN failed_login_attempts INTEGER DEFAULT 0 NOT NULL`).catch(() => {});
  await client.execute(`ALTER TABLE users ADD COLUMN locked_at INTEGER`).catch(() => {});

  // Create sessions table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      user_agent TEXT,
      ip_address TEXT,
      expires_at INTEGER NOT NULL,
      created_at INTEGER DEFAULT (unixepoch()) NOT NULL
    )
  `);

  // Add new columns to existing sessions table (safe migration)
  await client.execute(`ALTER TABLE sessions ADD COLUMN user_agent TEXT`).catch(() => {});
  await client.execute(`ALTER TABLE sessions ADD COLUMN ip_address TEXT`).catch(() => {});

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

  await client.execute(`
    CREATE INDEX IF NOT EXISTS idx_media_created_at ON media(created_at)
  `);

  // Create index on pages.created_at
  await client.execute(`
    CREATE INDEX IF NOT EXISTS idx_pages_created_at ON pages(created_at)
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

  // Phase 10: Add template columns to pages table (safe migration)
  await client.execute(`ALTER TABLE pages ADD COLUMN template_type TEXT`).catch(() => {});
  await client.execute(`ALTER TABLE pages ADD COLUMN header_template_id TEXT`).catch(() => {});
  await client.execute(`ALTER TABLE pages ADD COLUMN footer_template_id TEXT`).catch(() => {});

  // Phase 12: Add is_homepage column to pages table (safe migration)
  await client.execute(`ALTER TABLE pages ADD COLUMN is_homepage INTEGER DEFAULT 0 NOT NULL`).catch(() => {});

  // Phase 10: Create section_templates table for reusable saved blocks
  await client.execute(`
    CREATE TABLE IF NOT EXISTS section_templates (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT DEFAULT 'other' NOT NULL,
      content_json TEXT NOT NULL,
      thumbnail TEXT,
      created_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at INTEGER DEFAULT (unixepoch()) NOT NULL,
      updated_at INTEGER DEFAULT (unixepoch()) NOT NULL
    )
  `);

  await client.execute(`
    CREATE INDEX IF NOT EXISTS idx_section_templates_category ON section_templates(category)
  `);

  await client.execute(`
    CREATE INDEX IF NOT EXISTS idx_section_templates_created_at ON section_templates(created_at)
  `);

  // Phase 10: Create global_elements table for synced elements
  await client.execute(`
    CREATE TABLE IF NOT EXISTS global_elements (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      content_json TEXT NOT NULL,
      created_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at INTEGER DEFAULT (unixepoch()) NOT NULL,
      updated_at INTEGER DEFAULT (unixepoch()) NOT NULL
    )
  `);

  // Phase 10: Create index on pages for template type lookups
  await client.execute(`
    CREATE INDEX IF NOT EXISTS idx_pages_template_type ON pages(template_type)
  `);

  // Phase 13: Create roles table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS roles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      permissions TEXT NOT NULL DEFAULT '{}',
      is_system INTEGER DEFAULT 0 NOT NULL,
      created_at INTEGER DEFAULT (unixepoch()) NOT NULL,
      updated_at INTEGER DEFAULT (unixepoch()) NOT NULL
    )
  `);

  // Phase 13: Add new columns to users table (safe migration)
  await client.execute(`ALTER TABLE users ADD COLUMN role_id TEXT REFERENCES roles(id) ON DELETE SET NULL`).catch(() => {});
  await client.execute(`ALTER TABLE users ADD COLUMN avatar_url TEXT`).catch(() => {});

  // Phase 13: Create invites table
  // Guard: if table exists without the token column (broken migration), drop and recreate it
  try {
    await client.execute(`SELECT token FROM invites LIMIT 0`);
  } catch {
    await client.execute(`DROP TABLE IF EXISTS invites`);
  }

  await client.execute(`
    CREATE TABLE IF NOT EXISTS invites (
      id TEXT PRIMARY KEY,
      token TEXT NOT NULL UNIQUE,
      email TEXT,
      role TEXT DEFAULT 'editor' NOT NULL,
      used_at INTEGER,
      used_by TEXT REFERENCES users(id) ON DELETE SET NULL,
      created_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at INTEGER NOT NULL,
      created_at INTEGER DEFAULT (unixepoch()) NOT NULL
    )
  `);

  await client.execute(`
    CREATE INDEX IF NOT EXISTS idx_invites_token ON invites(token)
  `);

  // Phase 13: Create activity_logs table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      username TEXT NOT NULL,
      action TEXT NOT NULL,
      entity_type TEXT,
      entity_id TEXT,
      entity_name TEXT,
      details TEXT,
      ip_address TEXT,
      created_at INTEGER DEFAULT (unixepoch()) NOT NULL
    )
  `);

  await client.execute(`
    CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id)
  `);

  await client.execute(`
    CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at)
  `);

  await client.execute(`
    CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action)
  `);

  // Phase 13: Seed default system roles if they don't exist
  await seedDefaultRoles();

  // Phase 12: Create default home page if no homepage exists
  await createDefaultHomePage();
}

/**
 * Seed default system roles (admin, editor, viewer)
 */
async function seedDefaultRoles(): Promise<void> {
  const now = Math.floor(Date.now() / 1000);

  const defaultRoles = [
    {
      id: 'role_admin',
      name: 'Admin',
      description: 'Full access to all features',
      permissions: JSON.stringify({
        'pages.create': true, 'pages.read': true, 'pages.update': true, 'pages.delete': true,
        'media.create': true, 'media.read': true, 'media.delete': true,
        'templates.create': true, 'templates.read': true, 'templates.update': true, 'templates.delete': true,
        'settings.read': true, 'settings.update': true,
        'users.create': true, 'users.read': true, 'users.update': true, 'users.delete': true,
        'roles.create': true, 'roles.read': true, 'roles.update': true, 'roles.delete': true,
        'invites.create': true, 'invites.read': true, 'invites.delete': true,
        'logs.read': true,
      }),
      isSystem: 1,
    },
    {
      id: 'role_editor',
      name: 'Editor',
      description: 'Can manage pages and media',
      permissions: JSON.stringify({
        'pages.create': true, 'pages.read': true, 'pages.update': true, 'pages.delete': true,
        'media.create': true, 'media.read': true, 'media.delete': true,
        'templates.create': true, 'templates.read': true, 'templates.update': true, 'templates.delete': true,
        'settings.read': true,
      }),
      isSystem: 1,
    },
    {
      id: 'role_viewer',
      name: 'Viewer',
      description: 'Read-only access',
      permissions: JSON.stringify({
        'pages.read': true,
        'media.read': true,
        'templates.read': true,
        'settings.read': true,
      }),
      isSystem: 1,
    },
  ];

  for (const role of defaultRoles) {
    await client.execute({
      sql: `INSERT OR IGNORE INTO roles (id, name, description, permissions, is_system, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [role.id, role.name, role.description, role.permissions, role.isSystem, now, now],
    });
  }
}

/**
 * Create a default home page if no homepage exists yet.
 * Uses a system author placeholder — will be reassigned if a user exists.
 */
export async function createDefaultHomePage(): Promise<void> {
  // Check if a homepage already exists
  const existing = await client.execute(
    `SELECT id FROM pages WHERE is_homepage = 1 LIMIT 1`
  );
  if (existing.rows.length > 0) return;

  // Check if a page with slug "home" already exists — if so, just mark it as homepage
  const homeSlugPage = await client.execute(
    `SELECT id FROM pages WHERE slug = 'home' LIMIT 1`
  );
  if (homeSlugPage.rows.length > 0) {
    const pageId = homeSlugPage.rows[0]!.id as string;
    await client.execute({
      sql: `UPDATE pages SET is_homepage = 1, published = 1, updated_at = ? WHERE id = ?`,
      args: [Math.floor(Date.now() / 1000), pageId],
    });
    return;
  }

  // Find the first user to use as author
  const userResult = await client.execute(
    `SELECT id FROM users ORDER BY created_at ASC LIMIT 1`
  );
  if (userResult.rows.length === 0) {
    // No users yet — skip; the default home page will be created after first registration
    return;
  }

  const authorId = userResult.rows[0]!.id as string;
  const pageId = randomUUID();
  const now = Math.floor(Date.now() / 1000);

  // Default Craft.js content: a simple container with a heading and text
  const defaultContent = JSON.stringify({
    ROOT: {
      type: { resolvedName: 'Container' },
      isCanvas: true,
      props: {
        style: {
          desktop: {
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '80px 40px',
          },
        },
      },
      displayName: 'Container',
      custom: {},
      hidden: false,
      nodes: ['heading1', 'text1'],
      linkedNodes: {},
    },
    heading1: {
      type: { resolvedName: 'Heading' },
      isCanvas: false,
      props: {
        text: 'Welcome to PagePress',
        level: 'h1',
        style: {
          desktop: {
            textAlign: 'center',
            marginBottom: '24px',
            fontSize: '48px',
            fontWeight: '700',
          },
        },
      },
      displayName: 'Heading',
      custom: {},
      hidden: false,
      nodes: [],
      linkedNodes: {},
      parent: 'ROOT',
    },
    text1: {
      type: { resolvedName: 'Text' },
      isCanvas: false,
      props: {
        text: 'This is your homepage. Edit it in the page builder to add your own content.',
        style: {
          desktop: {
            textAlign: 'center',
            fontSize: '18px',
            color: '#64748b',
            lineHeight: '1.6',
          },
        },
      },
      displayName: 'Text',
      custom: {},
      hidden: false,
      nodes: [],
      linkedNodes: {},
      parent: 'ROOT',
    },
  });

  await client.execute({
    sql: `INSERT INTO pages (id, title, slug, content_json, published, is_homepage, type, author_id, created_at, updated_at) VALUES (?, ?, ?, ?, 1, 1, 'page', ?, ?, ?)`,
    args: [pageId, 'Home', 'home', defaultContent, authorId, now, now],
  });
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
