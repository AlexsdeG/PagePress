// PagePress v0.0.18 - 2026-03-01
// Activity logging utility

import { randomUUID } from 'crypto';
import { db } from './db.js';
import { activityLogs } from './schema.js';

interface LogActivityOptions {
  userId: string | null;
  username: string;
  action: string;
  entityType?: string;
  entityId?: string;
  entityName?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
}

/**
 * Log a user activity to the database.
 * Non-blocking — errors are silently caught so logging never disrupts the request.
 */
export async function logActivity(options: LogActivityOptions): Promise<void> {
  try {
    await db.insert(activityLogs).values({
      id: randomUUID(),
      userId: options.userId,
      username: options.username,
      action: options.action,
      entityType: options.entityType ?? null,
      entityId: options.entityId ?? null,
      entityName: options.entityName ?? null,
      details: options.details ?? null,
      ipAddress: options.ipAddress ?? null,
      createdAt: new Date(),
    });
  } catch {
    // Silently fail — activity logging should never break the request
  }
}
