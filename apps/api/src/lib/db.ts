// PagePress v0.0.2 - 2025-11-30

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
 * Initialize database tables
 */
export async function initializeDatabase(): Promise<void> {
  // Create users table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'editor' NOT NULL,
      created_at INTEGER DEFAULT (unixepoch()) NOT NULL
    )
  `);

  // Create site_settings table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT,
      updated_at INTEGER DEFAULT (unixepoch()) NOT NULL
    )
  `);
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
