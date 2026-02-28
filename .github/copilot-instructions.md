# PagePress — AI Coding Instructions

> Self-hosted static site builder with a visual drag-and-drop page editor.
> Monorepo: `apps/api` (backend), `apps/admin` (frontend), `packages/db`, `packages/types`.

---

## 1. Tech Stack (Strict — Do Not Deviate)

| Layer | Technology | Notes |
|-------|-----------|-------|
| Language | TypeScript (strict mode) | **No `any`.** Use `unknown`, generics, or Zod inference. |
| Runtime | Node.js (LTS) | ESM (`"type": "module"`) everywhere. |
| Package Manager | pnpm | Workspaces defined in `pnpm-workspace.yaml`. |
| Backend | Fastify 5 | Plugins: helmet, rate-limit, cookie, cors, multipart, static. |
| Database | SQLite via libSQL + Drizzle ORM | Schema in `packages/db/src/schema.ts`. Migrations via `drizzle-kit`. |
| Validation | Zod 4 | All API inputs validated with Zod schemas. |
| Auth | Custom session-based | bcrypt passwords, HTTP-only cookies, session table in DB. |
| Frontend | React 19, Vite, Tailwind CSS 4 | Path alias `@/` → `src/`. |
| UI Kit | Shadcn/UI (Radix primitives) | Components in `src/components/ui/`. Use `cn()` for class merging. |
| State | Zustand 5 | Stores in `src/stores/`. No Redux. |
| Data Fetching | TanStack React Query 5 | API client in `src/lib/api.ts`. |
| Forms | React Hook Form + Zod resolver | |
| Builder Engine | Craft.js | Components in `src/components/builder/components/`. |
| Rich Text | TipTap 3 | Inline editing on canvas via double-click. |
| Code Editor | Monaco Editor | Lazy-loaded for HTMLBlock component. |
| Icons | Lucide React | |
| Toasts | Sonner | |
| Containerization | Docker (multi-stage) | `docker-compose.yml` at root. |

---

## 2. Project Structure

```
pagepress/                     # Root (pnpm workspace)
├── apps/
│   ├── api/                   # Fastify backend
│   │   └── src/
│   │       ├── index.ts       # Server bootstrap
│   │       ├── lib/           # db.ts, env.ts, auth.ts, password.ts, slug.ts
│   │       ├── middleware/     # auth.ts (session middleware)
│   │       └── routes/        # auth, pages, media, settings, theme, health
│   └── admin/                 # React frontend (Vite)
│       └── src/
│           ├── components/
│           │   ├── builder/   # Craft.js components, editor UI, inspector, responsive
│           │   └── ui/        # Shadcn/UI primitives
│           ├── hooks/         # useAuth, usePageBuilder
│           ├── lib/           # api.ts, utils.ts
│           ├── pages/         # Route pages (Builder, Dashboard, Pages, Media, etc.)
│           └── stores/        # Zustand stores (auth.ts, builder.ts)
├── packages/
│   ├── db/                    # Drizzle schema + config
│   │   └── src/schema.ts      # users, siteSettings tables
│   └── types/                 # Shared TypeScript types
│       └── src/models.ts      # User, ApiResponse, HealthCheckResponse, etc.
├── Plan.md                    # Master roadmap with phase status
├── CHANGELOG.md               # Version history
└── docker-compose.yml
```

---

## 3. Coding Standards

### TypeScript
- Strict mode. Zero `any`. Use Zod `.infer<>` for runtime-validated types.
- Prefer `interface` for object shapes, `type` for unions/intersections.
- Export types from `packages/types` for cross-workspace sharing.
- Use `satisfies` where helpful for type-narrowing without widening.

### React / Frontend
- **Functional components only.** No class components.
- **Composition over inheritance.** Use hooks for shared logic.
- `React.memo` for Builder components to prevent re-renders during drag.
- Lazy-load heavy components (Monaco, charts) with `React.lazy` + `Suspense`.
- Shadcn/UI for all standard UI. Extend primitives, don't reinvent.
- Zustand stores: keep flat, use selectors to avoid unnecessary re-renders.

### Backend / API
- Route files export a Fastify plugin function.
- Validate all request inputs with Zod schemas before processing.
- Use Drizzle ORM for all DB queries — never raw SQL strings.
- Session auth via `@fastify/cookie` — check session middleware on protected routes.
- Error responses: `{ success: false, error: "message" }`.
- Success responses: `{ success: true, data: ... }`.

### Security
- All API inputs validated with Zod — never trust the client.
- Sanitize user HTML with DOMPurify in the renderer.
- Parameterized queries only (enforced by Drizzle).
- helmet for security headers, rate-limit for abuse prevention.
- HTTP-only, Secure (in prod), SameSite=Strict cookies for sessions.

### Performance
- Lazy-load heavy components (Monaco Editor, Video embeds).
- Images: prefer WebP, serve via `@fastify/static`.
- Use `React.memo` and Zustand selectors to minimize re-renders in builder.

---

## 4. Builder Architecture (Craft.js)

Each draggable builder component consists of:
1. **Component file** (`Button.tsx`) — renders the element, uses `useNode()` for Craft.js connection.
2. **Settings file** (`Button.settings.tsx`) — right-sidebar panel for editing props/styles.
3. **Default props** — defined in `ComponentName.craft = { props: { ... } }`.

Builder components live in `apps/admin/src/components/builder/components/`.
The builder has:
- **Responsive breakpoints** — Desktop (base), Tablet (<992px), Mobile (<768px), Portrait (<479px). Styles cascade down.
- **Pseudo-state system** — hover, active, focus styling per element.
- **Class system** — create/assign reusable style classes (like Bricks Builder).
- **Custom attributes** — arbitrary HTML attributes and ARIA presets.
- **Context menu** — right-click for copy/paste/duplicate/wrap actions.
- **Keyboard shortcuts** — Ctrl+S save, Ctrl+Z/Y undo/redo, Delete, Escape, Ctrl+D duplicate.

---

## 5. Common Commands

```bash
pnpm dev              # Run all apps in parallel
pnpm dev:api          # API only
pnpm dev:admin        # Admin only
pnpm db:generate      # Generate Drizzle migrations
pnpm db:migrate       # Apply migrations
pnpm db:studio        # Drizzle Studio (DB browser)
pnpm build            # Build all
pnpm lint             # Lint all
```

---

## 6. Conventions

- **Versioning:** Root package and each app have independent `version` in `package.json`. Bump patch for features/fixes.
- **Changelog:** Append entries to root `CHANGELOG.md` with `## [vX.Y.Z] - YYYY-MM-DD` format.
- **Imports:** Use `@/` alias in frontend. Use `.js` extensions in backend ESM imports.
- **Naming:** PascalCase for components/types, camelCase for functions/variables, kebab-case for files.
- **Roadmap:** `Plan.md` tracks all phases and their status. Reference it before starting new work.