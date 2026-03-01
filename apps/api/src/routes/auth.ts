// PagePress v0.0.18 - 2026-03-01
// Authentication routes — hardened with lockout, password policy, consistent responses

import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { eq, or } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { db } from '../lib/db.js';
import { createDefaultHomePage } from '../lib/db.js';
import { users, invites, siteSettings } from '../lib/schema.js';
import { hashPassword, verifyPassword, validatePasswordStrength } from '../lib/password.js';
import { createSession, deleteSession, refreshSession } from '../lib/auth.js';
import { requireAuth, SESSION_COOKIE_NAME } from '../middleware/auth.js';
import { env } from '../lib/env.js';
import { badRequest, conflict, unauthorized, tooManyRequests, forbidden } from '../lib/errors.js';
import { logActivity } from '../lib/activity-log.js';

/**
 * Registration request schema
 */
const registerSchema = z.object({
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  inviteToken: z.string().optional(),
  siteName: z.string().min(1).max(100).optional(),
});

/**
 * Login request schema — accepts email or username
 */
const loginSchema = z.object({
  identifier: z.string().min(1),
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
    const { username, email, password, inviteToken, siteName } = parsed;

    // Validate password strength beyond Zod min length
    const strength = validatePasswordStrength(password);
    if (!strength.valid) {
      throw badRequest('Password does not meet requirements', { password: strength.errors });
    }

    // Check if this is the first user (will be admin)
    const userCount = await db.select({ id: users.id }).from(users).limit(1);
    const isFirstUser = userCount.length === 0;

    // After first-time setup, registration requires an invite token
    if (!isFirstUser && !inviteToken) {
      throw forbidden('Registration is closed. An invite link is required to create an account.');
    }

    // Validate invite token if provided
    let inviteRole: 'admin' | 'editor' | 'viewer' = 'editor';
    let inviteRecord: typeof invites.$inferSelect | null = null;
    if (inviteToken) {
      const invResult = await db.select().from(invites).where(eq(invites.token, inviteToken)).limit(1);
      if (invResult.length === 0) throw badRequest('Invalid invite token');
      inviteRecord = invResult[0]!;
      if (inviteRecord.usedAt) throw badRequest('This invite has already been used');
      if (inviteRecord.expiresAt <= new Date()) throw badRequest('This invite has expired');
      if (inviteRecord.email && inviteRecord.email !== email) {
        throw badRequest('This invite is for a different email address');
      }
      inviteRole = inviteRecord.role as 'admin' | 'editor' | 'viewer';
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

    // Hash password and create user
    const passwordHash = await hashPassword(password);
    const userId = randomUUID();
    const now = new Date();
    const role = isFirstUser ? 'admin' : inviteRole;

    await db.insert(users).values({
      id: userId,
      username,
      email,
      passwordHash,
      role,
      createdAt: now,
      updatedAt: now,
    });

    // Mark invite as used
    if (inviteRecord) {
      await db.update(invites).set({
        usedAt: now,
        usedBy: userId,
      }).where(eq(invites.id, inviteRecord.id));
    }

    // First-time setup: set site name and mark setup as complete
    if (isFirstUser) {
      await createDefaultHomePage();
      if (siteName) {
        await db.insert(siteSettings).values({
          key: 'siteTitle',
          value: JSON.stringify(siteName),
          updatedAt: now,
        }).onConflictDoUpdate({
          target: siteSettings.key,
          set: { value: JSON.stringify(siteName), updatedAt: now },
        });
      }
      await db.insert(siteSettings).values({
        key: 'setupComplete',
        value: JSON.stringify(true),
        updatedAt: now,
      }).onConflictDoUpdate({
        target: siteSettings.key,
        set: { value: JSON.stringify(true), updatedAt: now },
      });
    }

    // Create session with metadata
    const session = await createSession({
      userId,
      userAgent: request.headers['user-agent'],
      ipAddress: request.ip,
    });

    reply.setCookie(SESSION_COOKIE_NAME, session.id, getSessionCookieOptions(session.expiresAt));

    await logActivity({
      userId,
      username,
      action: isFirstUser ? 'setup.complete' : 'user.register',
      entityType: 'user',
      entityId: userId,
      entityName: username,
      ipAddress: request.ip,
    });

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
    const { identifier, password } = parsed;

    // Find user by email or username
    const result = await db
      .select()
      .from(users)
      .where(
        or(
          eq(users.email, identifier),
          eq(users.username, identifier),
        )
      )
      .limit(1);

    const user = result[0];

    // Use constant-time-like response for missing users (don't reveal existence)
    if (!user) {
      throw unauthorized('Invalid credentials');
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
        request.log.warn({ identifier, attempts: newCount }, 'Account locked due to failed logins');
      }

      await db.update(users).set(updates).where(eq(users.id, user.id));

      throw unauthorized('Invalid credentials');
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

    await logActivity({
      userId: user.id,
      username: user.username,
      action: 'user.login',
      entityType: 'user',
      entityId: user.id,
      entityName: user.username,
      ipAddress: request.ip,
    });

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

    await logActivity({
      userId: request.user!.id,
      username: request.user!.username,
      action: 'user.logout',
      entityType: 'user',
      entityId: request.user!.id,
      entityName: request.user!.username,
      ipAddress: request.ip,
    });

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

  /**
   * GET /auth/setup-status
   * Check if first-time setup has been completed (public)
   */
  fastify.get('/setup-status', async (_request, reply) => {
    const userCount = await db.select({ id: users.id }).from(users).limit(1);
    const isSetupComplete = userCount.length > 0;

    return reply.send({
      success: true,
      data: { setupComplete: isSetupComplete },
    });
  });

  /**
   * PUT /auth/profile
   * Update current user's profile (username, email, password)
   */
  fastify.put('/profile', { preHandler: [requireAuth] }, async (request, reply) => {
    const profileSchema = z.object({
      username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_-]+$/).optional(),
      email: z.string().email().max(255).optional(),
      currentPassword: z.string().min(1).optional(),
      newPassword: z.string().min(8).max(128).optional(),
    });

    const parsed = profileSchema.parse(request.body);
    const userId = request.user!.id;

    const current = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (current.length === 0) throw unauthorized('User not found');

    // Require current password for email or password changes
    if ((parsed.email || parsed.newPassword) && !parsed.currentPassword) {
      throw badRequest('Current password is required to change email or password');
    }

    if (parsed.currentPassword) {
      const valid = await verifyPassword(parsed.currentPassword, current[0]!.passwordHash);
      if (!valid) throw unauthorized('Current password is incorrect');
    }

    const updates: Record<string, unknown> = { updatedAt: new Date() };

    if (parsed.username && parsed.username !== current[0]!.username) {
      const dup = await db.select({ id: users.id }).from(users).where(eq(users.username, parsed.username)).limit(1);
      if (dup.length > 0) throw conflict('Username already taken');
      updates.username = parsed.username;
    }

    if (parsed.email && parsed.email !== current[0]!.email) {
      const dup = await db.select({ id: users.id }).from(users).where(eq(users.email, parsed.email)).limit(1);
      if (dup.length > 0) throw conflict('Email already registered');
      updates.email = parsed.email;
    }

    if (parsed.newPassword) {
      const strength = validatePasswordStrength(parsed.newPassword);
      if (!strength.valid) {
        throw badRequest('Password does not meet requirements', { password: strength.errors });
      }
      updates.passwordHash = await hashPassword(parsed.newPassword);
    }

    await db.update(users).set(updates).where(eq(users.id, userId));

    const changedFields = Object.keys(updates).filter((k) => k !== 'updatedAt');

    await logActivity({
      userId,
      username: request.user!.username,
      action: 'profile.update',
      entityType: 'user',
      entityId: userId,
      entityName: request.user!.username,
      details: { fields: changedFields },
      ipAddress: request.ip,
    });

    // Return updated user
    const updated = await db
      .select({
        id: users.id, username: users.username, email: users.email,
        role: users.role, createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return reply.send({ success: true, data: { user: updated[0] } });
  });
}
