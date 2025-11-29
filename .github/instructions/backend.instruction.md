# Backend Architecture & Instructions

## Database Schema (Drizzle/SQLite)
We need a structure that mimics a CMS.

```typescript
// db/schema.ts
import { sqliteTable, text, integer, blob } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(), // UUID
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').default('editor'), // 'admin' | 'editor'
  createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
});

export const pages = sqliteTable('pages', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(), // e.g., 'about-us'
  content: text('content', { mode: 'json' }), // The Craft.js JSON tree
  type: text('type').default('page'), // 'page', 'template_header', 'template_footer'
  status: text('status').default('draft'), // 'published', 'draft'
  seoTitle: text('seo_title'),
  seoDesc: text('seo_desc'),
});

export const options = sqliteTable('options', {
  key: text('key').primaryKey(),
  value: text('value', { mode: 'json' }), // Stores global settings, global CSS/JS
});
```

## API Structure (Fastify)
Use a Controller-Service pattern.
1.  **Routes:** Define endpoints.
2.  **Schema:** Define Zod schemas for Request/Response.
3.  **Handler:** Call the service.

**Extensibility (Hooks system):**
To allow "Plugins" to modify data (like WordPress filters), create a simple Hook system.

```typescript
// lib/hooks.ts
type HookCallback = (data: any) => any | Promise<any>;
const hooks = new Map<string, HookCallback[]>();

export const addFilter = (hookName: string, callback: HookCallback) => {
    if (!hooks.has(hookName)) hooks.set(hookName, []);
    hooks.get(hookName)?.push(callback);
};

export const applyFilters = async (hookName: string, data: any) => {
    const callbacks = hooks.get(hookName) || [];
    let result = data;
    for (const cb of callbacks) {
        result = await cb(result);
    }
    return result;
};

// Usage in Route:
// const pageData = await db.select()...
// const finalData = await applyFilters('get_page_data', pageData);
```

## Security
- Use **Helmet** with a specific Content Security Policy (CSP) that allows the Builder iframe to communicate with the Parent window.
- **JWT** should be handled via HTTP-Only cookies.