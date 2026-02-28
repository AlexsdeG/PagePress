// PagePress v0.0.10 - 2025-12-04
// Global settings types

import type { ResponsiveValue } from '../responsive/types';

/**
 * Global color palette entry
 */
export interface GlobalColor {
  id: string;
  name: string;
  value: string; // hex/rgba
  category: 'primary' | 'secondary' | 'accent' | 'neutral' | 'custom';
}

/**
 * Global typography settings
 */
export interface GlobalTypography {
  fontFamily: {
    heading: string;
    body: string;
  };
  baseFontSize: number; // px
  headingSizes: {
    h1: ResponsiveValue<string>;
    h2: ResponsiveValue<string>;
    h3: ResponsiveValue<string>;
    h4: ResponsiveValue<string>;
    h5: ResponsiveValue<string>;
    h6: ResponsiveValue<string>;
  };
  bodyLineHeight: number;
  headingLineHeight: number;
}

/**
 * Global element defaults
 */
export interface GlobalElementDefaults {
  button: {
    padding: string;
    borderRadius: string;
    fontSize: string;
  };
  link: {
    color: string;
    hoverColor: string;
    textDecoration: string;
  };
  container: {
    maxWidth: string;
    padding: string;
  };
  form: {
    inputPadding: string;
    inputBorderRadius: string;
    inputBorderColor: string;
  };
}

/**
 * Breakpoint configuration for theme
 */
export interface ThemeBreakpoint {
  id: string;
  label: string;
  maxWidth: number | null;
  minWidth: number;
}

/**
 * Spacing scale configuration
 */
export interface SpacingConfig {
  base: number; // Base spacing unit in px
  scale: number[]; // Multipliers [0.25, 0.5, 1, 1.5, 2, 3, 4, 6, 8]
}

/**
 * Complete global theme settings
 */
export interface GlobalThemeSettings {
  colors: GlobalColor[];
  typography: GlobalTypography;
  elements: GlobalElementDefaults;
  breakpoints: ThemeBreakpoint[];
  spacing: SpacingConfig;
}

/**
 * Page-specific settings
 */
export interface PageSettings {
  // General settings
  disableHeader: boolean;
  disableFooter: boolean;
  fullWidth?: boolean;
  transparentHeader?: boolean;
  backgroundColor?: string;
  customBodyClass?: string;
  
  // Template assignment
  headerTemplateId?: string;
  footerTemplateId?: string;
  
  // SEO settings
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  noIndex: boolean;
  noFollow: boolean;
  
  // Social/OG settings
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  
  // Custom code
  customCss?: string;
  jsHead?: string;
  jsBody?: string;
  externalCss?: string;
  externalJs?: string;
}

/**
 * Default page settings
 */
export const DEFAULT_PAGE_SETTINGS: PageSettings = {
  disableHeader: false,
  disableFooter: false,
  fullWidth: false,
  transparentHeader: false,
  noIndex: false,
  noFollow: false,
};

/**
 * Default theme settings
 */
export const DEFAULT_THEME_SETTINGS: GlobalThemeSettings = {
  colors: [
    { id: 'primary', name: 'Primary', value: '#3b82f6', category: 'primary' },
    { id: 'secondary', name: 'Secondary', value: '#64748b', category: 'secondary' },
    { id: 'accent', name: 'Accent', value: '#8b5cf6', category: 'accent' },
    { id: 'background', name: 'Background', value: '#ffffff', category: 'neutral' },
    { id: 'foreground', name: 'Foreground', value: '#0f172a', category: 'neutral' },
  ],
  typography: {
    fontFamily: { heading: 'system-ui', body: 'system-ui' },
    baseFontSize: 16,
    headingSizes: {
      h1: { desktop: '3rem' },
      h2: { desktop: '2.25rem' },
      h3: { desktop: '1.875rem' },
      h4: { desktop: '1.5rem' },
      h5: { desktop: '1.25rem' },
      h6: { desktop: '1rem' },
    },
    bodyLineHeight: 1.6,
    headingLineHeight: 1.2,
  },
  elements: {
    button: { padding: '12px 24px', borderRadius: '6px', fontSize: '14px' },
    link: { color: '#3b82f6', hoverColor: '#2563eb', textDecoration: 'none' },
    container: { maxWidth: '1280px', padding: '16px' },
    form: { inputPadding: '8px 12px', inputBorderRadius: '4px', inputBorderColor: '#e5e7eb' },
  },
  breakpoints: [
    { id: 'desktop', label: 'Desktop', maxWidth: null, minWidth: 993 },
    { id: 'tablet', label: 'Tablet', maxWidth: 992, minWidth: 769 },
    { id: 'mobile', label: 'Mobile', maxWidth: 768, minWidth: 480 },
    { id: 'mobilePortrait', label: 'Mobile Portrait', maxWidth: 479, minWidth: 0 },
  ],
  spacing: {
    base: 4,
    scale: [0.25, 0.5, 1, 1.5, 2, 3, 4, 6, 8, 12, 16],
  },
};
