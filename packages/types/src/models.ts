// PagePress v0.0.14 - 2026-02-28

/**
 * User roles in the system
 */
export type UserRole = 'admin' | 'editor';

/**
 * User model interface (full, including password hash — internal use only)
 */
export interface User {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  role: UserRole;
  failedLoginAttempts: number;
  lockedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Safe user model — never includes passwordHash.
 * Use this for all API responses and frontend code.
 */
export interface SafeUser {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  createdAt: Date | string;
}

/**
 * User creation input (without auto-generated fields)
 */
export interface CreateUserInput {
  email: string;
  username: string;
  passwordHash: string;
  role?: UserRole;
}

/**
 * Site setting model interface
 */
export interface SiteSetting {
  key: string;
  value: unknown;
  updatedAt: Date;
}

/**
 * Generic API success response
 */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

/**
 * Generic API error response
 */
export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: unknown;
}

/**
 * Union API response type
 */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Session info (without sensitive data)
 */
export interface SessionInfo {
  id: string;
  userId: string;
  expiresAt: Date | string;
  userAgent?: string;
  ipAddress?: string;
}

/**
 * Page summary (for list views)
 */
export interface PageSummary {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  type: 'page' | 'post' | 'template';
  authorId: string;
  authorUsername?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * Page detail (including content)
 */
export interface PageDetail extends PageSummary {
  contentJson: Record<string, unknown> | null;
}

/**
 * Media item
 */
export interface MediaItem {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  mimeType: string;
  size: number;
  altText: string | null;
  uploadedBy: string;
  createdAt: Date | string;
}

/**
 * Site setting entry
 */
export interface SiteSettingEntry {
  key: string;
  value: unknown;
  updatedAt: Date | string;
}

/**
 * Health check response
 */
export interface HealthCheckResponse {
  status: 'ok' | 'error';
  timestamp: string;
  version: string;
  uptime: number;
  database: {
    connected: boolean;
    type: string;
    responseTimeMs: number;
  };
  memory: {
    heapUsed: number;
    heapTotal: number;
    rss: number;
  };
}
