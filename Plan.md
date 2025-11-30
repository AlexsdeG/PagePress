# Master Project Plan: "PagePress" Web Site Builder

## Phase 1: Foundation & Infrastructure (The Skeleton)
**Goal:** Setup Monorepo, Docker, Database, and Basic API health.
- [x] **Repo Setup:** Initialize `pnpm` monorepo (Turborepo optional, or simple workspaces).
- [x] **Docker:** Create `docker-compose.yml` for Node (API), Vite (Admin), and Persistant Volume (SQLite).
- [ ] **Database:**
    - [ ] Initialize **Drizzle ORM** with **SQLite** (`libsql`).
    - [ ] Create Schema: `users` (id, email, password, role), `sites_settings` (key, value).
- [x] **Backend Core:**
    - [ ] Setup **Fastify** server with TypeScript.
    - [ ] Setup `pino` logger.
    - [ ] Setup **Zod** for env validation.
- [x] **Frontend Core:**
    - [ ] Initialize Vite + React + TypeScript + **Tailwind CSS**.
    - [ ] Install **Shadcn/UI** and setup `cn` utility.

## Phase 2: Authentication & Security ( The Gatekeeper)
**Goal:** Secure the admin panel using modern standards.
- [x] **Auth Implementation:**
    - [ ] Install **Better-Auth** (or Lucia Auth).
    - [ ] Create API routes: `/api/auth/login`, `/api/auth/register` (first run only), `/api/auth/me`.
    - [ ] Implement HTTP-Only Cookies (Strict, Secure).
- [x] **Admin UI Auth:**
    - [ ] Create Login Page (`/login`).
    - [ ] Create Protected Route Wrapper (redirects if not auth).
- [x] **Security:**
    - [ ] Add `@fastify/helmet` (Security Headers).
    - [ ] Add `@fastify/rate-limit` (Brute force protection).

## Phase 3: The Dashboard & CMS Logic (The WordPress Backend)
**Goal:** Manage pages, media, and settings outside the visual builder.
- [ ] **Database Expansion:**
    - [ ] Add Tables: `pages` (id, title, slug, content_json, published, type), `media` (id, path, mime).
- [ ] **API - Content:**
    - [ ] CRUD Routes for Pages (`GET`, `POST`, `PUT`, `DELETE`).
    - [ ] Multer/Fastify-Multipart for Media Uploads.
- [ ] **Admin Dashboard:**
    - [ ] Dashboard Home (Stats).
    - [ ] Page List View (Data Table with Shadcn).
    - [ ] Media Library Grid.
    - [ ] Settings Page (Site Title, Global SEO).

## Phase 4: The Visual Builder Engine (The "Oxygen" Core)
**Goal:** A React-based Drag-and-Drop editor using Craft.js.
- [ ] **Builder Setup:**
    - [ ] Install `@craftjs/core`.
    - [ ] Create Editor Layout: TopBar (Actions), LeftSidebar (Tools), Canvas (Center), RightSidebar (Inspector).
- [ ] **Base Components (The Bricks):**
    - [ ] Create mapped components: `Container`, `Text`, `Heading`, `Image`, `Button`, `HTMLBlock`.
    - [ ] Implement `user` and `related` rules in Craft.js for each component.
- [ ] **Settings Factory (The Inspector):**
    - [ ] Create generic Inputs: `ColorPicker`, `Slider` (Padding/Margin), `Select` (Font), `TextInput`.
    - [ ] Map these inputs to modify the `props` of selected components in Craft.js.
- [ ] **Tailwind Integration:**
    - [ ] Create a "Class Input" field in the Inspector.
    - [ ] Apply classes dynamically to the Canvas components.

## Phase 5: Advanced Builder Features
**Goal:** Rich text, Templates, and Reusability.
- [ ] **Rich Text:** Integrate **TipTap** (Headless) inside the `Text` component for inline editing.
- [ ] **Code Editor:** Integrate **Monaco Editor** for the `HTMLBlock` and Custom CSS settings.
- [ ] **Templates/Parts:**
    - [ ] Create "Header" and "Footer" page types.
    - [ ] Logic to inject Header/Footer JSON into the main Page JSON during render.
- [ ] **Responsive Mode:** Add viewport toggles (Mobile, Tablet, Desktop) in TopBar that update the Canvas iframe width.

## Phase 6: The Public Renderer (The Frontend)
**Goal:** Convert the saved JSON into high-speed HTML.
- [ ] **Routing:** Create a wildcard route `/*` in Fastify (or a separate Next.js/Astro frontend if desired, but Fastify+React SSR is simpler).
    - [ ] admin apge and dashboard under `/pp-admin/*` (eg /pp-admin/pages)
- [ ] **Renderer Engine:**
    - [ ] A lightweight React App that takes the `content_json` from DB.
    - [ ] Resolves components (same map as Builder).
    - [ ] Renders static HTML string.
    - [ ] Impl json safe for craft.js builder and html, css for lighning fast access of build pages in frontend, also safe them in folder strucutre so they can be used directly as entry points for specific routes
- [ ] **SEO:** Inject `<title>` and `<meta>` tags based on page settings.

## Phase 7: QoL
**Goal:**: Big Quality of life with many small chagnes and improvments
- [ ] setting invide link only(also default acitve), no one can create account in admin apge only with invide link + roles and rules like editor, admin, ...
- [ ] full usermanagent tab in sidebar with page and settings, also stuff like personal profile with change username, email, password
- [ ] invide link send email, email code verify new email, login with username or email, forget paswrod, jwt token login
- [ ] full working settings safed and used in frontend + better notice eg with sonnet toast

## Phase 8: Extensibility & API (The Plugin System)
**Goal:** "WordPress-like" Hooks and Filters.
- [ ] **Backend Hooks:**
    - [ ] Implement `EventBus` (e.g., `mitt`).
    - [ ] Create Events: `page.beforeSave`, `page.afterSave`, `api.request`.
- [ ] **Frontend Slots:**
    - [ ] Create a `PluginManager` singleton.
    - [ ] Define Slots: `Sidebar.Top`, `Sidebar.Bottom`, `Canvas.Overlay`.
    - [ ] Allow 3rd party JS to register components into slots.
- [ ] **Shortcodes:**
    - [ ] Implement a parser that finds `[shortcode id="123"]` in text and replaces it with a specific React Component.