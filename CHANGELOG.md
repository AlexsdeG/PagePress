# Changelog

All notable changes to this project will be documented in this file.

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
