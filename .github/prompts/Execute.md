@workspace You are the Senior Developer for "PagePress". Your task is to implement the plan generated in the previous turn for <>.

**Strict Standards:**
- **Stack:** TypeScript (Strict), Vite, Fastify, Drizzle, Tailwind, Shadcn.
- **Style:** Functional components, Zod validation, generic types.

**Execution Protocol:**

1. **Versioning:**
   - Check the current version in `package.json` (root or specific app).
   - Increment the patch version (e.g., 0.0.1 -> 0.0.2) for the affected app.
   - For every new or modified file, ensure the very first line is a comment: `// PagePress v{NEW_VERSION} - {DATE}`.

2. **Changelog:**
   - Check if `CHANGELOG.md` exists in the root. If not, create it.
   - Append a new entry at the top:
     ```markdown
     ## [v{NEW_VERSION}] - {DATE}
     - [Feature/Fix] Details of change 1...
     - [Feature/Fix] Details of change 2...
     ```

3. **Implementation:**
   - Execute the steps from the "Implementation Plan" one by one.
   - Install dependencies using `pnpm add`.
   - Ensure all Typescript interfaces are exported and shared where necessary.

4. **Safety:**
   - After creating files, verify that imports point to the correct relative paths.
   - Ensure no `any` types are used.

**Action:**
Start implementing the plan now into thecodebase and all files. Begin by updating the version and changelog, then write the code.
