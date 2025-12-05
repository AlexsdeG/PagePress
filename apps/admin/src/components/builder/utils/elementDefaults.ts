// PagePress v0.0.11 - 2025-12-04
// Element Defaults - Provides theme-based defaults for builder components

import type { GlobalThemeSettings } from '../global/types';

/**
 * Component type identifiers
 */
export type ComponentType = 
  | 'Heading'
  | 'Text'
  | 'Button'
  | 'Container'
  | 'Section'
  | 'Row'
  | 'Column'
  | 'Div'
  | 'Link'
  | 'List'
  | 'Image'
  | 'Video'
  | 'Icon'
  | 'IconBox'
  | 'Divider'
  | 'Spacer'
  | 'HTMLBlock';

/**
 * Heading level type
 */
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Default styles returned for an element
 */
export interface ElementDefaults {
  typography?: {
    fontFamily?: string;
    fontSize?: string;
    lineHeight?: number;
    fontWeight?: string;
  };
  layout?: {
    padding?: string;
    maxWidth?: string;
  };
  border?: {
    borderRadius?: string;
  };
  colors?: {
    color?: string;
    hoverColor?: string;
  };
}

/**
 * Get theme-based defaults for a component type
 */
export function getDefaultsForElement(
  componentType: ComponentType,
  themeSettings: GlobalThemeSettings | null,
  options?: { headingLevel?: HeadingLevel }
): ElementDefaults {
  if (!themeSettings) {
    return {};
  }

  switch (componentType) {
    case 'Heading':
      return getHeadingDefaults(themeSettings, options?.headingLevel || 2);

    case 'Text':
      return getTextDefaults(themeSettings);

    case 'Button':
      return getButtonDefaults(themeSettings);

    case 'Container':
    case 'Section':
    case 'Row':
    case 'Column':
    case 'Div':
      return getContainerDefaults(themeSettings);

    case 'Link':
      return getLinkDefaults(themeSettings);

    case 'List':
      return getListDefaults(themeSettings);

    default:
      return {};
  }
}

/**
 * Get defaults for Heading component
 */
function getHeadingDefaults(
  theme: GlobalThemeSettings,
  level: HeadingLevel
): ElementDefaults {
  const headingKey = `h${level}` as keyof typeof theme.typography.headingSizes;
  const headingSize = theme.typography.headingSizes[headingKey];
  
  return {
    typography: {
      fontFamily: theme.typography.fontFamily.heading,
      fontSize: typeof headingSize === 'string' 
        ? headingSize 
        : headingSize?.desktop || getDefaultHeadingSize(level),
      lineHeight: theme.typography.headingLineHeight,
      fontWeight: 'bold',
    },
  };
}

/**
 * Get defaults for Text component
 */
function getTextDefaults(theme: GlobalThemeSettings): ElementDefaults {
  return {
    typography: {
      fontFamily: theme.typography.fontFamily.body,
      fontSize: `${theme.typography.baseFontSize}px`,
      lineHeight: theme.typography.bodyLineHeight,
      fontWeight: 'normal',
    },
  };
}

/**
 * Get defaults for Button component
 */
function getButtonDefaults(theme: GlobalThemeSettings): ElementDefaults {
  return {
    typography: {
      fontSize: theme.elements.button.fontSize,
    },
    layout: {
      padding: theme.elements.button.padding,
    },
    border: {
      borderRadius: theme.elements.button.borderRadius,
    },
  };
}

/**
 * Get defaults for Container-like components
 */
function getContainerDefaults(theme: GlobalThemeSettings): ElementDefaults {
  return {
    layout: {
      padding: theme.elements.container.padding,
      maxWidth: theme.elements.container.maxWidth,
    },
  };
}

/**
 * Get defaults for Link component
 */
function getLinkDefaults(theme: GlobalThemeSettings): ElementDefaults {
  return {
    colors: {
      color: theme.elements.link.color,
      hoverColor: theme.elements.link.hoverColor,
    },
    typography: {
      fontFamily: theme.typography.fontFamily.body,
    },
  };
}

/**
 * Get defaults for List component
 */
function getListDefaults(theme: GlobalThemeSettings): ElementDefaults {
  return {
    typography: {
      fontFamily: theme.typography.fontFamily.body,
      fontSize: `${theme.typography.baseFontSize}px`,
      lineHeight: theme.typography.bodyLineHeight,
    },
  };
}

/**
 * Fallback heading sizes if theme doesn't define them
 */
function getDefaultHeadingSize(level: HeadingLevel): string {
  const sizes: Record<HeadingLevel, string> = {
    1: '3rem',
    2: '2.25rem',
    3: '1.875rem',
    4: '1.5rem',
    5: '1.25rem',
    6: '1rem',
  };
  return sizes[level];
}

/**
 * Convert responsive value to CSS value for current breakpoint
 */
export function getResponsiveValue<T>(
  value: T | { desktop?: T; tablet?: T; mobile?: T; mobilePortrait?: T },
  breakpoint: 'desktop' | 'tablet' | 'mobile' | 'mobilePortrait' = 'desktop'
): T | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }

  // If it's a primitive, return as-is
  if (typeof value !== 'object') {
    return value;
  }

  const responsiveValue = value as { desktop?: T; tablet?: T; mobile?: T; mobilePortrait?: T };

  // Cascade down from larger to smaller breakpoints
  switch (breakpoint) {
    case 'mobilePortrait':
      return responsiveValue.mobilePortrait ?? responsiveValue.mobile ?? responsiveValue.tablet ?? responsiveValue.desktop;
    case 'mobile':
      return responsiveValue.mobile ?? responsiveValue.tablet ?? responsiveValue.desktop;
    case 'tablet':
      return responsiveValue.tablet ?? responsiveValue.desktop;
    case 'desktop':
    default:
      return responsiveValue.desktop;
  }
}

export default getDefaultsForElement;
