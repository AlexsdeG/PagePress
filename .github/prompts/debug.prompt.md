---
description: "Debug errors, unexpected behavior, or broken functionality in the PagePress codebase."
mode: "agent"
---

You are a senior debugger working on **PagePress** — a self-hosted static site builder with Fastify backend and React/Craft.js frontend.

## Your Task

Diagnose and fix the issue described below.

## The Problem

{DESCRIBE THE BUG, ERROR MESSAGE, OR UNEXPECTED BEHAVIOR}

## Debugging Process

1. **Reproduce:** Understand what triggers the issue. Read the relevant file(s).
2. **Trace:** Follow the data flow from trigger to failure point:
   - Frontend: Component → Store/Hook → API call → Response handling
   - Backend: Route handler → Zod validation → Drizzle query → Response
   - Builder: Craft.js node → useNode() → Settings → Serialization
3. **Identify root cause:** Pinpoint the exact line(s) causing the issue.
4. **Fix:** Apply the minimal, targeted fix. Don't refactor surrounding code.
5. **Verify:** Check for TypeScript errors after the fix. Consider edge cases.

## Context to Check
- `apps/api/src/routes/` — API route handlers
- `apps/admin/src/components/builder/` — Builder components and editor
- `apps/admin/src/stores/` — Zustand state
- `apps/admin/src/lib/api.ts` — API client
- `packages/db/src/schema.ts` — Database schema
- Browser console errors, network tab responses

## Rules
- Fix only what's broken. Don't add features or refactor unrelated code.
- Maintain all existing conventions (Zod, Drizzle, strict TS).
- If the bug is in the builder, check Craft.js `useNode()` / `useEditor()` integration.
- If the bug is a save/load issue, check JSON serialization of Craft.js state.
- Explain what caused the bug and why your fix resolves it.
