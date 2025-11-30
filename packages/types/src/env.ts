// PagePress v0.0.2 - 2025-11-30

import { z } from 'zod';

/**
 * Environment variables schema for the API server
 */
export const envSchema = z.object({
  DATABASE_URL: z.string().default('./data/pagepress.db'),
  PORT: z.coerce.number().int().positive().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

/**
 * Parsed and validated environment type
 */
export type Env = z.infer<typeof envSchema>;

/**
 * Parse and validate environment variables
 * @throws {ZodError} If validation fails
 */
export const parseEnv = (env: NodeJS.ProcessEnv): Env => {
  return envSchema.parse(env);
};
