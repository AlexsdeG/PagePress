// PagePress v0.0.2 - 2025-11-30

import { createClient, type Client } from '@libsql/client';
import { drizzle, type LibSQLDatabase } from 'drizzle-orm/libsql';
import * as schema from './schema.js';

export * from './schema.js';

/**
 * Database instance type with schema
 */
export type DatabaseInstance = LibSQLDatabase<typeof schema>;

/**
 * Create a database connection
 * @param dbPath - Path to the SQLite database file
 * @returns Drizzle database instance and client
 */
export function createDatabase(dbPath: string): { db: DatabaseInstance; client: Client } {
  const client = createClient({
    url: `file:${dbPath}`,
  });
  
  const db = drizzle(client, { schema });
  
  return { db, client };
}

/**
 * Close the database connection
 * @param client - The libsql client instance
 */
export function closeDatabase(client: Client): void {
  client.close();
}
