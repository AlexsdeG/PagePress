// PagePress v0.0.9 - 2025-12-04
// Element Settings Sidebar Types - Complete Bricks-style implementation

import type { AdvancedStyling, PseudoClass } from '../styles/types';
export type { AdvancedStyling, PseudoClass };

/**
 * Element metadata stored with each component
 */
export interface ElementMetadata {
  /** Custom display name (e.g., "HeaderContainer" for a Div) */
  customName?: string;
  /** Unique element ID (auto-generated, readonly) */
  elementId: string;
  /** Applied CSS class names */
  appliedClasses: string[];
  /** Custom HTML attributes (name/value pairs) */
  customAttributes?: CustomAttribute[];
  /** Custom CSS for this element */
  customCSS?: string;
}

/**
 * Custom HTML attribute
 */
export interface CustomAttribute {
  id: string;
  name: string;
  value: string;
}

/**
 * CSS class definition stored globally
 */
export interface CSSClassDefinition {
  /** Unique class name (e.g., "primary-button") */
  name: string;
  /** Human-readable label */
  label?: string;
  /** Description of the class */
  description?: string;
  /** The styling properties this class applies */
  styling: Partial<AdvancedStyling>;
  /** When the class was created */
  createdAt: string;
  /** When the class was last modified */
  updatedAt: string;
  /** Category for organization */
  category?: 'layout' | 'typography' | 'background' | 'border' | 'effects' | 'custom';
}

/**
 * Icon sidebar tab IDs - Extended for full Bricks-like experience
 */
export type SettingsTabId =
  | 'content'
  | 'general'
  | 'layout'
  | 'typography'
  | 'background'
  | 'border'
  | 'effects'
  | 'transform'
  | 'attributes'
  | 'css'
  | 'conditions';

/**
 * Tab configuration for the icon sidebar
 */
export interface SettingsTab {
  id: SettingsTabId;
  label: string;
  icon: string;
  description?: string;
}

/**
 * Available pseudo-classes with labels
 */
export const PSEUDO_CLASS_OPTIONS: { value: PseudoClass; label: string }[] = [
  { value: 'default', label: 'Default' },
  { value: 'hover', label: ':hover' },
  { value: 'active', label: ':active' },
  { value: 'focus', label: ':focus' },
  { value: 'focus-within', label: ':focus-within' },
  { value: 'focus-visible', label: ':focus-visible' },
  { value: 'visited', label: ':visited' },
  { value: 'disabled', label: ':disabled' },
  { value: 'first-child', label: ':first-child' },
  { value: 'last-child', label: ':last-child' },
  { value: 'before', label: '::before' },
  { value: 'after', label: '::after' },
];

/**
 * Default tabs configuration - All available tabs
 */
export const ALL_SETTINGS_TABS: SettingsTab[] = [
  { id: 'content', label: 'Content', icon: 'FileText', description: 'Component-specific content settings' },
  { id: 'general', label: 'General', icon: 'Settings', description: 'Element name, ID, classes, and pseudo-states' },
  { id: 'layout', label: 'Layout', icon: 'LayoutGrid', description: 'Display, position, dimensions, spacing' },
  { id: 'typography', label: 'Typography', icon: 'Type', description: 'Font, text styling, shadows' },
  { id: 'background', label: 'Background', icon: 'Paintbrush', description: 'Colors, gradients, images, videos' },
  { id: 'border', label: 'Border', icon: 'Square', description: 'Border styles, radius, box shadow' },
  { id: 'effects', label: 'Effects', icon: 'Sparkles', description: 'Filters, backdrop filters, opacity' },
  { id: 'transform', label: 'Transform', icon: 'Move3d', description: 'Transform, transitions, animations' },
  { id: 'attributes', label: 'Attributes', icon: 'Code', description: 'Custom HTML attributes' },
  { id: 'css', label: 'CSS', icon: 'Braces', description: 'Custom CSS code' },
  { id: 'conditions', label: 'Conditions', icon: 'Eye', description: 'Conditional visibility rules' },
];

/**
 * Property source indicator for class inheritance
 */
export type PropertySource = 'default' | 'class' | 'user' | 'global';

/**
 * Result of style source check
 */
export interface StyleSourceResult {
  source: PropertySource;
  isResponsive: boolean;
}

/**
 * Property with source tracking
 */
export interface TrackedProperty<T> {
  value: T;
  source: PropertySource;
  className?: string;
}

/**
 * Default element metadata
 */
export function createDefaultMetadata(): ElementMetadata {
  return {
    elementId: generateElementId(),
    appliedClasses: [],
    customAttributes: [],
    customCSS: '',
  };
}

/**
 * Generate a unique element ID
 */
export function generateElementId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `el-${timestamp}-${random}`;
}

/**
 * Generate a unique attribute ID
 */
export function generateAttributeId(): string {
  return `attr-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
}

/**
 * Component type to display name mapping
 */
export const COMPONENT_TYPE_LABELS: Record<string, string> = {
  Container: 'Container',
  Div: 'Div',
  Section: 'Section',
  Row: 'Row',
  Column: 'Column',
  Text: 'Text',
  Heading: 'Heading',
  Paragraph: 'Paragraph',
  Image: 'Image',
  Video: 'Video',
  Button: 'Button',
  Link: 'Link',
  TextLink: 'Text Link',
  Icon: 'Icon',
  IconBox: 'Icon Box',
  Divider: 'Divider',
  Spacer: 'Spacer',
  List: 'List',
  HTMLBlock: 'HTML Block',
  'Code Block': 'Code Block',
};

/**
 * Get badge color for component type
 */
export function getComponentBadgeColor(componentType: string): string {
  const layoutComponents = ['Container', 'Div', 'Section', 'Row', 'Column'];
  const textComponents = ['Text', 'Heading', 'Paragraph', 'Link', 'TextLink'];
  const mediaComponents = ['Image', 'Video', 'Icon', 'IconBox'];
  const interactiveComponents = ['Button'];
  const codeComponents = ['HTMLBlock', 'Code Block'];
  const utilityComponents = ['Divider', 'Spacer', 'List'];

  if (layoutComponents.includes(componentType)) return 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30';
  if (textComponents.includes(componentType)) return 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30';
  if (mediaComponents.includes(componentType)) return 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30';
  if (interactiveComponents.includes(componentType)) return 'bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30';
  if (codeComponents.includes(componentType)) return 'bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30';
  if (utilityComponents.includes(componentType)) return 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border-cyan-500/30';

  return 'bg-slate-500/20 text-slate-600 dark:text-slate-400 border-slate-500/30';
}

/**
 * Check if a component should have typography settings
 */
export function hasTypographySettings(componentType: string): boolean {
  const typographyComponents = ['Text', 'Heading', 'Paragraph', 'Button', 'Link', 'TextLink', 'List', 'IconBox'];
  return typographyComponents.includes(componentType);
}
