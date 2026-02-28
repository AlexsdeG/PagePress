---
applyTo: "apps/api/**"
---

# Backend Instructions — Fastify API (`apps/api`)

## Architecture

The API is a **Fastify 5** server using ESM (`"type": "module"`) with TypeScript strict mode.

### File Layout
```
apps/api/src/
├── index.ts            # Server bootstrap, plugin & route registration
├── lib/
│   ├── db.ts           # Drizzle client initialization (libSQL)
│   ├── env.ts          # Zod-validated environment variables
│   ├── auth.ts         # Session creation/validation helpers
│   ├── password.ts     # bcrypt hash/verify
│   └── slug.ts         # URL slug generation
├── middleware/
│   └── auth.ts         # Session authentication preHandler
└── routes/
    ├── auth.ts         # /auth — login, register, logout, me
    ├── pages.ts        # /pages — CRUD, pagination, filtering
    ├── media.ts        # /media — upload, list, delete
    ├── settings.ts     # /settings — GET/PUT site settings
    ├── theme.ts        # /theme — global theme settings
    └── health.ts       # /health — readiness, liveness
```

### Route Pattern
Every route file exports a Fastify plugin function. Example:

```typescript
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

const createPageSchema = z.object({
  title: z.string().min(1),
  slug: z.string().optional(),
  status: z.enum(['draft', 'published']).default('draft'),
});

export async function pagesRoutes(server: FastifyInstance): Promise<void> {
  // Apply auth middleware to all routes in this plugin
  server.addHook('onRequest', server.authenticate);

  server.post('/', async (request, reply) => {
    const body = createPageSchema.parse(request.body);
    // ... Drizzle insert
    return reply.send({ success: true, data: page });
  });
}
```

### Key Patterns
- **Validation:** Every request body/params/query validated with Zod _before_ any business logic.
- **Database:** Drizzle ORM only — no raw SQL. Schema lives in `packages/db/src/schema.ts`.
- **Auth:** Session-based with HTTP-only cookies. Use `server.authenticate` preHandler from `middleware/auth.ts`.
- **Responses:** Always `{ success: true, data: ... }` or `{ success: false, error: "message" }`.
- **Imports:** Use `.js` extensions for local ESM imports (e.g. `import { db } from './lib/db.js'`).
- **Error handling:** Let Fastify handle errors. For validation, Zod errors propagate. For business logic, use `reply.code(4xx).send({ success: false, error })`.

### Environment
- Config via `lib/env.ts` using Zod schema validation.
- Key vars: `DATABASE_URL`, `COOKIE_SECRET`, `PORT`, `NODE_ENV`.
- Never hardcode secrets.

### Plugins Registered (in order)
1. `@fastify/helmet` — security headers
2. `@fastify/rate-limit` — 100 req/min per IP
3. `@fastify/cookie` — session cookies
4. `@fastify/multipart` — file uploads (10MB limit)
5. `@fastify/static` — serve uploaded files from `/uploads/`
6. `@fastify/cors` — credentials: true for frontend

### Database Schema
Schema is defined in `packages/db/src/schema.ts`. Current tables: `users`, `siteSettings`.
Pages and media tables are defined in `apps/api/src/lib/schema.ts`.
Use Drizzle's `$inferSelect` / `$inferInsert` for type inference.

### Adding a New Route
1. Create `apps/api/src/routes/{name}.ts` exporting an async Fastify plugin.
2. Define Zod schemas for inputs.
3. Add auth middleware if protected.
4. Register in `apps/api/src/index.ts` with `server.register(routes, { prefix: '/{name}' })`.