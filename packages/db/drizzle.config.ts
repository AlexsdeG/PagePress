// PagePress v0.0.2 - 2025-11-30

import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: 'file:../../data/pagepress.db',
  },
});
