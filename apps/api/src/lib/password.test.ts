import { describe, it, expect } from 'vitest';
import { validatePasswordStrength } from './password.js';

describe('validatePasswordStrength', () => {
  it('rejects passwords shorter than 8 characters', () => {
    const result = validatePasswordStrength('Ab1cdef');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Password must be at least 8 characters');
  });

  it('rejects passwords without uppercase letters', () => {
    const result = validatePasswordStrength('abcdefgh1');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Password must contain at least one uppercase letter');
  });

  it('rejects passwords without lowercase letters', () => {
    const result = validatePasswordStrength('ABCDEFGH1');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Password must contain at least one lowercase letter');
  });

  it('rejects passwords without numbers', () => {
    const result = validatePasswordStrength('Abcdefghi');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Password must contain at least one number');
  });

  it('accepts a valid strong password', () => {
    const result = validatePasswordStrength('StrongPass1');
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('reports multiple errors at once', () => {
    const result = validatePasswordStrength('abc');
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(1);
  });
});
