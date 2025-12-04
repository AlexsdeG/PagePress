// PagePress v0.0.8 - 2025-12-04
// CSS Class Store for managing global styles

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CSSClassDefinition } from './types';
import type { AdvancedStyling } from '../styles/types';

/**
 * Class store state
 */
interface ClassStoreState {
  /** All defined CSS classes */
  classes: CSSClassDefinition[];
  
  /** Add a new class */
  addClass: (classDefinition: CSSClassDefinition) => void;
  
  /** Update an existing class */
  updateClass: (name: string, updates: Partial<CSSClassDefinition>) => void;
  
  /** Delete a class */
  deleteClass: (name: string) => void;
  
  /** Get a class by name */
  getClass: (name: string) => CSSClassDefinition | undefined;
  
  /** Get classes by category */
  getClassesByCategory: (category: CSSClassDefinition['category']) => CSSClassDefinition[];
  
  /** Create a class from current element styling */
  createClassFromStyling: (name: string, styling: Partial<AdvancedStyling>, options?: {
    label?: string;
    description?: string;
    category?: CSSClassDefinition['category'];
  }) => CSSClassDefinition;
  
  /** Check if a class name is available */
  isNameAvailable: (name: string) => boolean;
  
  /** Search classes by name */
  searchClasses: (query: string) => CSSClassDefinition[];
}

/**
 * Sanitize class name to be valid CSS
 */
export function sanitizeClassName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, '-')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Class store with persistence
 */
export const useClassStore = create<ClassStoreState>()(
  persist(
    (set, get) => ({
      classes: [],
      
      addClass: (classDefinition) => {
        const existing = get().classes.find(c => c.name === classDefinition.name);
        if (existing) {
          console.warn(`Class "${classDefinition.name}" already exists`);
          return;
        }
        
        set((state) => ({
          classes: [...state.classes, classDefinition],
        }));
      },
      
      updateClass: (name, updates) => {
        set((state) => ({
          classes: state.classes.map((c) =>
            c.name === name
              ? { ...c, ...updates, updatedAt: new Date().toISOString() }
              : c
          ),
        }));
      },
      
      deleteClass: (name) => {
        set((state) => ({
          classes: state.classes.filter((c) => c.name !== name),
        }));
      },
      
      getClass: (name) => {
        return get().classes.find((c) => c.name === name);
      },
      
      getClassesByCategory: (category) => {
        return get().classes.filter((c) => c.category === category);
      },
      
      createClassFromStyling: (name, styling, options = {}) => {
        const sanitizedName = sanitizeClassName(name);
        const now = new Date().toISOString();
        
        const classDefinition: CSSClassDefinition = {
          name: sanitizedName,
          label: options.label || name,
          description: options.description,
          styling,
          category: options.category || 'custom',
          createdAt: now,
          updatedAt: now,
        };
        
        // Add to store
        get().addClass(classDefinition);
        
        return classDefinition;
      },
      
      isNameAvailable: (name) => {
        const sanitized = sanitizeClassName(name);
        return !get().classes.some((c) => c.name === sanitized);
      },
      
      searchClasses: (query) => {
        const lowerQuery = query.toLowerCase();
        return get().classes.filter(
          (c) =>
            c.name.toLowerCase().includes(lowerQuery) ||
            (c.label && c.label.toLowerCase().includes(lowerQuery)) ||
            (c.description && c.description.toLowerCase().includes(lowerQuery))
        );
      },
    }),
    {
      name: 'pagepress-css-classes',
    }
  )
);

/**
 * Hook to get styling from applied classes
 */
export function getClassesStyling(classNames: string[]): Partial<AdvancedStyling> {
  const store = useClassStore.getState();
  const result: Partial<AdvancedStyling> = {};
  
  for (const className of classNames) {
    const classDef = store.getClass(className);
    if (classDef) {
      // Deep merge styling
      Object.assign(result, classDef.styling);
    }
  }
  
  return result;
}

/**
 * Check which properties come from which class
 */
export function getPropertySources(
  classNames: string[],
  manualStyling: Partial<AdvancedStyling>
): Map<string, { source: 'class' | 'manual'; className?: string }> {
  const sources = new Map<string, { source: 'class' | 'manual'; className?: string }>();
  const store = useClassStore.getState();
  
  // First, mark all class properties
  for (const className of classNames) {
    const classDef = store.getClass(className);
    if (classDef?.styling) {
      for (const key of Object.keys(classDef.styling)) {
        sources.set(key, { source: 'class', className });
      }
    }
  }
  
  // Then, mark manual overrides
  for (const key of Object.keys(manualStyling)) {
    if (manualStyling[key as keyof AdvancedStyling] !== undefined) {
      sources.set(key, { source: 'manual' });
    }
  }
  
  return sources;
}
