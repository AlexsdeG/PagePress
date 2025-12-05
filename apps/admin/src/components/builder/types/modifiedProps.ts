// PagePress v0.0.11 - 2025-12-04
// Modified Props Tracking - Tracks which props were modified by the user

/**
 * Map of property paths that have been modified by the user
 * Key: dot-notation path (e.g., 'typography.fontSize', 'layout.padding')
 * Value: always true when modified
 */
export interface ModifiedPropsMap {
  [propPath: string]: boolean;
}

/**
 * Check if a specific property has been modified by the user
 */
export function isModified(
  modifiedProps: ModifiedPropsMap | undefined,
  propPath: string
): boolean {
  return modifiedProps?.[propPath] === true;
}

/**
 * Mark a property as modified by the user
 */
export function markAsModified(
  modifiedProps: ModifiedPropsMap | undefined,
  propPath: string
): ModifiedPropsMap {
  return {
    ...modifiedProps,
    [propPath]: true,
  };
}

/**
 * Mark a property as unmodified (reset to default)
 */
export function markAsUnmodified(
  modifiedProps: ModifiedPropsMap | undefined,
  propPath: string
): ModifiedPropsMap {
  if (!modifiedProps) return {};
  
  const newMap = { ...modifiedProps };
  delete newMap[propPath];
  return newMap;
}

/**
 * Check if any typography-related props have been modified
 */
export function hasTypographyModifications(
  modifiedProps: ModifiedPropsMap | undefined
): boolean {
  if (!modifiedProps) return false;
  
  return Object.keys(modifiedProps).some((key) =>
    key.startsWith('typography.')
  );
}

/**
 * Check if any layout-related props have been modified
 */
export function hasLayoutModifications(
  modifiedProps: ModifiedPropsMap | undefined
): boolean {
  if (!modifiedProps) return false;
  
  return Object.keys(modifiedProps).some((key) =>
    key.startsWith('layout.')
  );
}

/**
 * Get all modified property paths
 */
export function getModifiedPaths(
  modifiedProps: ModifiedPropsMap | undefined
): string[] {
  if (!modifiedProps) return [];
  return Object.keys(modifiedProps).filter((key) => modifiedProps[key]);
}

/**
 * Merge two ModifiedPropsMap objects
 */
export function mergeModifiedProps(
  base: ModifiedPropsMap | undefined,
  updates: ModifiedPropsMap | undefined
): ModifiedPropsMap {
  return {
    ...base,
    ...updates,
  };
}

export default {
  isModified,
  markAsModified,
  markAsUnmodified,
  hasTypographyModifications,
  hasLayoutModifications,
  getModifiedPaths,
  mergeModifiedProps,
};
