// PagePress v0.0.16 - 2026-02-28
// useDynamicValue — hook for resolving dynamic bindings in builder components

import { useEffect, useMemo } from 'react';
import { useDynamicDataStore } from './dynamicDataStore';
import type { DynamicBindings } from './types';

/**
 * Resolves the effective value of a prop, checking dynamic bindings first.
 *
 * @param propName - The prop name to resolve (e.g. 'text', 'src')
 * @param staticValue - The static prop value
 * @param bindings - Dynamic bindings map from the component props
 * @returns The resolved value (dynamic if bound, otherwise static)
 */
export function useDynamicValue(
  propName: string,
  staticValue: string,
  bindings?: DynamicBindings
): string {
  const resolveFields = useDynamicDataStore((s) => s.resolveFields);
  const resolvedValues = useDynamicDataStore((s) => s.resolvedValues);

  const binding = bindings?.[propName];

  // Trigger resolution for the bound field
  useEffect(() => {
    if (binding?.field) {
      const field = binding.field;
      // Only resolve if not already cached
      if (!(field in resolvedValues)) {
        resolveFields([field]);
      }
    }
  }, [binding?.field, resolvedValues, resolveFields]);

  return useMemo(() => {
    if (!binding) return staticValue;
    const resolved = resolvedValues[binding.field];
    if (resolved !== undefined && resolved !== '') return resolved;
    return binding.fallback || staticValue;
  }, [binding, staticValue, resolvedValues]);
}

/**
 * Resolves all dynamic bindings for a component's props at once.
 *
 * @param props - Record of prop names to static values
 * @param bindings - Dynamic bindings map
 * @returns Record of prop names to resolved values
 */
export function useDynamicValues(
  props: Record<string, string>,
  bindings?: DynamicBindings
): Record<string, string> {
  const resolveFields = useDynamicDataStore((s) => s.resolveFields);
  const resolvedValues = useDynamicDataStore((s) => s.resolvedValues);

  // Collect all bound fields
  const boundFields = useMemo(() => {
    if (!bindings) return [];
    return Object.values(bindings)
      .map((b) => b.field)
      .filter((f) => !(f in resolvedValues));
  }, [bindings, resolvedValues]);

  // Trigger resolution
  useEffect(() => {
    if (boundFields.length > 0) {
      resolveFields(boundFields);
    }
  }, [boundFields, resolveFields]);

  return useMemo(() => {
    const result: Record<string, string> = { ...props };
    if (!bindings) return result;

    for (const [propName, binding] of Object.entries(bindings)) {
      const resolved = resolvedValues[binding.field];
      if (resolved !== undefined && resolved !== '') {
        result[propName] = resolved;
      } else if (binding.fallback) {
        result[propName] = binding.fallback;
      }
    }
    return result;
  }, [props, bindings, resolvedValues]);
}
