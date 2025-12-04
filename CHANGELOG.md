# Changelog

All notable changes to this project will be documented in this file.

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
