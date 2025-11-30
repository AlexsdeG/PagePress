// PagePress v0.0.3 - 2025-11-30
// Authentication routes

import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../lib/db.js';
import { users } from '../lib/schema.js';
import { hashPassword, verifyPassword } from '../lib/password.js';
import { createSession, deleteSession, extendSession } from '../lib/auth.js';
import { requireAuth, SESSION_COOKIE_NAME } from '../middleware/auth.js';
import { env } from '../lib/env.js';

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
  password: z.string(),
});

/**
 * Cookie options for session
 */
function getSessionCookieOptions(expiresAt: Date) {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    expires: expiresAt,
  };
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
    // Validate request body
    const parseResult = registerSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: 'Validation Error',
        message: 'Invalid registration data',
        details: parseResult.error.flatten().fieldErrors,
      });
    }
    
    const { username, email, password } = parseResult.data;
    
    // Check if username or email already exists
    const existingUser = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    
    if (existingUser.length > 0) {
      return reply.status(409).send({
        error: 'Conflict',
        message: 'Email already registered',
      });
    }
    
    const existingUsername = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, username))
      .limit(1);
    
    if (existingUsername.length > 0) {
      return reply.status(409).send({
        error: 'Conflict',
        message: 'Username already taken',
      });
    }
    
    // Check if this is the first user (will be admin)
    const userCount = await db.select({ id: users.id }).from(users).limit(1);
    const isFirstUser = userCount.length === 0;
    
    // Hash password and create user
    const passwordHash = await hashPassword(password);
    const userId = uuidv4();
    const now = new Date();
    
    await db.insert(users).values({
      id: userId,
      username,
      email,
      passwordHash,
      role: isFirstUser ? 'admin' : 'editor',
      createdAt: now,
      updatedAt: now,
    });
    
    // Create session
    const session = await createSession(userId);
    
    // Set session cookie
    reply.setCookie(SESSION_COOKIE_NAME, session.id, getSessionCookieOptions(session.expiresAt));
    
    return reply.status(201).send({
      message: 'Registration successful',
      user: {
        id: userId,
        username,
        email,
        role: isFirstUser ? 'admin' : 'editor',
      },
    });
  });
  
  /**
   * POST /auth/login
   * Authenticate user and create session
   */
  fastify.post('/login', async (request, reply) => {
    // Validate request body
    const parseResult = loginSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: 'Validation Error',
        message: 'Invalid login data',
        details: parseResult.error.flatten().fieldErrors,
      });
    }
    
    const { email, password } = parseResult.data;
    
    // Find user by email
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    
    const user = result[0];
    if (!user) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Invalid email or password',
      });
    }
    
    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Invalid email or password',
      });
    }
    
    // Create session
    const session = await createSession(user.id);
    
    // Set session cookie
    reply.setCookie(SESSION_COOKIE_NAME, session.id, getSessionCookieOptions(session.expiresAt));
    
    return reply.send({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
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
    
    return reply.send({
      message: 'Logout successful',
    });
  });
  
  /**
   * GET /auth/me
   * Get current authenticated user
   */
  fastify.get('/me', { preHandler: [requireAuth] }, async (request, reply) => {
    // User is attached by requireAuth middleware
    return reply.send({
      user: request.user,
    });
  });
  
  /**
   * POST /auth/refresh
   * Extend session expiration
   */
  fastify.post('/refresh', { preHandler: [requireAuth] }, async (request, reply) => {
    const sessionId = request.cookies[SESSION_COOKIE_NAME];
    
    if (!sessionId) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'No session found',
      });
    }
    
    const session = await extendSession(sessionId);
    
    if (!session) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Session not found',
      });
    }
    
    // Update cookie with new expiration
    reply.setCookie(SESSION_COOKIE_NAME, session.id, getSessionCookieOptions(session.expiresAt));
    
    return reply.send({
      message: 'Session refreshed',
      expiresAt: session.expiresAt,
    });
  });
}
