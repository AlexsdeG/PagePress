// PagePress v0.0.3 - 2025-11-30
// Authentication session management utilities

import { v4 as uuidv4 } from 'uuid';
import { eq, and, gt, lt } from 'drizzle-orm';
import { db } from './db.js';
import { sessions, users } from './schema.js';

/**
 * Session duration in milliseconds (7 days)
 */
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Session data returned to clients
 */
export interface SessionData {
  id: string;
  userId: string;
  expiresAt: Date;
}

/**
 * User data returned with session (without password)
 */
export interface SessionUser {
  id: string;
  username: string;
  email: string;
  role: string;
  createdAt: Date;
}

/**
 * Create a new session for a user
 * @param userId - User ID to create session for
 * @returns Session data
 */
export async function createSession(userId: string): Promise<SessionData> {
  const sessionId = uuidv4();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  
  await db.insert(sessions).values({
    id: sessionId,
    userId,
    expiresAt,
    createdAt: new Date(),
  });
  
  return {
    id: sessionId,
    userId,
    expiresAt,
  };
}

/**
 * Get a valid session by ID (checks expiration)
 * @param sessionId - Session ID to lookup
 * @returns Session data or null if not found/expired
 */
export async function getSession(sessionId: string): Promise<SessionData | null> {
  const result = await db
    .select()
    .from(sessions)
    .where(
      and(
        eq(sessions.id, sessionId),
        gt(sessions.expiresAt, new Date())
      )
    )
    .limit(1);
  
  const session = result[0];
  if (!session) {
    return null;
  }
  
  return {
    id: session.id,
    userId: session.userId,
    expiresAt: session.expiresAt,
  };
}

/**
 * Get session with associated user data
 * @param sessionId - Session ID to lookup
 * @returns User data or null if session not found/expired
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
 * Delete a session (logout)
 * @param sessionId - Session ID to delete
 */
export async function deleteSession(sessionId: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.id, sessionId));
}

/**
 * Delete all sessions for a user (logout everywhere)
 * @param userId - User ID to delete all sessions for
 */
export async function deleteAllUserSessions(userId: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.userId, userId));
}

/**
 * Clean up expired sessions
 * Should be called periodically (e.g., on a cron job)
 */
export async function cleanupExpiredSessions(): Promise<number> {
  const result = await db
    .delete(sessions)
    .where(lt(sessions.expiresAt, new Date()));
  
  return result.rowsAffected ?? 0;
}

/**
 * Extend a session's expiration time
 * @param sessionId - Session ID to extend
 * @returns Updated session data or null if not found
 */
export async function extendSession(sessionId: string): Promise<SessionData | null> {
  const session = await getSession(sessionId);
  if (!session) {
    return null;
  }
  
  const newExpiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  
  await db
    .update(sessions)
    .set({ expiresAt: newExpiresAt })
    .where(eq(sessions.id, sessionId));
  
  return {
    ...session,
    expiresAt: newExpiresAt,
  };
}
