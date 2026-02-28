// PagePress v0.0.14 - 2026-02-28
// Authentication middleware for protected routes

import type { FastifyRequest, FastifyReply, preHandlerHookHandler } from 'fastify';
import { getSessionUser, refreshSession, type SessionUser } from '../lib/auth.js';

/**
 * Cookie name for session ID
 */
export const SESSION_COOKIE_NAME = 'pagepress_session';

/**
 * Extend FastifyRequest to include user data and session ID
 */
declare module 'fastify' {
  interface FastifyRequest {
    user?: SessionUser;
    sessionId?: string;
  }
}

/**
 * Authentication middleware that requires a valid session.
 * On valid session: refreshes sliding window expiry, attaches SafeUser to request.
 */
export const requireAuth: preHandlerHookHandler = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const sessionId = request.cookies[SESSION_COOKIE_NAME];

  if (!sessionId) {
    return reply.status(401).send({
      success: false,
      error: 'Authentication required',
    });
  }

  const user = await getSessionUser(sessionId);

  if (!user) {
    // Clear invalid/expired session cookie
    reply.clearCookie(SESSION_COOKIE_NAME, { path: '/' });
    return reply.status(401).send({
      success: false,
      error: 'Session expired or invalid',
    });
  }

  // Sliding window: refresh session expiry on each authenticated request
  await refreshSession(sessionId);

  // Attach safe user data (never password hash) to request
  request.user = user;
  request.sessionId = sessionId;
};

/**
 * Authentication middleware that requires admin role
 * Must be used after requireAuth
 */
export const requireAdmin: preHandlerHookHandler = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  if (!request.user) {
    return reply.status(401).send({
      success: false,
      error: 'Authentication required',
    });
  }

  if (request.user.role !== 'admin') {
    return reply.status(403).send({
      success: false,
      error: 'Admin access required',
    });
  }
};

/**
 * Optional authentication middleware
 * Attaches user if session exists, but doesn't require it
 */
export const optionalAuth: preHandlerHookHandler = async (
  request: FastifyRequest,
  _reply: FastifyReply
) => {
  const sessionId = request.cookies[SESSION_COOKIE_NAME];

  if (sessionId) {
    const user = await getSessionUser(sessionId);
    if (user) {
      request.user = user;
      request.sessionId = sessionId;
    }
  }
};
