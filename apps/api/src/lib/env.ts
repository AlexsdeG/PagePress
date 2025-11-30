// PagePress v0.0.3 - 2025-11-30

import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * Generate a random string for secrets (used as defaults in development)
 */
function generateSecret(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Environment variables schema
 */
const envSchema = z.object({
  DATABASE_URL: z.string().default('./data/pagepress.db'),
  PORT: z.coerce.number().int().positive().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  AUTH_SECRET: z.string().min(16).default(generateSecret()),
  COOKIE_SECRET: z.string().min(16).default(generateSecret()),
});

/**
 * Parsed environment type
 */
export type Env = z.infer<typeof envSchema>;

/**
 * Validate and parse environment variables
 */
function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);
  
  if (!result.success) {
    console.error('❌ Invalid environment variables:');
    console.error(result.error.format());
    process.exit(1);
  }
  
  return result.data;
}

/**
 * Validated environment variables
 */
export const env: Env = validateEnv();
