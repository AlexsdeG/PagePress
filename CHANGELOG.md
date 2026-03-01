# Changelog

All notable changes to this project will be documented in this file.

## [v0.0.19] - 2026-03-01

### Super Admin Reset System
- [Feature] **Super Admin Role:** New role hierarchy with `super_admin` as highest privilege level; first user automatically created as super_admin
- [Feature] **Reset Controls in Settings:** Super admin-only "System" tab in Settings with granular reset options
- [Feature] **Selective Reset Operations:** Delete all pages, delete all media, reset database (preserve users), full factory reset
- [Feature] **Reset API Endpoints:** POST `/settings/reset/pages`, `/reset/media`, `/reset/database`, `/reset/full` with super_admin auth
- [Feature] **Reset Confirmation Dialogs:** One-click confirmation UI with clear warnings before destructive operations
- [Feature] **Full Wipe Script:** `reset-pagepress.sh` shell script for complete out-of-process reset (delete DB, media, and all dependencies)
- [Feature] **Super Admin Middleware:** New `requireSuperAdmin` middleware to enforce super_admin-only routes and operations
- [Enhancement] **Admin Access Relaxed:** `requireAdmin` middleware now accepts both `admin` and `super_admin` roles

## [v0.0.18] - 2026-03-01

### Quality of Life (Phase 13)
- [Feature] **Users Management Page:** Full CRUD for users with role assignment, account status display
- [Feature] **Role System:** Admin, Editor, Viewer roles with granular permissions and role editor UI
- [Feature] **Invite System:** Generate one-time invite links for new users, copy to clipboard
- [Feature] **Activity Logs:** Track user actions (page/template/media CRUD, login/logout, settings changes)
- [Feature] **First-Time Setup:** Guided setup flow on fresh install (admin account, site name, recovery phrase)
- [Feature] **Setup Guard:** Registration disabled after first-time setup; only invite links for new users
- [Feature] **Profile Page:** Change username, email, password with current password verification
- [Feature] **Login with Username or Email:** Login form accepts either username or email
- [Feature] **Settings Expansion:** Categories (General, Appearance, SEO, Advanced), custom head/footer code injection

## [v0.0.17] - 2026-02-28

### Public Renderer (Phase 12)
- [Feature] **JSON to HTML Renderer:** Server-side Craft.js JSON to HTML conversion engine for all builder components
- [Feature] **Public Page Routing:** `/` serves configurable homepage, `/:slug` serves dynamic pages
- [Feature] **Admin Panel Routing:** Admin SPA at `/pp-admin/*` with basename, API at `/pp-admin/api/*`
- [Feature] **Template Injection:** Automatic header/footer template insertion with per-page overrides
- [Feature] **Server-Side Style Generation:** Full advanced styling, pseudo-states, 4 responsive breakpoints (desktop/tablet/mobile/portrait) rendered as CSS
- [Feature] **Per-Page SEO:** Meta title, description, noIndex/noFollow robots directives from page settings
- [Feature] **OG Tags:** Open Graph image, title, description for social sharing
- [Feature] **Canonical URLs:** Prevent duplicate content with canonical link tags
- [Feature] **Robots.txt:** Auto-generated `/robots.txt` with sitemap reference
- [Feature] **Sitemap.xml:** Auto-generated `/sitemap.xml` listing all published pages
- [Feature] **Critical CSS:** All element styles inlined in `<style>` tag for fast first paint
- [Feature] **Lazy Loading:** Images use `loading="lazy"` and `decoding="async"` attributes
- [Feature] **Custom Code Injection:** Per-page and global custom head/footer code support
- [Feature] **404 Page:** Custom 404 template rendering for unknown slugs

## [v0.0.16] - 2026-02-28

### Dynamic Data & Conditions (Phase 11)
- [Feature] **Dynamic Data System:** Lightning icon button on text/image inputs to bind dynamic data tags
- [Feature] **Data Sources:** Site Title, Description, URL; Page Title, Slug, Date, Author; Current User Name, Email, Role
- [Feature] **Fallback Values:** Default value when dynamic data is empty
- [Feature] **Dynamic Data Resolution API:** Backend endpoint to resolve dynamic data tags with context (page, user, site settings)
- [Feature] **Conditional Visibility:** Show/hide elements based on conditions (user auth, role, homepage, device, custom field)
- [Feature] **AND/OR Logic:** Multiple conditions with AND/OR grouping for complex visibility rules
- [Feature] **Conditions Panel:** New "Conditions" tab in element settings sidebar for managing visibility conditions
- [Feature] **Dynamic Data Store:** Zustand store for caching resolved dynamic data values
- [Feature] **DynamicText Component:** Renders text with resolved dynamic data bindings
- [Feature] **DynamicImage Component:** Renders images with resolved dynamic data source URLs

## [v0.0.15] - 2026-02-28

### Template System (Phase 10)
- **Templates Admin Page:** Separate admin page for managing templates (header, footer, 404, custom)
- **System Templates:** Header and footer templates auto-injected at page top/bottom, per-page template assignment
- **404 Template:** Custom not-found page template support
- **Section Template Library:** Save any element/group as a reusable section template with categories (Hero, Features, CTA, Contact, etc.)
- **Template Library Panel:** Browse, search, and insert saved section templates from builder sidebar
- **Save as Template:** Right-click context menu action to save selected elements as reusable templates
- **Import/Export:** JSON-based template import and export for section templates
- **Template Variables:** `{{variable_name}}` syntax in text with variable editor UI, default values, and image variable support
- **Global Elements:** Mark elements as global to sync changes across all page instances, with visual indicator badge and unlink option
- **Template Selector:** Assign header/footer/custom template per page in page settings
- **Schema Updates:** New `section_templates` and `global_elements` tables, template fields on pages table

## [v0.0.14] - 2026-02-28

### Security & Hardening
- **Session Security:** Sessions now use `crypto.randomUUID()` for token generation, sliding window expiry, and automatic cleanup via cron
- **Account Lockout:** Brute-force protection with configurable failed login attempt limits and lockout duration
- **Password Policy:** Server-side password strength validation (min 8 chars, mixed case, number)
- **Cookie Hardening:** `SameSite=Strict`, `HttpOnly`, `Secure` (in prod), proper `Path` settings
- **Input Sanitization:** Filename sanitization for uploads (stripped path traversal, UUID prefix), MIME type allowlist enforcement
- **Safe User Responses:** `passwordHash` never exposed in API responses; new `SafeUser` type across the stack
- **Rate Limiting:** Stricter limits on auth routes (10/min for login/register)

### Error Handling
- **Centralized Error System:** New `AppError` class with `formatZodError()` and route error handler for consistent `{ success, error }` responses
- **Global Error Handlers:** Fastify `setErrorHandler` and `setNotFoundHandler` for consistent JSON error responses (no HTML 404s)
- **Frontend Error Boundaries:** `AppErrorBoundary` and `BuilderErrorBoundary` using `react-error-boundary` with recovery UI
- **API Client Hardening:** 401 auto-redirect to login, 30s request timeout, retry with exponential backoff, AbortController support

### Type Safety
- **Shared Types:** New `ApiSuccessResponse<T>`, `ApiErrorResponse`, `PaginatedResponse<T>`, `SafeUser`, `PageSummary`, `MediaItem` in `packages/types`
- **Fastify Type Augmentation:** `request.user` typed as `SafeUser`, `request.sessionId` available on all authenticated routes
- **Typed API Hooks:** New `api-hooks.ts` with TanStack Query hooks for all endpoints with proper generics and cache invalidation

### Performance
- **SQLite WAL Mode:** Enabled Write-Ahead Logging for better concurrent read performance
- **Database Indexes:** Added indexes on `sessions.expires_at`, `pages.created_at`, `media.created_at`
- **Lazy Loading:** Builder, Media, and Settings pages lazy-loaded with `React.lazy` + `Suspense`
- **Session Cleanup Cron:** Automatic expired session purge every 15 minutes

### Infrastructure
- **Testing Foundation:** Vitest workspace configuration for both API and admin packages
- **Backend Tests:** Auth route tests (login, register, lockout, session expiry) and pages route tests (CRUD, pagination, slug uniqueness)
- **Frontend Tests:** API client interceptor tests
- **Graceful Shutdown:** Server properly closes DB connections and stops cron on SIGTERM/SIGINT
- **Health Check:** `/health/ready` now includes response time metrics and verified DB connectivity
- **Structured Logging:** Pino logger redacts sensitive fields (password, cookie)

### Code Quality
- **Consistent Error Shapes:** All routes use `{ success: true, data }` / `{ success: false, error }` pattern
- **Environment Config:** New env vars `SESSION_MAX_AGE_SECONDS`, `MAX_FAILED_LOGINS`, `LOCKOUT_DURATION_SECONDS`, `TRUST_PROXY`
- **DB Connection Check:** `checkConnection()` function with WAL mode for health endpoints

## [v0.0.13] - 2025-12-08

### Fixed
- **Drag & Drop Nesting:** Fixed issue where layout components (Row, Column, Div) could not be dragged or properly nested. Added missing `drag` connector to these components to ensure they function as both drop targets and draggable elements.

## [v0.0.12] - 2025-12-05

### Added
- **Single Edit Mode:** Added `editingNodeId` to builder store - only one text/heading element can be in edit mode at a time
- **Fixed Rich Text Toolbar:** New `RichTextToolbar` component that stays visible above the text editor (replaces BubbleMenu)
- **Mouse Control in Editor:** Rich text editor now allows clicking to position cursor inside text
- **Modified Props System:** 
  - New `useModifiedProps` hook for tracking which properties have been explicitly modified by users
  - `_modifiedProps` array stored alongside component props
  - `isModified()`, `setModifiedProp()`, `resetProp()` utilities
- **Settings Context Menu:** 
  - New `SettingsFieldWrapper` component with right-click context menu
  - "Reset to Default" option for modified fields
  - "Copy Value" and optional "Paste Value" functionality
  - Visual blue dot indicator for modified fields
- **Custom Transition Detection:** Components now check for user-set transitions before applying default Tailwind classes

### Fixed
- **Effect Animations:** Fixed transitions not working for size/height/width changes by adding `hasCustomTransition` flag to prevent default `transition-all duration-150` from overriding user-set CSS transitions
- **Heading Level Sizes:** H1-H6 level selector now properly updates font size based on level (36px→16px) unless explicitly modified
- **Context Menu in Canvas:** Canvas now properly shows custom context menu instead of browser default, with edit mode detection
- **Rich Text Editor:** Replaced BubbleMenu with fixed toolbar to prevent instant closing on focus/click
- **Cursor Positioning:** Fixed mouse events being blocked in rich text editor by allowing propagation in wrapper div
- **Escape Key Handling:** Added `onEscape` callback to RichTextEditor for proper exit from edit mode

### Changed
- **RichTextEditor:** Complete rewrite with fixed toolbar, proper mouse handling, and escape key support
- **Text/Heading Components:** Now use global `editingNodeId` state instead of local `isEditing`
- **Heading.settings.tsx:** Level selector now shows font sizes (H1 - 36px, H2 - 30px, etc.) and displays "(customized)" when modified
- **14+ Builder Components:** Updated to conditionally apply default transition class based on `hasCustomTransition`
  - Container, Button, Image, Link, Video, Row, Column, Section, Div, Divider, Spacer, IconBox, List, Icon, HTMLBlock

### Technical
- Added `hasCustomTransition` boolean to `useAdvancedStyling` hook return value
- Created `hooks/index.ts` barrel export for builder hooks
- Enhanced `ContextMenu` with editingNodeId check and toast notifications
- Added `onContextMenu` handler to Canvas to prevent browser default menu

---

## [v0.0.11] - 2025-12-04

### Added
- **Rich Text Editing (Phase 8):** TipTap-based inline text editing for Text and Heading components
- **RichTextEditor Component:** Full TipTap wrapper with StarterKit, Link, TextAlign, Underline, Placeholder, TextStyle, and Color extensions
- **TextBubbleMenu:** Floating toolbar with Bold, Italic, Underline, Strikethrough, Link, Alignment, Lists, Headings, and clear formatting
- **LinkDialog:** Popover form for creating/editing links with URL input and target selection
- **CodeEditor Component:** Lazy-loaded Monaco Editor for syntax-highlighted HTML/CSS/JavaScript editing
- **HTMLBlock Monaco Integration:** Replaced textarea with tabbed Monaco editors for HTML, CSS, and JS with syntax highlighting
- **Element Defaults System:** `utils/elementDefaults.ts` for theme-based default values per component type
- **Modified Props Tracking:** `types/modifiedProps.ts` for tracking user-modified vs default values with merge helpers
- **ARIA Presets:** Enhanced AttributesTab with collapsible Accessibility Presets section including:
  - ARIA role dropdown with 20+ common role presets (button, navigation, dialog, etc.)
  - ARIA state selectors (aria-expanded, aria-selected, aria-checked, aria-disabled, aria-hidden, aria-pressed, aria-current, aria-live)
  - aria-label and aria-describedby quick input fields

### Changed
- **Text Component:** Now supports inline rich text editing via double-click, stores `htmlContent` alongside plain `text`
- **Heading Component:** Inline editing in minimal mode (no heading levels in toolbar since component manages level)
- **HTMLBlock Settings:** Tabbed interface (HTML/CSS/JS) with Monaco editors instead of plain textareas
- **API Types:** Unified theme types between api.ts and global/types.ts to avoid type mismatches

### Technical
- Added TipTap dependencies: @tiptap/react, @tiptap/starter-kit, @tiptap/extension-link, @tiptap/extension-text-align, @tiptap/extension-underline, @tiptap/extension-placeholder, @tiptap/extension-text-style, @tiptap/extension-color, @tiptap/extension-bubble-menu, @tiptap/extension-floating-menu
- Added Monaco Editor: @monaco-editor/react, monaco-editor (dev)
- Editor barrel export at `components/builder/editor/index.ts`
- Double-click to edit pattern for Text/Heading with visual hints
- Craft.js event propagation handling in editor components to prevent drag interference

---

## [v0.0.10] - 2025-12-04

### Added
- **Responsive Design System:** Complete per-breakpoint styling infrastructure inspired by Bricks Builder
- **Breakpoint Store:** Zustand store with persist for current breakpoint, orientation, and device frame state
- **Breakpoint Types:** BreakpointId type, Breakpoint interface, ResponsiveValue<T> generic
- **BreakpointSelector:** TopBar component with Monitor/Tablet/Smartphone icons, orientation toggle
- **DeviceFrame:** Visual phone/tablet bezel around canvas with accurate dimensions
- **ResponsiveWrapper:** HOC making any input responsive-aware with inheritance support
- **ResponsiveIndicator:** Blue dot indicator showing breakpoint overrides with reset functionality
- **Global Settings Panel:** Slide-out panel for site-wide design settings with 5 tabs:
  - ColorsTab: Color palette management by category with HexColorPicker
  - TypographyTab: Font families, base size, heading sizes with responsive values
  - ElementsTab: Default styles for buttons, links, containers, forms
  - BreakpointsTab: Editable min/max width with visual indicator bars
  - SpacingTab: Base unit slider, spacing scale preview, CSS custom properties
- **Page Settings Panel:** Slide-out panel for page-specific settings with 4 tabs:
  - GeneralTab: Header/footer toggles, full width, background color
  - SeoTab: Meta title/description with character counters, noIndex/noFollow, canonical URL, Google preview
  - SocialTab: Open Graph and Twitter Card settings with image upload
  - CustomCodeTab: Custom CSS, JS (head/body), external resources
- **Theme API Routes:** `/theme` GET/PUT for global settings, `/theme/page/:pageId` GET/PUT for page settings
- **Theme Database Tables:** `theme_settings` and `page_settings` tables with JSON storage
- **Global Settings Store:** Zustand store for theme and page settings with API integration
- **Switch UI Component:** Radix UI switch component for toggle controls
- **Default Theme Auto-Creation:** Backend automatically creates default theme settings on first access

### Fixed
- **Margin/Padding Styling:** Added `ensureUnit()` helper to properly handle numeric values without units (e.g., "10" → "10px")
- **Zero Value Handling:** Added `isZeroValue()` helper to skip zero values in margin/padding to avoid unnecessary CSS
- **Landscape Orientation:** Updated `getCanvasWidth()` and added `getCanvasHeight()` to properly swap dimensions in landscape mode
- **Theme Settings Loading:** Theme settings now auto-create defaults if none exist (returns 200 instead of 404)
- **Builder Initialization:** Theme settings now load on Builder mount for early access to global defaults

### Changed
- **TopBar:** Replaced viewport selector with BreakpointSelector, added gear icon for Global Settings, document icon for Page Settings
- **Canvas:** Integrated DeviceFrame component, uses breakpointStore instead of builder store viewport, dynamic height based on orientation
- **API Client:** Added theme endpoints (get, update, getPageSettings, updatePageSettings)

### Technical
- All package.json versions updated from 0.0.5 to 0.0.10
- Added @radix-ui/react-switch dependency
- New responsive system helpers: isResponsiveValue, getBreakpointValue, setBreakpointValue, removeBreakpointValue, hasBreakpointOverride
- Deep merge utility for nested settings updates in theme routes
- Default theme settings with colors, typography, elements, breakpoints, and spacing

---

## [v0.0.8] - 2025-12-04

### Added
- **Element Settings Sidebar:** Bricks-style icon sidebar navigation with tabs for Content, General, Layout, Typography, Background, Border, Effects, Transform
- **GeneralSettingsTab:** Element metadata management including:
  - Custom element name (editable, displayed in structure tree)
  - Unique element ID (readonly, with copy button)
  - Component type badge with color coding
  - CSS class management (create, add, remove classes)
- **CSS Class System:** 
  - Zustand store for global class management with persistence
  - Create classes from current element styling
  - Apply multiple classes to elements
  - Class search and category organization
- **UnitInput Component:** Number input with unit selector (px, %, em, rem, vh, vw, auto) for dimensions and spacing
- **PseudoStateSelector:** Visual selector for default, hover, active, focus states in style tabs
- **Structure Tree Enhancements:**
  - Inline element renaming with pencil icon
  - Custom names displayed with component type badge
  - More component icons (Section, Row, Column, Divider, Spacer, Video, etc.)

### Changed
- **RightSidebar:** Simplified to delegate layout to settings components
- **Container.settings.tsx:** Migrated to new ElementSettingsSidebar with icon tabs
- **Div.settings.tsx:** Migrated to new ElementSettingsSidebar with icon tabs
- **StructureTree:** Enhanced with inline editing, custom names, and more icons

---

## [v0.0.7] - 2025-12-04

### Added
- **Advanced Styling System:** Complete Bricks-level style controls infrastructure
- **Style Types:** Comprehensive TypeScript interfaces for all styling options
- **GradientInput:** Linear/radial gradient picker with angle and color stops
- **BoxShadowInput:** Multiple shadows with inset, offset, blur, spread controls
- **BorderInput:** Per-side border control with width, style, color, radius
- **TransformInput:** Translate, Rotate, Scale, Skew with units and origin selector
- **FilterInput:** CSS filters (blur, brightness, contrast, grayscale, saturate, hue-rotate, invert, sepia)
- **BackdropFilterInput:** Glass effect controls (blur, brightness, contrast)
- **TransitionInput:** Property, duration, timing function, delay with live preview
- **LayoutSettingsTab:** Position, display, flex, dimensions, margin/padding, overflow
- **BackgroundSettingsTab:** Color, gradient, image, video, overlay with full controls
- **TypographySettingsTab:** Font family, size, weight, style, spacing, alignment, decoration, text shadows
- **SettingsTabsWrapper:** Master container with Content/Style tabs and pseudo state selector
- **useAdvancedStyling Hook:** Read/write advanced styling props with CSS conversion
- **styleToCSS Utility:** Convert styling objects to CSSProperties
- **Pseudo State Support:** Default, hover, active, focus states in style editor

### Fixed
- **Video Edit Mode:** Added overlay layer to intercept clicks for element selection in edit mode

---

## [v0.0.5] - 2025-11-30

### Added
- **Visual Builder Engine:** Full Craft.js integration for drag-and-drop page building
- **Base Components:** Container, Text, Heading, Image, Button, HTMLBlock builder components
- **Editor Layout:** TopBar, LeftSidebar (Toolbox), RightSidebar (Inspector), Canvas
- **Settings Inspector:** Component property editors with ColorInput, SpacingInput, ClassInput
- **Layers Panel:** Visual component tree using @craftjs/layers
- **Undo/Redo:** Built-in history navigation with keyboard shortcuts (Ctrl+Z/Ctrl+Y)
- **Auto-Save:** Debounced auto-save with visual indicator (configurable)
- **Manual Save:** Explicit save button with loading state
- **Viewport Modes:** Desktop, Tablet, Mobile responsive preview
- **Builder Store:** Zustand store for editor state management
- **Page Builder Hook:** React Query integration for page loading/saving
- **Radix UI Components:** Slider, Accordion, Popover, Tooltip primitives
- **DOMPurify:** HTML sanitization for HTMLBlock security

### Fixed
- **Media Upload Route:** Changed `/media/upload` to `/media` to match backend
- **Page Types:** Unified page types to `['page', 'post', 'template']` across frontend and backend
- **Upload Progress:** Fixed progress indicator not clearing on error

### Changed
- Updated API page types schema to include 'post' and 'template'
- Enhanced contentJson handling for Craft.js serialization

---

## [v0.0.4] - 2025-11-30

### Added
- **Pages System:** Full CRUD API for pages with slug auto-generation
- **Media Library:** File upload system with local storage and S3-compatible structure
- **Settings Management:** Site-wide settings API (title, description, favicon)
- **Database Schema:** Added `pages` and `media` tables
- **Pages Routes:** `/pages` CRUD endpoints with Zod validation
- **Media Routes:** `/media` upload, list, delete endpoints with multipart support
- **Settings Routes:** `/settings` get/update endpoints
- **Admin Pages List:** Data table with create/edit/delete actions
- **Admin Media Library:** Grid view with drag-drop upload
- **Admin Settings Page:** Site configuration form
- **Sidebar Navigation:** Full dashboard navigation component

### Changed
- Updated API entry point with multipart support and new routes
- Enhanced API client with pages, media, settings methods
- Updated App.tsx with new routes and layout

---

## [v0.0.3] - 2025-11-30

### Added
- **Authentication System:** Implemented full auth with sessions and HTTP-Only cookies
- **Password Hashing:** Added bcrypt password utilities
- **Auth Routes:** Created `/auth/login`, `/auth/register`, `/auth/logout`, `/auth/me` endpoints
- **Auth Middleware:** Created `requireAuth` middleware for protected routes
- **Security Headers:** Added `@fastify/helmet` for security headers
- **Rate Limiting:** Added `@fastify/rate-limit` for brute force protection
- **Sessions Table:** Added sessions table to database schema
- **Login Page:** Created login page with form validation
- **Protected Routes:** Created ProtectedRoute wrapper component
- **Auth Store:** Created Zustand store for auth state management
- **API Client:** Created fetch wrapper with credentials support
- **Dashboard Page:** Created placeholder dashboard page

### Changed
- Updated API entry point with security plugins
- Updated environment validation for auth secrets

---

## [v0.0.2] - 2025-11-30

### Added
- **Database Setup:** Initialized Drizzle ORM with SQLite (better-sqlite3)
- **Database Schema:** Created `users` and `site_settings` tables
- **Environment Validation:** Added Zod schema for environment variables
- **Health Check Routes:** Added `/health`, `/health/live`, `/health/ready` endpoints
- **Shadcn/UI Setup:** Configured `cn()` utility and CSS variables
- **Shared Packages:** Created `@pagepress/db` and `@pagepress/types` packages
- **Docker Configuration:** Added `docker-compose.yml` and Dockerfiles
- **Button Component:** First Shadcn UI component

### Changed
- Updated API entry point with proper logging and environment validation
- Enhanced Tailwind CSS configuration with Shadcn theme variables
- Updated App.tsx with system status dashboard

---

## [v0.0.1] - 2025-11-29

### Added
- Initial project scaffolding
- Monorepo setup with pnpm workspaces
- Basic Fastify server
- Basic Vite + React + Tailwind admin panel
