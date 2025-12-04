// PagePress v0.0.7 - 2025-12-04
// useAdvancedStyling Hook

import { useCallback, useMemo } from 'react';
import { useNode } from '@craftjs/core';
import type { AdvancedStyling, PseudoState, PseudoStateStyling } from './types';
import { advancedStylingToCSS, mergeStyling } from './styleToCSS';
import { defaultAdvancedStyling } from './types';
import type { CSSProperties } from 'react';

export interface UseAdvancedStylingOptions {
  /** Supported style sections for this component */
  sections?: {
    layout?: boolean;
    typography?: boolean;
    background?: boolean;
    border?: boolean;
    effects?: boolean;
    transform?: boolean;
  };
}

export interface UseAdvancedStylingReturn {
  /** Current styling values */
  styling: AdvancedStyling;
  /** Update the entire styling object */
  setStyling: (styling: Partial<AdvancedStyling>) => void;
  /** Update a specific style category */
  updateCategory: <K extends keyof AdvancedStyling>(
    category: K,
    value: AdvancedStyling[K]
  ) => void;
  /** Get CSS properties from current styling */
  getStyles: () => CSSProperties;
  /** Get CSS properties for a specific pseudo state */
  getStylesForState: (state: PseudoState) => CSSProperties;
  /** Pseudo state styling if available */
  pseudoStateStyling: PseudoStateStyling | undefined;
  /** Update pseudo state styling */
  setPseudoStateStyling: (state: PseudoState, styling: Partial<AdvancedStyling>) => void;
}

/**
 * Hook to manage advanced styling for a component
 * Provides read/write access to styling props through Craft.js
 */
export function useAdvancedStyling(
  options: UseAdvancedStylingOptions = {}
): UseAdvancedStylingReturn {
  const {
    actions: { setProp },
    styling,
    pseudoStateStyling,
  } = useNode((node) => ({
    styling: (node.data.props.advancedStyling || {}) as AdvancedStyling,
    pseudoStateStyling: node.data.props.pseudoStateStyling as PseudoStateStyling | undefined,
  }));

  // Merge with defaults
  const mergedStyling = useMemo(() => {
    return mergeStyling(defaultAdvancedStyling, styling);
  }, [styling]);

  // Set entire styling object
  const setStyling = useCallback(
    (newStyling: Partial<AdvancedStyling>) => {
      setProp((props: Record<string, unknown>) => {
        props.advancedStyling = { ...styling, ...newStyling };
      });
    },
    [setProp, styling]
  );

  // Update a specific category
  const updateCategory = useCallback(
    <K extends keyof AdvancedStyling>(category: K, value: AdvancedStyling[K]) => {
      setProp((props: Record<string, unknown>) => {
        props.advancedStyling = {
          ...styling,
          [category]: value,
        };
      });
    },
    [setProp, styling]
  );

  // Get CSS properties from current styling
  const getStyles = useCallback((): CSSProperties => {
    return advancedStylingToCSS(mergedStyling);
  }, [mergedStyling]);

  // Get styles for a specific pseudo state
  const getStylesForState = useCallback(
    (state: PseudoState): CSSProperties => {
      if (state === 'default' || !pseudoStateStyling) {
        return getStyles();
      }

      const stateKey = state === 'focus-within' ? 'focusWithin' : state;
      const stateStyles = pseudoStateStyling[stateKey as keyof PseudoStateStyling];

      if (!stateStyles || typeof stateStyles !== 'object') {
        return getStyles();
      }

      const merged = mergeStyling(mergedStyling, stateStyles as Partial<AdvancedStyling>);
      return advancedStylingToCSS(merged);
    },
    [getStyles, mergedStyling, pseudoStateStyling]
  );

  // Update pseudo state styling
  const setPseudoStateStyling = useCallback(
    (state: PseudoState, newStyling: Partial<AdvancedStyling>) => {
      if (state === 'default') {
        setStyling(newStyling);
        return;
      }

      const stateKey = state === 'focus-within' ? 'focusWithin' : state;
      
      setProp((props: Record<string, unknown>) => {
        const current = (props.pseudoStateStyling || {
          default: props.advancedStyling || {},
        }) as PseudoStateStyling;
        
        props.pseudoStateStyling = {
          ...current,
          [stateKey]: newStyling,
        };
      });
    },
    [setProp, setStyling]
  );

  return {
    styling: mergedStyling,
    setStyling,
    updateCategory,
    getStyles,
    getStylesForState,
    pseudoStateStyling,
    setPseudoStateStyling,
  };
}

/**
 * Helper hook to generate CSS classes for pseudo states
 * Returns an object that can be spread into a style tag or CSS-in-JS
 */
export function useAdvancedStylesCSS(): CSSProperties {
  const { getStyles } = useAdvancedStyling();
  return getStyles();
}

/**
 * Factory function to create a settings component with advanced styling
 */
export function createAdvancedSettings<P extends object>(
  ContentSettings: React.ComponentType<{ props: P; setProp: (cb: (props: P) => void) => void }>,
  options: UseAdvancedStylingOptions = {}
) {
  return function AdvancedSettings() {
    const {
      actions: { setProp },
      props,
      styling,
    } = useNode((node) => ({
      props: node.data.props as P,
      styling: (node.data.props.advancedStyling || {}) as AdvancedStyling,
    }));

    const handleStylingChange = useCallback(
      (newStyling: Partial<AdvancedStyling>) => {
        setProp((p: Record<string, unknown>) => {
          p.advancedStyling = { ...styling, ...newStyling };
        });
      },
      [setProp, styling]
    );

    // Import SettingsTabsWrapper dynamically to avoid circular deps
    const { SettingsTabsWrapper } = require('./SettingsTabsWrapper');

    return (
      <SettingsTabsWrapper
        contentSettings={<ContentSettings props={props} setProp={setProp} />}
        componentName="Component"
        styling={styling}
        onStylingChange={handleStylingChange}
        sections={options.sections}
      />
    );
  };
}
