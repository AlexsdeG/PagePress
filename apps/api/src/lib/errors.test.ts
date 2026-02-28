import { describe, it, expect } from 'vitest';
import { AppError, formatZodError, notFound, unauthorized, forbidden, badRequest, conflict, tooManyRequests } from './errors.js';
import { z } from 'zod';

describe('AppError', () => {
  it('creates an error with status code and code', () => {
    const err = new AppError(404, 'NOT_FOUND', 'Page not found');
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe('NOT_FOUND');
    expect(err.message).toBe('Page not found');
    expect(err.name).toBe('AppError');
  });

  it('includes optional details', () => {
    const err = new AppError(400, 'BAD_REQUEST', 'Invalid', { field: 'name' });
    expect(err.details).toEqual({ field: 'name' });
  });
});

describe('formatZodError', () => {
  it('formats field errors into a readable string', () => {
    const schema = z.object({
      email: z.string().email(),
      name: z.string().min(2),
    });

    const result = schema.safeParse({ email: 'bad', name: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const formatted = formatZodError(result.error);
      expect(formatted).toContain('email');
      expect(formatted).toContain('name');
    }
  });

  it('returns "Invalid input" for non-field errors', () => {
    // Create a ZodError with no field errors
    const schema = z.string().min(5);
    const result = schema.safeParse('ab');
    expect(result.success).toBe(false);
    if (!result.success) {
      const formatted = formatZodError(result.error);
      expect(typeof formatted).toBe('string');
      expect(formatted.length).toBeGreaterThan(0);
    }
  });
});

describe('error factory functions', () => {
  it('notFound creates 404 error', () => {
    const err = notFound('Page missing');
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe('NOT_FOUND');
    expect(err.message).toBe('Page missing');
  });

  it('notFound uses default message', () => {
    const err = notFound();
    expect(err.message).toBe('Resource not found');
  });

  it('unauthorized creates 401 error', () => {
    const err = unauthorized();
    expect(err.statusCode).toBe(401);
    expect(err.code).toBe('UNAUTHORIZED');
  });

  it('forbidden creates 403 error', () => {
    const err = forbidden();
    expect(err.statusCode).toBe(403);
    expect(err.code).toBe('FORBIDDEN');
  });

  it('badRequest creates 400 error', () => {
    const err = badRequest('Missing field');
    expect(err.statusCode).toBe(400);
    expect(err.message).toBe('Missing field');
  });

  it('conflict creates 409 error', () => {
    const err = conflict('Already exists');
    expect(err.statusCode).toBe(409);
    expect(err.code).toBe('CONFLICT');
  });

  it('tooManyRequests creates 429 error', () => {
    const err = tooManyRequests();
    expect(err.statusCode).toBe(429);
    expect(err.code).toBe('TOO_MANY_REQUESTS');
  });
});
