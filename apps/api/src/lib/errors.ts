// PagePress v0.0.14 - 2026-02-28
// Centralized error handling utilities

import type { FastifyReply } from 'fastify';
import { z } from 'zod';

/**
 * Application error with status code and machine-readable code
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Format a Zod error into a human-readable string
 */
export function formatZodError(error: z.ZodError): string {
  const flattened = error.flatten();
  const fieldErrors = flattened.fieldErrors as Record<string, string[] | undefined>;
  const messages: string[] = [];

  for (const [field, errors] of Object.entries(fieldErrors)) {
    if (errors && errors.length > 0) {
      messages.push(`${field}: ${errors.join(', ')}`);
    }
  }

  return messages.length > 0
    ? messages.join('; ')
    : 'Invalid input';
}

/**
 * Centralized route error handler
 * Formats ZodError, AppError, and unknown errors into consistent { success, error } shape
 */
export function handleRouteError(error: unknown, reply: FastifyReply): void {
  if (error instanceof z.ZodError) {
    reply.status(400).send({
      success: false,
      error: formatZodError(error),
      details: error.flatten().fieldErrors,
    });
    return;
  }

  if (error instanceof AppError) {
    reply.status(error.statusCode).send({
      success: false,
      error: error.message,
      ...(error.details ? { details: error.details } : {}),
    });
    return;
  }

  // Log unexpected errors but don't expose internals
  reply.log.error(error, 'Unhandled route error');
  reply.status(500).send({
    success: false,
    error: 'Internal server error',
  });
}

// ─── Error factory functions ────────────────────────────────────────

export function notFound(message = 'Resource not found'): AppError {
  return new AppError(404, 'NOT_FOUND', message);
}

export function unauthorized(message = 'Authentication required'): AppError {
  return new AppError(401, 'UNAUTHORIZED', message);
}

export function forbidden(message = 'Insufficient permissions'): AppError {
  return new AppError(403, 'FORBIDDEN', message);
}

export function badRequest(message: string, details?: unknown): AppError {
  return new AppError(400, 'BAD_REQUEST', message, details);
}

export function conflict(message: string): AppError {
  return new AppError(409, 'CONFLICT', message);
}

export function tooManyRequests(message = 'Too many requests'): AppError {
  return new AppError(429, 'TOO_MANY_REQUESTS', message);
}
