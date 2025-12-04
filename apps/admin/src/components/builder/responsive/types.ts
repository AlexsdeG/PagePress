// PagePress v0.0.10 - 2025-12-04
// Responsive design system types and utilities

/**
 * Breakpoint identifiers
 */
export type BreakpointId = 'desktop' | 'tablet' | 'mobile' | 'mobilePortrait';

/**
 * Breakpoint configuration
 */
export interface Breakpoint {
  id: BreakpointId;
  label: string;
  maxWidth: number | null; // null for desktop (base)
  minWidth: number;
  icon: string; // Lucide icon name
}

/**
 * Default breakpoints configuration
 */
export const DEFAULT_BREAKPOINTS: Breakpoint[] = [
  { id: 'desktop', label: 'Desktop', maxWidth: null, minWidth: 993, icon: 'Monitor' },
  { id: 'tablet', label: 'Tablet', maxWidth: 992, minWidth: 769, icon: 'Tablet' },
  { id: 'mobile', label: 'Mobile', maxWidth: 768, minWidth: 480, icon: 'Smartphone' },
  { id: 'mobilePortrait', label: 'Mobile Portrait', maxWidth: 479, minWidth: 0, icon: 'Smartphone' },
];

/**
 * Canvas dimensions for each breakpoint
 */
export const BREAKPOINT_DIMENSIONS: Record<BreakpointId, { width: number; height: number }> = {
  desktop: { width: 1280, height: 900 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 667 },
  mobilePortrait: { width: 320, height: 568 },
};

/**
 * Responsive value - value can be different per breakpoint
 */
export interface ResponsiveValue<T> {
  desktop: T;
  tablet?: T;
  mobile?: T;
  mobilePortrait?: T;
}

/**
 * Check if a value is a responsive value object
 */
export function isResponsiveValue<T>(value: unknown): value is ResponsiveValue<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'desktop' in value &&
    typeof (value as Record<string, unknown>).desktop !== 'undefined'
  );
}

/**
 * Get value for current breakpoint with inheritance
 * Values cascade down: desktop -> tablet -> mobile -> mobilePortrait
 */
export function getBreakpointValue<T>(
  value: T | ResponsiveValue<T>,
  breakpoint: BreakpointId
): T {
  // If not a responsive value, return as-is
  if (!isResponsiveValue<T>(value)) {
    return value;
  }

  // Inheritance chain: mobilePortrait -> mobile -> tablet -> desktop
  const chain: BreakpointId[] = ['desktop', 'tablet', 'mobile', 'mobilePortrait'];
  const startIndex = chain.indexOf(breakpoint);

  // Walk up the chain to find the first defined value
  for (let i = startIndex; i >= 0; i--) {
    const bp = chain[i];
    const bpValue = value[bp];
    if (bpValue !== undefined) {
      return bpValue as T;
    }
  }

  // Fallback to desktop (should always exist)
  return value.desktop;
}

/**
 * Create a responsive value from a plain value
 */
export function createResponsiveValue<T>(value: T): ResponsiveValue<T> {
  return { desktop: value };
}

/**
 * Set a breakpoint-specific value in a responsive value object
 */
export function setBreakpointValue<T>(
  value: T | ResponsiveValue<T>,
  breakpoint: BreakpointId,
  newValue: T
): ResponsiveValue<T> {
  const baseValue = isResponsiveValue<T>(value) ? value : { desktop: value };
  return { ...baseValue, [breakpoint]: newValue };
}

/**
 * Remove a breakpoint-specific value (reset to inherit)
 */
export function removeBreakpointValue<T>(
  value: ResponsiveValue<T>,
  breakpoint: BreakpointId
): ResponsiveValue<T> {
  if (breakpoint === 'desktop') {
    // Cannot remove desktop value, it's the base
    return value;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { [breakpoint]: _removed, ...rest } = value;
  return rest as ResponsiveValue<T>;
}

/**
 * Check if a responsive value has a specific breakpoint override
 */
export function hasBreakpointOverride<T>(
  value: T | ResponsiveValue<T>,
  breakpoint: BreakpointId
): boolean {
  if (!isResponsiveValue<T>(value)) return false;
  if (breakpoint === 'desktop') return true; // Desktop is always defined
  return value[breakpoint] !== undefined;
}

/**
 * Get media query string for a breakpoint
 */
export function getBreakpointMediaQuery(breakpoint: BreakpointId): string {
  const bp = DEFAULT_BREAKPOINTS.find((b) => b.id === breakpoint);
  if (!bp) return '';

  if (breakpoint === 'desktop') {
    return `@media (min-width: ${bp.minWidth}px)`;
  }

  return `@media (max-width: ${bp.maxWidth}px)`;
}
