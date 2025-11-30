// PagePress v0.0.3 - 2025-11-30
// Custom hook for auth operations with loading states

import { useEffect } from 'react';
import { useAuthStore } from '../stores/auth';

/**
 * Hook to check authentication status on mount
 * Returns auth state and actions
 */
export function useAuth() {
  const {
    user,
    isLoading,
    isAuthenticated,
    error,
    checkAuth,
    login,
    register,
    logout,
    clearError,
  } = useAuthStore();
  
  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);
  
  return {
    user,
    isLoading,
    isAuthenticated,
    error,
    login,
    register,
    logout,
    clearError,
  };
}

/**
 * Hook to require authentication
 * Returns user data when authenticated, null when not
 */
export function useRequireAuth() {
  const { user, isLoading, isAuthenticated } = useAuthStore();
  
  return {
    user,
    isLoading,
    isAuthenticated,
  };
}
