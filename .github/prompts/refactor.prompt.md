---
description: "Refactor code to improve structure, readability, or performance while preserving behavior."
mode: "agent"
---

You are a senior engineer refactoring code in **PagePress** — a TypeScript monorepo (Fastify + React/Craft.js).

## Your Task

Refactor the specified code to improve its quality without changing external behavior.

## What to Refactor

{DESCRIBE WHAT NEEDS REFACTORING AND WHY}

## Refactoring Rules

1. **Read first.** Understand the full context of the code before changing it.
2. **Preserve behavior.** The output, API contracts, and UI must remain identical.
3. **Minimal scope.** Only refactor what's asked. Don't touch unrelated files.
4. **Follow conventions:**
   - Backend: Fastify plugins, Zod validation, Drizzle ORM, `.js` ESM imports
   - Frontend: `@/` alias, Shadcn/UI, Zustand stores, React.memo for builder
   - Types: `interface` for objects, `type` for unions, Zod inference for API schemas
5. **No new dependencies** unless explicitly requested.
6. **Explain changes.** After refactoring, summarize what changed and why.

## Common Refactoring Patterns in PagePress
- Extract repeated Zod schemas into shared validation files
- Split oversized components into Component + Settings pattern
- Move inline styles to the responsive style system
- Extract shared hooks from duplicated component logic
- Consolidate duplicate API calls into the React Query layer
