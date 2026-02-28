// PagePress v0.0.14 - 2026-02-28
// Authentication routes — hardened with lockout, password policy, consistent responses

import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { db } from '../lib/db.js';
import { users } from '../lib/schema.js';
import { hashPassword, verifyPassword, validatePasswordStrength } from '../lib/password.js';
import { createSession, deleteSession, refreshSession } from '../lib/auth.js';
import { requireAuth, SESSION_COOKIE_NAME } from '../middleware/auth.js';
import { env } from '../lib/env.js';
import { badRequest, conflict, unauthorized, tooManyRequests } from '../lib/errors.js';

/**
 * Registration request schema
 */
const registerSchema = z.object({
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
});

/**
 * Login request schema
 */
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

/**
 * Cookie options for session
 */
function getSessionCookieOptions(expiresAt: Date) {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
    expires: expiresAt,
    ...(env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {}),
  };
}

/**
 * Check if account is locked and return remaining lockout seconds
 */
function getAccountLockStatus(lockedAt: Date | null, failedAttempts: number): { locked: boolean; remainingSeconds: number } {
  if (failedAttempts < env.MAX_FAILED_LOGINS || !lockedAt) {
    return { locked: false, remainingSeconds: 0 };
  }

  const lockExpiry = lockedAt.getTime() + env.LOCKOUT_DURATION_SECONDS * 1000;
  const now = Date.now();

  if (now >= lockExpiry) {
    return { locked: false, remainingSeconds: 0 };
  }

  return { locked: true, remainingSeconds: Math.ceil((lockExpiry - now) / 1000) };
}

/**
 * Register authentication routes
 */
export async function authRoutes(fastify: FastifyInstance): Promise<void> {
  /**
   * POST /auth/register
   * Create a new user account
   */
  fastify.post('/register', async (request, reply) => {
    const parsed = registerSchema.parse(request.body);
    const { username, email, password } = parsed;

    // Validate password strength beyond Zod min length
    const strength = validatePasswordStrength(password);
    if (!strength.valid) {
      throw badRequest('Password does not meet requirements', { password: strength.errors });
    }

    // Check if email already exists
    const existingEmail = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingEmail.length > 0) {
      throw conflict('Email already registered');
    }

    // Check if username already exists
    const existingUsername = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (existingUsername.length > 0) {
      throw conflict('Username already taken');
    }

    // Check if this is the first user (will be admin)
    const userCount = await db.select({ id: users.id }).from(users).limit(1);
    const isFirstUser = userCount.length === 0;

    // Hash password and create user
    const passwordHash = await hashPassword(password);
    const userId = randomUUID();
    const now = new Date();
    const role = isFirstUser ? 'admin' : 'editor';

    await db.insert(users).values({
      id: userId,
      username,
      email,
      passwordHash,
      role,
      createdAt: now,
      updatedAt: now,
    });

    // Create session with metadata
    const session = await createSession({
      userId,
      userAgent: request.headers['user-agent'],
      ipAddress: request.ip,
    });

    reply.setCookie(SESSION_COOKIE_NAME, session.id, getSessionCookieOptions(session.expiresAt));

    return reply.status(201).send({
      success: true,
      data: {
        user: { id: userId, username, email, role },
      },
    });
  });

  /**
   * POST /auth/login
   * Authenticate user and create session
   */
  fastify.post('/login', async (request, reply) => {
    const parsed = loginSchema.parse(request.body);
    const { email, password } = parsed;

    // Find user by email
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    const user = result[0];

    // Use constant-time-like response for missing users (don't reveal existence)
    if (!user) {
      throw unauthorized('Invalid email or password');
    }

    // Check account lockout
    const lockStatus = getAccountLockStatus(
      user.lockedAt ? new Date(user.lockedAt) : null,
      user.failedLoginAttempts ?? 0,
    );

    if (lockStatus.locked) {
      throw tooManyRequests(
        `Account temporarily locked. Try again in ${lockStatus.remainingSeconds} seconds.`,
      );
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);

    if (!isValid) {
      // Increment failed login attempts
      const newCount = (user.failedLoginAttempts ?? 0) + 1;
      const updates: Record<string, unknown> = {
        failedLoginAttempts: newCount,
        updatedAt: new Date(),
      };

      // Lock account if threshold reached
      if (newCount >= env.MAX_FAILED_LOGINS) {
        updates.lockedAt = new Date();
        request.log.warn({ email, attempts: newCount }, 'Account locked due to failed logins');
      }

      await db.update(users).set(updates).where(eq(users.id, user.id));

      throw unauthorized('Invalid email or password');
    }

    // Reset failed login attempts on successful login
    if ((user.failedLoginAttempts ?? 0) > 0 || user.lockedAt) {
      await db
        .update(users)
        .set({ failedLoginAttempts: 0, lockedAt: null, updatedAt: new Date() })
        .where(eq(users.id, user.id));
    }

    // Create session with metadata
    const session = await createSession({
      userId: user.id,
      userAgent: request.headers['user-agent'],
      ipAddress: request.ip,
    });

    reply.setCookie(SESSION_COOKIE_NAME, session.id, getSessionCookieOptions(session.expiresAt));

    return reply.send({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      },
    });
  });

  /**
   * POST /auth/logout
   * Destroy session and clear cookie
   */
  fastify.post('/logout', { preHandler: [requireAuth] }, async (request, reply) => {
    const sessionId = request.cookies[SESSION_COOKIE_NAME];

    if (sessionId) {
      await deleteSession(sessionId);
    }

    reply.clearCookie(SESSION_COOKIE_NAME, { path: '/' });

    return reply.send({ success: true, data: { message: 'Logged out' } });
  });

  /**
   * GET /auth/me
   * Get current authenticated user
   */
  fastify.get('/me', { preHandler: [requireAuth] }, async (request, reply) => {
    return reply.send({
      success: true,
      data: { user: request.user },
    });
  });

  /**
   * POST /auth/refresh
   * Extend session expiration (sliding window)
   */
  fastify.post('/refresh', { preHandler: [requireAuth] }, async (request, reply) => {
    const sessionId = request.cookies[SESSION_COOKIE_NAME];

    if (!sessionId) {
      throw unauthorized('No session found');
    }

    const session = await refreshSession(sessionId);

    if (!session) {
      throw unauthorized('Session expired');
    }

    reply.setCookie(SESSION_COOKIE_NAME, session.id, getSessionCookieOptions(session.expiresAt));

    return reply.send({
      success: true,
      data: { expiresAt: session.expiresAt },
    });
  });
}
