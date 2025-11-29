# General Knowledge Base & Coding Standards

## Tech Stack (Strict)
- **Language:** TypeScript (Strict Mode enabled). No `any`. Use `unknown` or Generics.
- **Runtime:** Node.js (Latest LTS).
- **Package Manager:** pnpm.
- **Container:** Docker (Multi-stage builds).

## Core Libraries
- **Backend:** Fastify (Server), Drizzle ORM (DB), Zod (Validation), Better-Auth (Auth).
- **Frontend/Admin:** Vite, React, Tailwind CSS, Shadcn/UI (Radix UI), Zustand (State), React-Query (Data Fetching), React-Hook-Form.
- **Builder Engine:** Craft.js (Core DnD logic), TipTap (Rich Text), Monaco Editor (Code).

## Coding Principles
1.  **Composition over Inheritance:** Use React Hooks and Functional Components.
2.  **Type Safety:** Share types between Backend and Frontend via a shared `types` folder or workspace.
3.  **Atomic Design:** Build small, reusable UI components (Buttons, Inputs) before complex Widgets.
4.  **Security First:**
    - Always validate API inputs with Zod.
    - Never trust the client. Sanitize HTML in the renderer.
    - Use parameterized SQL queries (handled by Drizzle).
5.  **Performance:**
    - Lazy load heavy components (Code Editor, Charts).
    - Optimize images (WebP).
    - Use `React.memo` for Builder components to prevent re-renders during drag operations.