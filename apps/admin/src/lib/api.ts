// PagePress v0.0.18 - 2026-03-01
// API client for communicating with the backend — hardened with 401 interceptor, timeout, abort

/**
 * Base API URL - In development, use the Vite proxy to avoid CORS/cookie issues
 * The proxy is configured in vite.config.ts to forward /api/* to localhost:3000
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || '/pp-admin/api';

/**
 * Default request timeout in milliseconds
 */
const DEFAULT_TIMEOUT_MS = 30_000;

/**
 * API Error class for handling API errors
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data?: Record<string, unknown>
  ) {
    super((data?.error as string) || (data?.message as string) || statusText);
    this.name = 'ApiError';
  }
}

/**
 * Callback invoked when a 401 response is received (session expired).
 * Set by the auth store to trigger logout & redirect.
 */
let onUnauthorized: (() => void) | null = null;

/**
 * Register a callback to be invoked on 401 responses.
 */
export function setOnUnauthorized(cb: (() => void) | null): void {
  onUnauthorized = cb;
}

/**
 * Unwrap the `{ success, data }` envelope. If the response contains a
 * `success: true` wrapper, return `data`; otherwise return the raw body.
 * This provides backward compatibility during the migration.
 */
function unwrapResponse<T>(body: Record<string, unknown>): T {
  if (body.success === true && 'data' in body) {
    return body.data as T;
  }
  return body as T;
}

/**
 * Fetch wrapper with default options for API calls
 */
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  // Only set Content-Type for requests with a body
  const headers: HeadersInit = options.body
    ? { 'Content-Type': 'application/json', ...options.headers }
    : { ...options.headers };

  // Timeout via AbortController
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers,
      signal: options.signal ?? controller.signal,
    });

    const data = await response.json().catch(() => ({})) as Record<string, unknown>;

    if (!response.ok) {
      // 401 interceptor — notify auth store to clear session
      if (response.status === 401 && onUnauthorized && !endpoint.startsWith('/auth/')) {
        onUnauthorized();
      }

      throw new ApiError(response.status, response.statusText, data);
    }

    return unwrapResponse<T>(data);
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Fetch wrapper for multipart form data (file uploads)
 */
async function fetchApiFormData<T>(
  endpoint: string,
  formData: FormData
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS * 2); // double for uploads

  try {
    const response = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      body: formData,
      signal: controller.signal,
    });

    const data = await response.json().catch(() => ({})) as Record<string, unknown>;

    if (!response.ok) {
      if (response.status === 401 && onUnauthorized) {
        onUnauthorized();
      }
      throw new ApiError(response.status, response.statusText, data);
    }

    return unwrapResponse<T>(data);
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * User data returned from API
 */
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  roleId?: string | null;
  avatarUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
  lockedAt?: string | null;
  failedLoginAttempts?: number;
}

/**
 * Auth response types
 */
export interface AuthResponse {
  message: string;
  user: User;
}

export interface MeResponse {
  user: User;
}

/**
 * Health check response
 */
export interface HealthResponse {
  status: string;
  timestamp: string;
  version: string;
  uptime: number;
  responseTimeMs: number;
  database: {
    connected: boolean;
    type: string;
  };
  memory: {
    heapUsed: number;
    heapTotal: number;
    rss: number;
  };
}

/**
 * Page types
 */
export interface Page {
  id: string;
  title: string;
  slug: string;
  contentJson: Record<string, unknown> | null;
  published: boolean;
  isHomepage: boolean;
  type: 'page' | 'post' | 'template';
  templateType?: 'header' | 'footer' | 'notfound' | 'custom' | null;
  headerTemplateId?: string | null;
  footerTemplateId?: string | null;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: string;
    username: string;
  };
}

export interface PageListResponse {
  pages: Page[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreatePageData {
  title: string;
  slug?: string;
  contentJson?: Record<string, unknown>;
  published?: boolean;
  type?: 'page' | 'post' | 'template';
  isHomepage?: boolean;
}

export interface UpdatePageData {
  title?: string;
  slug?: string;
  contentJson?: Record<string, unknown>;
  published?: boolean;
  type?: 'page' | 'post' | 'template';
  isHomepage?: boolean;
}

/**
 * Template types
 */
export type TemplateType = 'header' | 'footer' | 'notfound' | 'custom';

export interface TemplateListResponse {
  templates: Page[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateTemplateData {
  title: string;
  slug?: string;
  contentJson?: Record<string, unknown>;
  published?: boolean;
  templateType?: TemplateType;
}

export interface UpdateTemplateData {
  title?: string;
  slug?: string;
  contentJson?: Record<string, unknown>;
  published?: boolean;
  templateType?: TemplateType;
}

/**
 * Section template types
 */
export type SectionTemplateCategory =
  | 'hero' | 'features' | 'cta' | 'contact' | 'testimonials'
  | 'pricing' | 'faq' | 'footer' | 'header' | 'content' | 'gallery' | 'other';

export interface SectionTemplate {
  id: string;
  name: string;
  description: string | null;
  category: SectionTemplateCategory;
  contentJson: Record<string, unknown>;
  thumbnail: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface SectionTemplateListResponse {
  sectionTemplates: SectionTemplate[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateSectionTemplateData {
  name: string;
  description?: string;
  category?: SectionTemplateCategory;
  contentJson: Record<string, unknown>;
  thumbnail?: string;
}

export interface UpdateSectionTemplateData {
  name?: string;
  description?: string | null;
  category?: SectionTemplateCategory;
  contentJson?: Record<string, unknown>;
  thumbnail?: string | null;
}

/**
 * Global element types
 */
export interface GlobalElement {
  id: string;
  name: string;
  contentJson: Record<string, unknown>;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Media types
 */
export interface Media {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  mimeType: string;
  size: number;
  altText: string | null;
  uploadedBy: string;
  createdAt: string;
}

export interface MediaListResponse {
  media: Media[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Settings endpoints
 */
export interface SiteSettings {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  logoUrl: string;
  faviconUrl: string;
  theme: {
    primaryColor: string;
    fontFamily: string;
  };
  seo: {
    titleSeparator: string;
    defaultMetaDescription: string;
  };
  social: {
    twitter: string;
    facebook: string;
    instagram: string;
    linkedin: string;
  };
  analytics: {
    googleAnalyticsId: string;
  };
}

export interface SettingsResponse {
  settings: SiteSettings;
}

/**
 * Theme settings types
 * Re-export from global types for API usage
 */
export type { GlobalColor, GlobalTypography, GlobalThemeSettings, PageSettings, ThemeBreakpoint, SpacingConfig } from '@/components/builder/global/types';

import type { GlobalThemeSettings, PageSettings } from '@/components/builder/global/types';

export interface ThemeSettingsResponse {
  settings: GlobalThemeSettings;
}

export interface PageSettingsResponse {
  settings: PageSettings;
}

/**
 * Dynamic data source item (from API)
 */
export interface DynamicDataSourceItem {
  field: string;
  label: string;
  category: 'site' | 'page' | 'user' | 'custom';
  description: string;
  valueType: 'text' | 'url' | 'date' | 'image';
}

/**
 * User list response
 */
export interface UserListResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Role types
 */
export interface Role {
  id: string;
  name: string;
  description: string | null;
  permissions: Record<string, boolean>;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Invite types
 */
export interface Invite {
  id: string;
  token: string;
  email: string | null;
  role: 'admin' | 'editor' | 'viewer';
  usedAt: string | null;
  usedBy: string | null;
  createdBy: string;
  createdByUsername?: string;
  expiresAt: string;
  createdAt: string;
}

/**
 * Activity log entry
 */
export interface ActivityLogEntry {
  id: string;
  userId: string | null;
  username: string;
  action: string;
  entityType: string | null;
  entityId: string | null;
  entityName: string | null;
  details: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
}

export interface ActivityLogListResponse {
  logs: ActivityLogEntry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * API client object with all endpoints
 */
export const api = {
  /**
   * Health check endpoints
   */
  health: {
    check: () => fetchApi<HealthResponse>('/health'),
  },
  
  /**
   * Authentication endpoints
   */
  auth: {
    /**
     * Register a new user
     */
    register: (data: { username: string; email: string; password: string; inviteToken?: string; siteName?: string }) =>
      fetchApi<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    
    /**
     * Login with email/username and password
     */
    login: (data: { identifier: string; password: string }) =>
      fetchApi<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    
    /**
     * Logout current session
     */
    logout: () =>
      fetchApi<{ message: string }>('/auth/logout', {
        method: 'POST',
      }),
    
    /**
     * Get current authenticated user
     */
    me: () => fetchApi<MeResponse>('/auth/me'),
    
    /**
     * Refresh session token
     */
    refresh: () =>
      fetchApi<{ message: string; expiresAt: string }>('/auth/refresh', {
        method: 'POST',
      }),

    /**
     * Check setup status (public)
     */
    setupStatus: () =>
      fetchApi<{ setupComplete: boolean }>('/auth/setup-status'),

    /**
     * Update current user profile
     */
    updateProfile: (data: { username?: string; email?: string; currentPassword?: string; newPassword?: string }) =>
      fetchApi<{ user: User }>('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },

  /**
   * Pages endpoints
   */
  pages: {
    /**
     * List all pages with pagination
     */
    list: (params?: { page?: number; limit?: number; type?: string; published?: boolean; search?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', params.page.toString());
      if (params?.limit) searchParams.set('limit', params.limit.toString());
      if (params?.type) searchParams.set('type', params.type);
      if (params?.published !== undefined) searchParams.set('published', params.published.toString());
      if (params?.search) searchParams.set('search', params.search);
      const query = searchParams.toString();
      return fetchApi<PageListResponse>(`/pages${query ? `?${query}` : ''}`);
    },

    /**
     * Get a single page by ID
     */
    get: (id: string) => fetchApi<{ page: Page }>(`/pages/${id}`),

    /**
     * Get a page by slug
     */
    getBySlug: (slug: string) => fetchApi<{ page: Page }>(`/pages/slug/${slug}`),

    /**
     * Create a new page
     */
    create: (data: CreatePageData) =>
      fetchApi<{ page: Page }>('/pages', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    /**
     * Update a page
     */
    update: (id: string, data: UpdatePageData) =>
      fetchApi<{ page: Page }>(`/pages/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    /**
     * Delete a page
     */
    delete: (id: string) =>
      fetchApi<{ message: string }>(`/pages/${id}`, {
        method: 'DELETE',
      }),

    /**
     * Duplicate a page
     */
    duplicate: (id: string) =>
      fetchApi<{ page: Page }>(`/pages/${id}/duplicate`, {
        method: 'POST',
      }),
  },

  /**
   * Media endpoints
   */
  media: {
    /**
     * List all media with pagination
     */
    list: (params?: { page?: number; limit?: number; type?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', params.page.toString());
      if (params?.limit) searchParams.set('limit', params.limit.toString());
      if (params?.type) searchParams.set('type', params.type);
      const query = searchParams.toString();
      return fetchApi<MediaListResponse>(`/media${query ? `?${query}` : ''}`);
    },

    /**
     * Upload a file - Fixed: Changed from /media/upload to /media
     */
    upload: (file: File, altText?: string) => {
      const formData = new FormData();
      formData.append('file', file);
      if (altText) formData.append('altText', altText);
      return fetchApiFormData<{ media: Media }>('/media', formData);
    },

    /**
     * Delete a media file
     */
    delete: (id: string) =>
      fetchApi<{ message: string }>(`/media/${id}`, {
        method: 'DELETE',
      }),
  },

  /**
   * Settings endpoints
   */
  settings: {
    /**
     * Get current settings (admin)
     */
    get: () => fetchApi<SettingsResponse>('/settings'),

    /**
     * Get public settings (no auth required)
     */
    getPublic: () => fetchApi<SettingsResponse>('/settings/public'),

    /**
     * Update settings
     */
    update: (data: Partial<SiteSettings>) =>
      fetchApi<SettingsResponse>('/settings', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },

  /**
   * Theme endpoints - global styling and page settings
   */
  theme: {
    /**
     * Get global theme settings
     */
    get: () => fetchApi<ThemeSettingsResponse>('/theme'),

    /**
     * Update global theme settings
     */
    update: (data: Partial<GlobalThemeSettings>) =>
      fetchApi<ThemeSettingsResponse>('/theme', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    /**
     * Get page-specific settings
     */
    getPageSettings: (pageId: string) =>
      fetchApi<PageSettingsResponse>(`/theme/page/${pageId}`),

    /**
     * Update page-specific settings
     */
    updatePageSettings: (pageId: string, data: Partial<PageSettings>) =>
      fetchApi<PageSettingsResponse>(`/theme/page/${pageId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },

  /**
   * Template endpoints — page-level templates (header, footer, 404, custom)
   */
  templates: {
    list: (params?: { page?: number; limit?: number; templateType?: string; search?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', params.page.toString());
      if (params?.limit) searchParams.set('limit', params.limit.toString());
      if (params?.templateType) searchParams.set('templateType', params.templateType);
      if (params?.search) searchParams.set('search', params.search);
      const query = searchParams.toString();
      return fetchApi<TemplateListResponse>(`/templates${query ? `?${query}` : ''}`);
    },

    get: (id: string) => fetchApi<{ template: Page }>(`/templates/${id}`),

    create: (data: CreateTemplateData) =>
      fetchApi<{ template: Page }>('/templates', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: (id: string, data: UpdateTemplateData) =>
      fetchApi<{ template: Page }>(`/templates/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    delete: (id: string) =>
      fetchApi<{ message: string }>(`/templates/${id}`, {
        method: 'DELETE',
      }),

    duplicate: (id: string) =>
      fetchApi<{ template: Page }>(`/templates/${id}/duplicate`, {
        method: 'POST',
      }),

    assign: (pageId: string, data: { headerTemplateId?: string | null; footerTemplateId?: string | null }) =>
      fetchApi<{ message: string }>(`/templates/assign/${pageId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    getSystem: () =>
      fetchApi<{ systemTemplates: Record<string, Page | null> }>('/templates/system'),
  },

  /**
   * Section template endpoints — reusable saved blocks/sections
   */
  sectionTemplates: {
    list: (params?: { page?: number; limit?: number; category?: string; search?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', params.page.toString());
      if (params?.limit) searchParams.set('limit', params.limit.toString());
      if (params?.category) searchParams.set('category', params.category);
      if (params?.search) searchParams.set('search', params.search);
      const query = searchParams.toString();
      return fetchApi<SectionTemplateListResponse>(`/section-templates${query ? `?${query}` : ''}`);
    },

    getCategories: () =>
      fetchApi<{ categories: Record<string, number> }>('/section-templates/categories'),

    get: (id: string) => fetchApi<{ sectionTemplate: SectionTemplate }>(`/section-templates/${id}`),

    create: (data: CreateSectionTemplateData) =>
      fetchApi<{ sectionTemplate: SectionTemplate }>('/section-templates', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: (id: string, data: UpdateSectionTemplateData) =>
      fetchApi<{ sectionTemplate: SectionTemplate }>(`/section-templates/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    delete: (id: string) =>
      fetchApi<{ message: string }>(`/section-templates/${id}`, {
        method: 'DELETE',
      }),

    import: (templates: Array<{ name: string; description?: string; category?: string; contentJson: Record<string, unknown> }>) =>
      fetchApi<{ imported: Array<{ id: string; name: string }>; count: number }>('/section-templates/import', {
        method: 'POST',
        body: JSON.stringify({ templates }),
      }),

    export: (params?: { ids?: string[]; category?: string }) =>
      fetchApi<{ templates: Array<{ name: string; description: string | null; category: string; contentJson: Record<string, unknown> }>; count: number }>('/section-templates/export', {
        method: 'POST',
        body: JSON.stringify(params ?? {}),
      }),
  },

  /**
   * Global element endpoints — elements synced across all page instances
   */
  globalElements: {
    list: (params?: { search?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.search) searchParams.set('search', params.search);
      const query = searchParams.toString();
      return fetchApi<{ globalElements: GlobalElement[] }>(`/global-elements${query ? `?${query}` : ''}`);
    },

    get: (id: string) => fetchApi<{ globalElement: GlobalElement }>(`/global-elements/${id}`),

    create: (data: { name: string; contentJson: Record<string, unknown> }) =>
      fetchApi<{ globalElement: GlobalElement }>('/global-elements', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: (id: string, data: { name?: string; contentJson?: Record<string, unknown> }) =>
      fetchApi<{ globalElement: GlobalElement }>(`/global-elements/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    delete: (id: string) =>
      fetchApi<{ message: string }>(`/global-elements/${id}`, {
        method: 'DELETE',
      }),
  },

  /**
   * Dynamic data endpoints — resolve dynamic tags and list available sources
   */
  dynamicData: {
    /**
     * Resolve dynamic data fields to their current values
     */
    resolve: (fields: string[], context?: { pageId?: string; userId?: string }) =>
      fetchApi<{ resolved: Record<string, string> }>('/dynamic-data/resolve', {
        method: 'POST',
        body: JSON.stringify({ fields, context }),
      }),

    /**
     * Get available dynamic data sources for the picker UI
     */
    sources: () =>
      fetchApi<{ sources: DynamicDataSourceItem[] }>('/dynamic-data/sources'),
  },

  /**
   * Users management endpoints (admin only)
   */
  users: {
    list: (params?: { page?: number; limit?: number; search?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', params.page.toString());
      if (params?.limit) searchParams.set('limit', params.limit.toString());
      if (params?.search) searchParams.set('search', params.search);
      const query = searchParams.toString();
      return fetchApi<UserListResponse>(`/users${query ? `?${query}` : ''}`);
    },

    get: (id: string) => fetchApi<{ user: User }>(`/users/${id}`),

    create: (data: { username: string; email: string; password: string; role?: string }) =>
      fetchApi<{ user: User }>('/users', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: (id: string, data: { username?: string; email?: string; role?: string; password?: string }) =>
      fetchApi<{ user: User }>(`/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    delete: (id: string) =>
      fetchApi<{ message: string }>(`/users/${id}`, {
        method: 'DELETE',
      }),

    unlock: (id: string) =>
      fetchApi<{ message: string }>(`/users/${id}/unlock`, {
        method: 'POST',
      }),
  },

  /**
   * Roles management endpoints
   */
  roles: {
    list: () => fetchApi<{ roles: Role[] }>('/roles'),

    get: (id: string) => fetchApi<{ role: Role }>(`/roles/${id}`),

    create: (data: { name: string; description?: string; permissions: Record<string, boolean> }) =>
      fetchApi<{ role: Role }>('/roles', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: (id: string, data: { name?: string; description?: string | null; permissions?: Record<string, boolean> }) =>
      fetchApi<{ role: Role }>(`/roles/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    delete: (id: string) =>
      fetchApi<{ message: string }>(`/roles/${id}`, {
        method: 'DELETE',
      }),
  },

  /**
   * Invite management endpoints
   */
  invites: {
    list: () => fetchApi<{ invites: Invite[] }>('/invites'),

    create: (data: { email?: string; role?: string; expiresInHours?: number }) =>
      fetchApi<{ invite: Invite }>('/invites', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    validate: (token: string) =>
      fetchApi<{ invite: { email: string | null; role: string; expiresAt: string } }>(`/invites/validate/${token}`),

    delete: (id: string) =>
      fetchApi<{ message: string }>(`/invites/${id}`, {
        method: 'DELETE',
      }),
  },

  /**
   * Activity logs endpoints
   */
  activityLogs: {
    list: (params?: { page?: number; limit?: number; action?: string; userId?: string; entityType?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', params.page.toString());
      if (params?.limit) searchParams.set('limit', params.limit.toString());
      if (params?.action) searchParams.set('action', params.action);
      if (params?.userId) searchParams.set('userId', params.userId);
      if (params?.entityType) searchParams.set('entityType', params.entityType);
      const query = searchParams.toString();
      return fetchApi<ActivityLogListResponse>(`/activity-logs${query ? `?${query}` : ''}`);
    },
  },
};
