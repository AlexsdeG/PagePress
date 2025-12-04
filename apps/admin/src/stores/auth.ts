// PagePress v0.0.6 - 2025-12-03
// Zustand auth store for managing authentication state

import { create } from 'zustand';
import { api, type User, ApiError } from '../lib/api';

/**
 * Auth store state
 */
interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  /** Flag to prevent multiple concurrent auth checks */
  _authCheckInProgress: boolean;
  /** Flag to track if initial auth check has been done */
  _initialCheckDone: boolean;
}

/**
 * Auth store actions
 */
interface AuthActions {
  /**
   * Check current authentication status
   */
  checkAuth: () => Promise<void>;
  
  /**
   * Login with email and password
   */
  login: (email: string, password: string) => Promise<void>;
  
  /**
   * Register a new account
   */
  register: (username: string, email: string, password: string) => Promise<void>;
  
  /**
   * Logout current session
   */
  logout: () => Promise<void>;
  
  /**
   * Clear any error state
   */
  clearError: () => void;
  
  /**
   * Reset store to initial state
   */
  reset: () => void;
}

/**
 * Initial state
 */
const initialState: AuthState = {
  user: null,
  isLoading: true, // Start loading to check auth on mount
  isAuthenticated: false,
  error: null,
  _authCheckInProgress: false,
  _initialCheckDone: false,
};

/**
 * Auth store combining state and actions
 */
export const useAuthStore = create<AuthState & AuthActions>((set, get) => ({
  ...initialState,
  
  checkAuth: async () => {
    const state = get();
    
    // Prevent multiple concurrent auth checks
    if (state._authCheckInProgress) {
      return;
    }
    
    // If initial check is done and we're authenticated, skip
    if (state._initialCheckDone && state.isAuthenticated) {
      return;
    }
    
    set({ isLoading: true, error: null, _authCheckInProgress: true });
    
    try {
      const response = await api.auth.me();
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        _authCheckInProgress: false,
        _initialCheckDone: true,
      });
    } catch (error) {
      // Not authenticated is not an error state
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        _authCheckInProgress: false,
        _initialCheckDone: true,
      });
    }
  },
  
  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.auth.login({ email, password });
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      const message = error instanceof ApiError
        ? error.data?.message as string || 'Login failed'
        : 'An unexpected error occurred';
      set({
        error: message,
        isLoading: false,
      });
      throw error;
    }
  },
  
  register: async (username: string, email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.auth.register({ username, email, password });
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      const message = error instanceof ApiError
        ? error.data?.message as string || 'Registration failed'
        : 'An unexpected error occurred';
      set({
        error: message,
        isLoading: false,
      });
      throw error;
    }
  },
  
  logout: async () => {
    set({ isLoading: true });
    try {
      await api.auth.logout();
    } catch {
      // Ignore logout errors, clear state anyway
    }
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  },
  
  clearError: () => set({ error: null }),
  
  reset: () => set(initialState),
}));
