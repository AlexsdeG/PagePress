// PagePress v0.0.16 - 2026-02-28
// Dynamic data store — caches resolved dynamic values for the builder

import { create } from 'zustand';
import { api } from '@/lib/api';

interface DynamicDataState {
  /** Resolved field values (e.g. { 'site.title': 'My Site' }) */
  resolvedValues: Record<string, string>;
  /** Whether the store is currently fetching */
  isLoading: boolean;
  /** Last error message */
  error: string | null;
  /** Current page ID context */
  pageId: string | null;

  /** Set the page context for resolution */
  setPageId: (pageId: string | null) => void;
  /** Resolve specific fields from the API */
  resolveFields: (fields: string[]) => Promise<Record<string, string>>;
  /** Resolve all standard fields */
  resolveAll: () => Promise<void>;
  /** Get a resolved value with fallback */
  getValue: (field: string, fallback?: string) => string;
  /** Clear cache */
  clear: () => void;
}

/**
 * All standard fields to resolve
 */
const ALL_FIELDS = [
  'site.title',
  'site.description',
  'site.url',
  'page.title',
  'page.slug',
  'page.date',
  'page.author',
  'user.name',
  'user.email',
  'user.role',
];

export const useDynamicDataStore = create<DynamicDataState>((set, get) => ({
  resolvedValues: {},
  isLoading: false,
  error: null,
  pageId: null,

  setPageId: (pageId) => set({ pageId }),

  resolveFields: async (fields) => {
    if (fields.length === 0) return {};

    set({ isLoading: true, error: null });
    try {
      const { pageId } = get();
      const response = await api.dynamicData.resolve(fields, {
        pageId: pageId ?? undefined,
      });
      const resolved = response.resolved;

      set((state) => ({
        resolvedValues: { ...state.resolvedValues, ...resolved },
        isLoading: false,
      }));

      return resolved;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to resolve dynamic data';
      set({ isLoading: false, error: message });
      return {};
    }
  },

  resolveAll: async () => {
    await get().resolveFields(ALL_FIELDS);
  },

  getValue: (field, fallback = '') => {
    return get().resolvedValues[field] || fallback;
  },

  clear: () => set({ resolvedValues: {}, error: null }),
}));
