# PagePress

**Vite + React + TypeScript**
---

# 1. Executive Summary & Architecture

To achieve the "High Industry Standard" while keeping it lightweight and fast, we will use a **Headless Architecture**.
*   **The Backend (API):** Handles database, authentication, and serving the compiled sites.
*   **The Admin (SPA):** A React application (built with Vite) that acts as the visual editor.
*   **The Renderer:** A lightweight engine that takes the JSON data saved by the builder and renders the actual HTML for the public.

### The Recommendation: " The Modern Performance Stack"
*   **Runtime:** Node.js (or Bun for extreme speed).
*   **Language:** TypeScript (Strict mode).
*   **Build Tool:** Vite.
*   **Frontend Framework:** React (Standard, massive ecosystem).
*   **Database:** SQLite (via LibSQL/Turso) or PostgreSQL. *Recommendation: SQLite for simplicity and portability.*
*   **ORM:** Drizzle ORM (Faster and lighter than Prisma).
*   **Styling:** Tailwind CSS.

---

# 2. Tech Stack & Library Research

Here is the breakdown of libraries to use to make development fast, robust, and secure.

### Core Infrastructure
| Category | Recommendation | Alternative | Why? |
| :--- | :--- | :--- | :--- |
| **Server Framework** | **Fastify** | Hono / Express | Fastify is significantly faster than Express and has great schema-based validation built-in. |
| **Database ORM** | **Drizzle ORM** | Prisma | Drizzle has zero runtime dependencies and allows extremely fast SQL queries. |
| **Validation** | **Zod** | Valibot | Zod is the industry standard for TypeScript schema validation (Backend & Frontend). |
| **Auth** | **Better-Auth** (or Lucia) | Passport.js | Better-Auth/Lucia provides full ownership of data, high security, and easy integration with database tables. |

### Frontend & Editor Logic (The "Builder" Part)
| Category | Recommendation | Alternative | Why? |
| :--- | :--- | :--- | :--- |
| **Page Builder Core** | **Craft.js** | dnd-kit | **Critical Choice.** Craft.js is a framework *specifically* for building page builders in React. It handles the serialization, drag-and-drop, and component selection logic out of the box. |
| **Rich Text** | **TipTap** | Slate.js | Headless, works perfectly inside other draggable components. |
| **State Management** | **Zustand** | Redux Toolkit | Redux is too heavy. Zustand is tiny, fast, and uses hooks. |
| **UI Components** | **Shadcn/UI** | Mantine | Shadcn provides accessible, copy-paste components (based on Radix UI) that you can fully customize. |
| **Icons** | **Lucide React** | FontAwesome | Modern, lightweight SVG icons. |
| **Code Editor** | **Monaco Editor** | CodeMirror | The engine that powers VS Code. Perfect for the "Custom Code" blocks. |

---

# 3. Database Schema Design

We need a flexible schema to handle dynamic content.

**Key Tables:**
1.  **Users:** `id`, `email`, `password_hash`, `role` (admin/editor).
2.  **Sites/Settings:** `title`, `favicon`, `global_css`, `global_js`, `seo_meta`.
3.  **Pages:** `id`, `slug` (e.g., `/about`), `title`, `is_homepage`, `content_json` (The builder data).
4.  **Templates:** `id`, `type` (header, footer, section), `content_json`, `variables` (JSON).
5.  **Media:** `id`, `filename`, `path`, `mime_type`, `alt_text`.

---

# 4. The Page Builder Engine (Craft.js Implementation)

This is the core of your request (like Bricks/Oxygen).

### How it works:
1.  **The Canvas:** A React component that renders the `content_json`.
2.  **Resolvers:** You map HTML tags to React components.
    *   *Example:* When the JSON says `{ type: "Container", props: { width: "100%" } }`, the builder renders your `<Container />` component.
3.  **Editor UI:**
    *   **Left Sidebar (Toolbox):** Draggable items (Heading, Text, Image, Video, Container, Columns).
    *   **Right Sidebar (Inspector):** When an element is clicked, this sidebar reads the `props` of the selected component and renders inputs (Color picker, Slider for padding, Text input for classes).

### Features to Implement:
*   **Visualizer:** The Canvas *is* the visualizer.
*   **DOM Tree:** Craft.js exposes the tree structure; you simply map over it to show a hierarchical list in the sidebar.
*   **Rich Text:** Wrap TipTap inside a Text component.
*   **HTML/Code Block:** A component that accepts a string prop and renders it via `dangerouslySetInnerHTML` (sanitized) or executes it if it's JS.

---

# 5. Application Structure (Folder Layout)

A Monorepo structure is best for keeping Backend and Frontend types shared.

```text
/my-site-builder
├── docker-compose.yml
├── /packages
│   ├── /db             # Drizzle Schema & Migrations (Shared)
│   ├── /types          # Shared Zod schemas & TS Interfaces
├── /apps
│   ├── /api            # Node/Fastify Backend
│   │   ├── /src
│   │   │   ├── /routes
│   │   │   │   ├── /auth
│   │   │   │   ├── /pages     # CRUD for pages
│   │   │   │   ├── /media     # Image upload handling
│   │   │   │   └── /renderer  # The public viewing logic
│   │   │   ├── /services
│   │   │   └── server.ts
│   │   ├── Dockerfile
│   ├── /admin          # Vite React App (The Builder)
│   │   ├── /src
│   │   │   ├── /components
│   │   │   │   ├── /builder   # The Craft.js components (Hero, Text, Div)
│   │   │   │   ├── /panels    # Right/Left sidebars
│   │   │   │   └── /ui        # Shadcn buttons, inputs
│   │   │   ├── /pages
│   │   │   │   ├── Login.tsx
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   └── Editor.tsx # The main builder interface
│   │   │   ├── /stores        # Zustand state
│   │   │   └── main.tsx
│   │   ├── Dockerfile
```

---

# 6. Detailed Feature Roadmap

### Phase 1: Setup & Auth
1.  Initialize Drizzle + SQLite.
2.  Setup Fastify API with `better-auth`.
3.  Create the Admin login page (`/admin`).

### Phase 2: The Core Builder (The "Bricks" Logic)
1.  Install **Craft.js**.
2.  Create basic "User Components":
    *   `Container` (Div with flex/grid controls).
    *   `Text` (Typography controls).
    *   `Image` (Upload integration).
3.  **Right Sidebar (Inspector):**
    *   Create a "Settings Factory". If I click a Text block, show Font Size, Color, Weight inputs.
    *   **Classes Input:** Allow typing Tailwind classes (e.g., `p-4 bg-red-500`) that get applied to the component.

### Phase 3: Templates & Global Settings
1.  **Header/Footer:** Create a specific page type called "Template".
2.  **Global Styles:** Store a JSON object with primary colors and font families. Inject these as CSS Variables into the preview iframe.

### Phase 4: The Public Renderer
1.  When a user visits `/` or `/about`:
2.  Backend fetches the Page JSON.
3.  Backend hydrates a React Root string or sends a simple HTML file that reads the JSON and renders the components (just like the editor, but without the "drag" handlers).

---

# 7. Security Standards (High Priority)

1.  **Input Sanitation:** Use `dompurify` on any HTML code block to prevent XSS.
2.  **Authentication:** HTTP-only Cookies (secure, same-site) using Better-Auth. Do not store tokens in LocalStorage.
3.  **Zod Validation:** Validate *every* API request. If the builder sends a color that isn't a string, reject it.
4.  **CSP (Content Security Policy):** Configure Helmet in Fastify to only allow scripts from your domain.
5.  **Rate Limiting:** Use `@fastify/rate-limit` to prevent brute force on login.

---

# 8. Docker & Deployment Strategy

To make this "easy setup," we use a multi-stage Docker build.

**`docker-compose.yml`**:
```yaml
version: '3.8'
services:
  # The API handles DB and serving the built frontend assets
  api:
    build: ./apps/api
    ports:
      - "3000:3000"
    volumes:
      - ./data:/app/data # Persist SQLite DB
      - ./uploads:/app/uploads # Persist Images
    environment:
      - DATABASE_URL=file:/app/data/site.db
      - JWT_SECRET=supersecuresecret

  # (Optional) specific container for dev mode frontend
  # In production, API serves the static Admin files
```

### Fast & Efficient Workflow
*   **Development:** Run `npm run dev` (starts Vite frontend and Fastify backend concurrently).
*   **Production:** Run `docker-compose up -d`. The API container serves the API *and* the static frontend files (Admin panel).

---

# 9. Summary Recommendation

To build a **High Industry Standard**, **Fast**, and **Robust** static site builder:

1.  **Don't build the DnD engine from scratch.** Use **Craft.js**. It is specifically designed for this.
2.  **Don't use a heavy Database.** Use **SQLite** with **Drizzle**. It's instant setup and handles high traffic easily for static content.
3.  **Use Tailwind CSS.** It is the modern standard. Your builder should fundamentally be a "Visual Tailwind Editor."
4.  **Use TypeScript & Zod.** This ensures your system is robust and catches errors before you even run the code.
