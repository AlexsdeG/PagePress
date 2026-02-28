// PagePress v0.0.14 - 2026-02-28
// Password hashing and validation utilities

import bcrypt from 'bcryptjs';

/**
 * Number of salt rounds for bcrypt
 * 12 is a good balance between security and performance
 */
const SALT_ROUNDS = 12;

/**
 * Password strength validation result
 */
export interface PasswordStrengthResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate password strength
 * Requires: min 8 chars, at least 1 uppercase, 1 lowercase, 1 number
 */
export function validatePasswordStrength(password: string): PasswordStrengthResult {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Hash a plain text password
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(password, salt);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
