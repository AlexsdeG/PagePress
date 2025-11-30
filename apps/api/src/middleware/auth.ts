// PagePress v0.0.3 - 2025-11-30
// Authentication middleware for protected routes

import type { FastifyRequest, FastifyReply, preHandlerHookHandler } from 'fastify';
import { getSessionUser, type SessionUser } from '../lib/auth.js';

/**
 * Cookie name for session ID
 */
export const SESSION_COOKIE_NAME = 'pagepress_session';

/**
 * Extend FastifyRequest to include user data
 */
declare module 'fastify' {
  interface FastifyRequest {
    user?: SessionUser;
  }
}

/**
 * Authentication middleware that requires a valid session
 * Attaches user data to request.user if authenticated
 */
export const requireAuth: preHandlerHookHandler = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const sessionId = request.cookies[SESSION_COOKIE_NAME];
  
  // Debug: log incoming cookies
  request.log.info({ 
    cookieHeader: request.headers.cookie,
    parsedCookies: Object.keys(request.cookies),
    hasSessionCookie: !!sessionId,
  }, 'Auth middleware - checking cookies');
  
  if (!sessionId) {
    return reply.status(401).send({
      error: 'Unauthorized',
      message: 'Authentication required',
    });
  }
  
  const user = await getSessionUser(sessionId);
  
  if (!user) {
    // Clear invalid/expired session cookie
    reply.clearCookie(SESSION_COOKIE_NAME);
    return reply.status(401).send({
      error: 'Unauthorized',
      message: 'Session expired or invalid',
    });
  }
  
  // Attach user to request for use in route handlers
  request.user = user;
};

/**
 * Authentication middleware that requires admin role
 * Must be used after requireAuth
 */
export const requireAdmin: preHandlerHookHandler = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  // First check if user is authenticated
  if (!request.user) {
    return reply.status(401).send({
      error: 'Unauthorized',
      message: 'Authentication required',
    });
  }
  
  // Then check if user is admin
  if (request.user.role !== 'admin') {
    return reply.status(403).send({
      error: 'Forbidden',
      message: 'Admin access required',
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
    }
  }
};
