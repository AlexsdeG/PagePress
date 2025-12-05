// PagePress v0.0.12 - 2025-12-05
// Hook for tracking which properties have been explicitly modified by the user

import { useCallback } from 'react';
import { useNode } from '@craftjs/core';

/**
 * Result from the useModifiedProps hook
 */
interface UseModifiedPropsResult {
  /**
   * Array of property names that have been explicitly modified
   */
  modifiedProps: string[];

  /**
   * Check if a specific property has been modified
   */
  isModified: (propName: string) => boolean;

  /**
   * Mark a property as modified when user changes it
   */
  markAsModified: (propName: string) => void;

  /**
   * Reset a property to its default value (marks as not modified)
   */
  resetProp: (propName: string, defaultValue: unknown) => void;

  /**
   * Reset all properties to defaults
   */
  resetAllProps: (defaults: Record<string, unknown>) => void;

  /**
   * Set a prop value and mark it as modified
   */
  setModifiedProp: <T>(propName: string, value: T) => void;
}

/**
 * Hook for tracking which properties have been explicitly modified
 * 
 * This enables:
 * - Visual indicators for modified fields
 * - Right-click reset to default functionality
 * - Proper inheritance from theme defaults vs component defaults
 * 
 * Usage:
 * ```tsx
 * const { isModified, setModifiedProp, resetProp } = useModifiedProps();
 * 
 * // In settings panel:
 * <Input
 *   value={props.fontSize}
 *   onChange={(e) => setModifiedProp('fontSize', Number(e.target.value))}
 *   className={isModified('fontSize') ? 'border-blue-400' : ''}
 * />
 * 
 * // Reset to default:
 * <button onClick={() => resetProp('fontSize', 16)}>Reset</button>
 * ```
 */
export function useModifiedProps(): UseModifiedPropsResult {
  const {
    actions: { setProp },
    modifiedProps = [],
  } = useNode((node) => ({
    modifiedProps: (node.data.props._modifiedProps as string[]) || [],
  }));

  /**
   * Check if a property has been modified
   */
  const isModified = useCallback(
    (propName: string): boolean => {
      return modifiedProps.includes(propName);
    },
    [modifiedProps]
  );

  /**
   * Mark a property as modified
   */
  const markAsModified = useCallback(
    (propName: string): void => {
      setProp((props: Record<string, unknown>) => {
        const current = (props._modifiedProps as string[]) || [];
        if (!current.includes(propName)) {
          props._modifiedProps = [...current, propName];
        }
      });
    },
    [setProp]
  );

  /**
   * Reset a property to its default value
   */
  const resetProp = useCallback(
    (propName: string, defaultValue: unknown): void => {
      setProp((props: Record<string, unknown>) => {
        // Set the property to its default value
        props[propName] = defaultValue;
        
        // Remove from modified list
        const current = (props._modifiedProps as string[]) || [];
        props._modifiedProps = current.filter((p) => p !== propName);
      });
    },
    [setProp]
  );

  /**
   * Reset all properties to their defaults
   */
  const resetAllProps = useCallback(
    (defaults: Record<string, unknown>): void => {
      setProp((props: Record<string, unknown>) => {
        // Apply all defaults
        for (const [key, value] of Object.entries(defaults)) {
          if (key !== '_modifiedProps') {
            props[key] = value;
          }
        }
        // Clear the modified list
        props._modifiedProps = [];
      });
    },
    [setProp]
  );

  /**
   * Set a prop value and mark it as modified
   */
  const setModifiedProp = useCallback(
    <T>(propName: string, value: T): void => {
      setProp((props: Record<string, unknown>) => {
        // Set the value
        props[propName] = value;
        
        // Add to modified list if not already there
        const current = (props._modifiedProps as string[]) || [];
        if (!current.includes(propName)) {
          props._modifiedProps = [...current, propName];
        }
      });
    },
    [setProp]
  );

  return {
    modifiedProps,
    isModified,
    markAsModified,
    resetProp,
    resetAllProps,
    setModifiedProp,
  };
}

export default useModifiedProps;
