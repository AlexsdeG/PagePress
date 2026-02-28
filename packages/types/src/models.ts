// PagePress v0.0.16 - 2026-02-28

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
 * Template type for system templates
 */
export type TemplateType = 'header' | 'footer' | 'notfound' | 'custom';

/**
 * Section template category
 */
export type SectionTemplateCategory =
  | 'hero'
  | 'features'
  | 'cta'
  | 'contact'
  | 'testimonials'
  | 'pricing'
  | 'faq'
  | 'footer'
  | 'header'
  | 'content'
  | 'gallery'
  | 'other';

/**
 * Page summary (for list views)
 */
export interface PageSummary {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  type: 'page' | 'post' | 'template';
  templateType?: TemplateType | null;
  headerTemplateId?: string | null;
  footerTemplateId?: string | null;
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

/**
 * Section template (library item)
 */
export interface SectionTemplateItem {
  id: string;
  name: string;
  description: string | null;
  category: SectionTemplateCategory;
  contentJson: Record<string, unknown>;
  thumbnail: string | null;
  createdBy: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * Global element (synced across pages)
 */
export interface GlobalElementItem {
  id: string;
  name: string;
  contentJson: Record<string, unknown>;
  createdBy: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * Template variable definition
 */
export interface TemplateVariable {
  name: string;
  defaultValue: string;
  type: 'text' | 'image' | 'url' | 'number';
  description?: string;
}

// ─── Dynamic Data & Conditions (Phase 11) ──────────────────────────────

/**
 * Categories of dynamic data sources
 */
export type DynamicDataSourceCategory = 'site' | 'page' | 'user' | 'custom';

/**
 * Available dynamic data field keys
 */
export type DynamicDataField =
  // Site fields
  | 'site.title'
  | 'site.description'
  | 'site.url'
  // Page fields
  | 'page.title'
  | 'page.slug'
  | 'page.date'
  | 'page.author'
  // User fields
  | 'user.name'
  | 'user.email'
  | 'user.role'
  // Custom field (extensible)
  | `custom.${string}`;

/**
 * A dynamic data binding attached to a component prop
 */
export interface DynamicBinding {
  /** The dynamic data field to resolve */
  field: DynamicDataField;
  /** Fallback value if the dynamic data is empty/unavailable */
  fallback: string;
}

/**
 * Map of prop names to their dynamic bindings
 */
export type DynamicBindings = Record<string, DynamicBinding>;

/**
 * Resolved dynamic data values returned by the API
 */
export type ResolvedDynamicData = Record<DynamicDataField, string>;

/**
 * Context for resolving dynamic data on the server
 */
export interface DynamicDataContext {
  pageId?: string;
  userId?: string;
}

/**
 * Dynamic data source descriptor (for the picker UI)
 */
export interface DynamicDataSource {
  field: DynamicDataField;
  label: string;
  category: DynamicDataSourceCategory;
  description: string;
  /** Expected value type — affects rendering */
  valueType: 'text' | 'url' | 'date' | 'image';
}

// ─── Conditional Visibility ────────────────────────────────────────────

/**
 * Condition operators
 */
export type ConditionOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'is_empty'
  | 'is_not_empty';

/**
 * Condition subject — what is being tested
 */
export type ConditionSubject =
  | 'user.logged_in'
  | 'user.logged_out'
  | 'user.role'
  | 'page.is_homepage'
  | 'device.mobile'
  | 'device.tablet'
  | 'device.desktop'
  | `custom.${string}`;

/**
 * A single visibility condition
 */
export interface VisibilityCondition {
  id: string;
  subject: ConditionSubject;
  operator: ConditionOperator;
  /** Comparison value (not needed for boolean subjects) */
  value: string;
}

/**
 * A group of conditions joined by AND or OR
 */
export interface ConditionGroup {
  id: string;
  logic: 'and' | 'or';
  conditions: VisibilityCondition[];
}

/**
 * Complete visibility rules for an element
 */
export interface VisibilityRules {
  /** Whether conditions are enabled */
  enabled: boolean;
  /** Logic between groups: 'and' = all groups must pass, 'or' = any group can pass */
  groupLogic: 'and' | 'or';
  /** Condition groups */
  groups: ConditionGroup[];
}
