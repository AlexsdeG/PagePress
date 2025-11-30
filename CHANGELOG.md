# Changelog

All notable changes to this project will be documented in this file.

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
