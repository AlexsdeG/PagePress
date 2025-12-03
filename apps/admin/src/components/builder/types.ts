// PagePress v0.0.5 - 2025-11-30
// Shared types for builder components

import type { ReactNode } from 'react';

/**
 * Common props for all builder components
 */
export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
}

/**
 * Container component props
 */
export interface ContainerProps extends BaseComponentProps {
  display?: 'block' | 'flex' | 'grid';
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  justifyContent?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  alignItems?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  gap?: number;
  padding?: number;
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  margin?: number;
  marginTop?: number;
  marginRight?: number;
  marginBottom?: number;
  marginLeft?: number;
  backgroundColor?: string;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  minHeight?: number;
  width?: 'auto' | 'full' | 'fit';
}

/**
 * Text component props
 */
export interface TextProps extends BaseComponentProps {
  text?: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold';
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  color?: string;
  lineHeight?: number;
  letterSpacing?: number;
}

/**
 * Heading component props
 */
export interface HeadingProps extends BaseComponentProps {
  text?: string;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  fontSize?: number;
  fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold';
  textAlign?: 'left' | 'center' | 'right';
  color?: string;
}

/**
 * Image component props
 */
export interface ImageProps extends BaseComponentProps {
  src?: string;
  alt?: string;
  width?: 'auto' | 'full' | number;
  height?: 'auto' | number;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none';
  borderRadius?: number;
}

/**
 * Button component props
 */
export interface ButtonProps extends BaseComponentProps {
  text?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  target?: '_self' | '_blank';
  backgroundColor?: string;
  textColor?: string;
  borderRadius?: number;
  fullWidth?: boolean;
}

/**
 * HTML Block component props (now CodeBlock)
 */
export interface HTMLBlockProps extends BaseComponentProps {
  html?: string;
  css?: string;
  javascript?: string;
  minHeight?: number;
}

/**
 * Toolbox item definition
 */
export interface ToolboxItem {
  name: string;
  icon: ReactNode;
  description: string;
  component: React.ComponentType<Record<string, unknown>>;
}

/**
 * Toolbox category
 */
export interface ToolboxCategory {
  name: string;
  items: ToolboxItem[];
}

/**
 * Craft.js node data
 */
export interface CraftNodeData {
  type: string;
  props: Record<string, unknown>;
  nodes?: string[];
  linkedNodes?: Record<string, string>;
}

/**
 * Settings input props
 */
export interface SettingsInputProps<T = unknown> {
  value: T;
  onChange: (value: T) => void;
  label?: string;
  placeholder?: string;
}

/**
 * Spacing value type
 */
export interface SpacingValue {
  top: number;
  right: number;
  bottom: number;
  left: number;
}
