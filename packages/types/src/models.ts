// PagePress v0.0.2 - 2025-11-30

/**
 * User roles in the system
 */
export type UserRole = 'admin' | 'editor';

/**
 * User model interface
 */
export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
}

/**
 * User creation input (without auto-generated fields)
 */
export interface CreateUserInput {
  email: string;
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
 * API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

/**
 * Health check response
 */
export interface HealthCheckResponse {
  status: 'ok' | 'error';
  timestamp: string;
  version: string;
  database: 'connected' | 'disconnected';
}
