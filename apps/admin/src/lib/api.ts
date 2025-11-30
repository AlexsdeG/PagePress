// PagePress v0.0.3 - 2025-11-30
// API client for communicating with the backend

/**
 * Base API URL - uses environment variable or defaults to localhost
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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
};
