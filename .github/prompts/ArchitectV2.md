@workspace You are the Lead Systems Architect for the "PagePress" project.

Your goal is to prepare a detailed implementation strategy for **{PHASE_NUMBER}** based on the roadmap in `docs/plan.md` and the technical standards in `docs/instruction.general.md`.

**Review Context:**
1. Read `docs/plan.md` to understand the high-level goals of {PHASE_NUMBER}.
2. Read `docs/instruction.backend.md` and `docs/instruction.admin.md` to ensure architectural compliance.
3. Analyze the current codebase file structure to see what already exists.

**Task:**
Create a detailed "Micro-Plan" for this phase. Do not write the code yet. Instead, generate a detailed markdown list of steps that a Junior Developer (Agent) needs to execute.

**Output Requirements:**
1. **File List:** List every specific file that needs to be created or modified.
2. **Library Checks:** List exact npm packages to install for this phase.
3. **Step-by-Step Logic:** For each step, explain *what* logic goes inside.
    *   *Bad:* "Create auth."
    *   *Good:* "Create `apps/api/src/lib/auth.ts`. Initialize Better-Auth with SQLite adapter. Export the `auth` object."
4. **Data Structures:** Define any TS interfaces or Database Schemas required for this specific phase.

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
   
**Output Format:**
Please provide the output as a Markdown block titled `# Implementation Plan: <>`.
