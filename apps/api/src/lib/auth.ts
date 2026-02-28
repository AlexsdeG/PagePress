// PagePress v0.0.14 - 2026-02-28
// Authentication session management utilities

import { randomUUID } from 'crypto';
import { eq, lt } from 'drizzle-orm';
import { db } from './db.js';
import { sessions, users } from './schema.js';
import { env } from './env.js';

/**
 * Session data returned to clients
 */
export interface SessionData {
  id: string;
  userId: string;
  expiresAt: Date;
}

/**
 * Safe user data returned with session (never includes passwordHash)
 */
export interface SessionUser {
  id: string;
  username: string;
  email: string;
  role: string;
  createdAt: Date;
}

/**
 * Options for creating a session
 */
interface CreateSessionOptions {
  userId: string;
  userAgent?: string;
  ipAddress?: string;
}

/**
 * Get session max age in milliseconds from env config
 */
function getSessionMaxAgeMs(): number {
  return env.SESSION_MAX_AGE_SECONDS * 1000;
}

/**
 * Create a new session for a user
 * Uses crypto.randomUUID() for cryptographically secure token generation
 */
export async function createSession(options: CreateSessionOptions): Promise<SessionData> {
  const sessionId = randomUUID();
  const expiresAt = new Date(Date.now() + getSessionMaxAgeMs());

  await db.insert(sessions).values({
    id: sessionId,
    userId: options.userId,
    userAgent: options.userAgent ?? null,
    ipAddress: options.ipAddress ?? null,
    expiresAt,
    createdAt: new Date(),
  });

  return {
    id: sessionId,
    userId: options.userId,
    expiresAt,
  };
}

/**
 * Get a valid session by ID (checks expiration)
 * If expired, deletes the session and returns null
 */
export async function getSession(sessionId: string): Promise<SessionData | null> {
  const result = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, sessionId))
    .limit(1);

  const session = result[0];
  if (!session) {
    return null;
  }

  // Check if expired
  if (session.expiresAt <= new Date()) {
    await db.delete(sessions).where(eq(sessions.id, sessionId));
    return null;
  }

  return {
    id: session.id,
    userId: session.userId,
    expiresAt: session.expiresAt,
  };
}

/**
 * Get session with associated user data (safe — no password hash)
 */
export async function getSessionUser(sessionId: string): Promise<SessionUser | null> {
  const session = await getSession(sessionId);
  if (!session) {
    return null;
  }

  const result = await db
    .select({
      id: users.id,
      username: users.username,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  const user = result[0];
  if (!user) {
    return null;
  }

  return user;
}

/**
 * Refresh a session's expiration (sliding window)
 * Extends session by the configured max age from now
 */
export async function refreshSession(sessionId: string): Promise<SessionData | null> {
  const session = await getSession(sessionId);
  if (!session) {
    return null;
  }

  const newExpiresAt = new Date(Date.now() + getSessionMaxAgeMs());

  await db
    .update(sessions)
    .set({ expiresAt: newExpiresAt })
    .where(eq(sessions.id, sessionId));

  return {
    ...session,
    expiresAt: newExpiresAt,
  };
}

/**
 * Delete a session (logout)
 */
export async function deleteSession(sessionId: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.id, sessionId));
}

/**
 * Delete all sessions for a user (logout everywhere)
 */
export async function deleteAllUserSessions(userId: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.userId, userId));
}

/**
 * Clean up expired sessions
 * Should be called periodically via cron
 */
export async function cleanupExpiredSessions(): Promise<number> {
  const result = await db
    .delete(sessions)
    .where(lt(sessions.expiresAt, new Date()));

  return result.rowsAffected ?? 0;
}

// Keep old extendSession as alias for backwards compat
export const extendSession = refreshSession;
