// PagePress v0.0.10 - 2025-12-04
// Global theme settings store

import { create } from 'zustand';
import { api } from '@/lib/api';
import type {
  GlobalThemeSettings,
  GlobalColor,
  PageSettings,
} from './types';

/**
 * Global settings store state
 */
interface GlobalSettingsState {
  // Theme settings
  themeSettings: GlobalThemeSettings | null;
  isLoading: boolean;
  error: string | null;

  // Page settings cache (keyed by pageId)
  pageSettingsCache: Record<string, PageSettings>;

  // Theme actions
  loadThemeSettings: () => Promise<void>;
  updateThemeSettings: (
    settings: Partial<GlobalThemeSettings>
  ) => Promise<void>;

  // Color actions
  addColor: (color: GlobalColor) => Promise<void>;
  updateColor: (id: string, updates: Partial<GlobalColor>) => Promise<void>;
  removeColor: (id: string) => Promise<void>;

  // Page settings actions
  loadPageSettings: (pageId: string) => Promise<PageSettings>;
  updatePageSettings: (
    pageId: string,
    settings: Partial<PageSettings>
  ) => Promise<void>;

  // Utilities
  getColorById: (id: string) => GlobalColor | undefined;
  getColorByName: (name: string) => GlobalColor | undefined;
}

/**
 * Global settings store
 */
export const useGlobalSettingsStore = create<GlobalSettingsState>(
  (set, get) => ({
    themeSettings: null,
    isLoading: false,
    error: null,
    pageSettingsCache: {},

    /**
     * Load theme settings from API
     */
    loadThemeSettings: async () => {
      if (get().themeSettings) return; // Already loaded

      set({ isLoading: true, error: null });

      try {
        const response = await api.theme.get();
        set({
          themeSettings: response.settings as GlobalThemeSettings,
          isLoading: false,
        });
      } catch (error) {
        console.error('Failed to load theme settings:', error);
        set({
          error: 'Failed to load theme settings',
          isLoading: false,
        });
      }
    },

    /**
     * Update theme settings
     */
    updateThemeSettings: async (settings) => {
      const current = get().themeSettings;
      if (!current) return;

      // Optimistic update
      // Deep merge is handled by the API/Backend, but for local state we need to be careful
      // For now, shallow merge is okay as long as we update specific sections
      const newSettings = { ...current, ...settings };
      set({ themeSettings: newSettings as GlobalThemeSettings });

      try {
        await api.theme.update(settings);
      } catch (error) {
        // Revert on error
        set({ themeSettings: current });
        console.error('Failed to update theme settings:', error);
        throw error;
      }
    },

    /**
     * Add a new color
     */
    addColor: async (color) => {
      const current = get().themeSettings;
      if (!current) return;

      const newColors = [...current.colors, color];
      await get().updateThemeSettings({ colors: newColors });
    },

    /**
     * Update an existing color
     */
    updateColor: async (id, updates) => {
      const current = get().themeSettings;
      if (!current) return;

      const newColors = current.colors.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      );
      await get().updateThemeSettings({ colors: newColors });
    },

    /**
     * Remove a color
     */
    removeColor: async (id) => {
      const current = get().themeSettings;
      if (!current) return;

      const newColors = current.colors.filter((c) => c.id !== id);
      await get().updateThemeSettings({ colors: newColors });
    },

    /**
     * Load page settings
     */
    loadPageSettings: async (pageId) => {
      const cached = get().pageSettingsCache[pageId];
      if (cached) return cached;

      try {
        const response = await api.theme.getPageSettings(pageId);
        const settings = response.settings as PageSettings;

        set((state) => ({
          pageSettingsCache: {
            ...state.pageSettingsCache,
            [pageId]: settings,
          },
        }));

        return settings;
      } catch (error) {
        console.error('Failed to load page settings:', error);
        throw error;
      }
    },

    /**
     * Update page settings
     */
    updatePageSettings: async (pageId, settings) => {
      const current = get().pageSettingsCache[pageId] || {};
      const newSettings = { ...current, ...settings };

      // Optimistic update
      set((state) => ({
        pageSettingsCache: {
          ...state.pageSettingsCache,
          [pageId]: newSettings as PageSettings,
        },
      }));

      try {
        await api.theme.updatePageSettings(pageId, settings);
      } catch (error) {
        // Revert on error
        set((state) => ({
          pageSettingsCache: {
            ...state.pageSettingsCache,
            [pageId]: current as PageSettings,
          },
        }));
        console.error('Failed to update page settings:', error);
        throw error;
      }
    },

    /**
     * Get color by ID
     */
    getColorById: (id) => {
      const theme = get().themeSettings;
      return theme?.colors.find((c) => c.id === id);
    },

    /**
     * Get color by name
     */
    getColorByName: (name) => {
      const theme = get().themeSettings;
      return theme?.colors.find(
        (c) => c.name.toLowerCase() === name.toLowerCase()
      );
    },
  })
);
