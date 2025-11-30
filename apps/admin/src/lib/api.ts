// PagePress v0.0.4 - 2025-11-30
// API client for communicating with the backend

/**
 * Base API URL - In development, use the Vite proxy to avoid CORS/cookie issues
 * The proxy is configured in vite.config.ts to forward /api/* to localhost:3000
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * API Error class for handling API errors
 */
export class ApiError extends Error {
  status: number;
  statusText: string;
  data: Record<string, unknown>;
  
  constructor(
    status: number,
    statusText: string,
    data: Record<string, unknown>
  ) {
    super(data.message as string || statusText);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    this.data = data;
  }
}

/**
 * Fetch wrapper with default options for API calls
 */
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    credentials: 'include', // Include cookies for session auth
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  const data = await response.json().catch(() => ({}));
  
  if (!response.ok) {
    throw new ApiError(response.status, response.statusText, data);
  }
  
  return data as T;
}

/**
 * Fetch wrapper for multipart form data (file uploads)
 */
async function fetchApiFormData<T>(
  endpoint: string,
  formData: FormData
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    body: formData,
    // Don't set Content-Type header - browser will set it with boundary
  });
  
  const data = await response.json().catch(() => ({}));
  
  if (!response.ok) {
    throw new ApiError(response.status, response.statusText, data);
  }
  
  return data as T;
}

/**
 * User data returned from API
 */
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'editor';
  createdAt?: string;
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
  contentJson: string;
  published: boolean;
  type: 'page' | 'post' | 'template';
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
  contentJson?: string;
  published?: boolean;
  type?: 'page' | 'post' | 'template';
}

export interface UpdatePageData {
  title?: string;
  slug?: string;
  contentJson?: string;
  published?: boolean;
  type?: 'page' | 'post' | 'template';
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
 * Settings types
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
    register: (data: { username: string; email: string; password: string }) =>
      fetchApi<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    
    /**
     * Login with email and password
     */
    login: (data: { email: string; password: string }) =>
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
     * Upload a file
     */
    upload: (file: File, altText?: string) => {
      const formData = new FormData();
      formData.append('file', file);
      if (altText) formData.append('altText', altText);
      return fetchApiFormData<{ media: Media }>('/media/upload', formData);
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
};
