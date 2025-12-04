// PagePress v0.0.10 - 2025-12-04
// HOC to make inputs responsive-aware

import { useCallback, type ReactNode } from 'react';
import { Label } from '@/components/ui/label';
import { ResponsiveIndicator } from './ResponsiveIndicator';
import { useBreakpointStore } from './breakpointStore';
import {
  getBreakpointValue,
  isResponsiveValue,
  setBreakpointValue,
  removeBreakpointValue,
  type ResponsiveValue,
} from './types';

interface ResponsiveWrapperProps<T> {
  /** Label for the input */
  label: string;
  /** Current value (can be simple or responsive) */
  value: T | ResponsiveValue<T>;
  /** Callback when value changes */
  onChange: (value: T | ResponsiveValue<T>) => void;
  /** Render function for the actual input */
  children: (props: {
    value: T;
    onChange: (newValue: T) => void;
  }) => ReactNode;
  /** Optional class name for the wrapper */
  className?: string;
  /** Whether to hide the label */
  hideLabel?: boolean;
}

/**
 * Wrapper component that makes any input responsive-aware
 * Handles reading the correct value for the current breakpoint
 * and updating only the current breakpoint's value on change
 */
export function ResponsiveWrapper<T>({
  label,
  value,
  onChange,
  children,
  className = '',
  hideLabel = false,
}: ResponsiveWrapperProps<T>) {
  const { currentBreakpoint } = useBreakpointStore();

  // Get the current value for this breakpoint (with inheritance)
  const currentValue = getBreakpointValue(value, currentBreakpoint);

  // Handle value change - only updates the current breakpoint
  const handleChange = useCallback(
    (newValue: T) => {
      if (currentBreakpoint === 'desktop') {
        // Desktop is always the base value
        if (isResponsiveValue<T>(value)) {
          // Keep other breakpoint values, update desktop
          onChange({ ...value, desktop: newValue });
        } else {
          // Convert to simple value or keep as simple
          onChange(newValue);
        }
      } else {
        // Other breakpoints create/update ResponsiveValue
        onChange(setBreakpointValue(value, currentBreakpoint, newValue));
      }
    },
    [currentBreakpoint, value, onChange]
  );

  // Reset current breakpoint to inherit from desktop
  const handleReset = useCallback(() => {
    if (isResponsiveValue<T>(value) && currentBreakpoint !== 'desktop') {
      const newValue = removeBreakpointValue(value, currentBreakpoint);
      onChange(newValue);
    }
  }, [currentBreakpoint, value, onChange]);

  return (
    <div className={`space-y-1.5 ${className}`}>
      {!hideLabel && (
        <div className="flex items-center gap-1">
          <Label className="text-xs">{label}</Label>
          <ResponsiveIndicator value={value} onReset={handleReset} />
        </div>
      )}
      {children({ value: currentValue, onChange: handleChange })}
    </div>
  );
}

/**
 * Hook version for more complex use cases
 */
export function useResponsiveValue<T>(
  value: T | ResponsiveValue<T>,
  onChange: (value: T | ResponsiveValue<T>) => void
) {
  const { currentBreakpoint } = useBreakpointStore();

  const currentValue = getBreakpointValue(value, currentBreakpoint);

  const setValue = useCallback(
    (newValue: T) => {
      if (currentBreakpoint === 'desktop') {
        if (isResponsiveValue<T>(value)) {
          onChange({ ...value, desktop: newValue });
        } else {
          onChange(newValue);
        }
      } else {
        onChange(setBreakpointValue(value, currentBreakpoint, newValue));
      }
    },
    [currentBreakpoint, value, onChange]
  );

  const resetToDesktop = useCallback(() => {
    if (isResponsiveValue<T>(value) && currentBreakpoint !== 'desktop') {
      onChange(removeBreakpointValue(value, currentBreakpoint));
    }
  }, [currentBreakpoint, value, onChange]);

  const hasOverride =
    currentBreakpoint !== 'desktop' &&
    isResponsiveValue<T>(value) &&
    value[currentBreakpoint] !== undefined;

  return {
    value: currentValue,
    setValue,
    resetToDesktop,
    hasOverride,
    currentBreakpoint,
  };
}
