// PagePress v0.0.5 - 2025-11-30
// Button component for the page builder

import { useNode } from '@craftjs/core';
import { cn } from '@/lib/utils';
import type { FC } from 'react';
import type { ButtonProps } from '../types';
import { ButtonSettings } from './Button.settings';

/**
 * Button component - Interactive button block
 */
export const BuilderButton: FC<ButtonProps> & { craft?: Record<string, unknown> } = ({
  text = 'Click me',
  variant = 'primary',
  size = 'md',
  href = '',
  target = '_self',
  backgroundColor,
  textColor,
  borderRadius = 6,
  fullWidth = false,
  className = '',
}) => {
  const {
    connectors: { connect, drag },
    selected,
  } = useNode((state) => ({
    selected: state.events.selected,
  }));

  // Base styles
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

  // Size styles
  const sizeStyles: Record<string, string> = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base',
  };

  // Variant styles (used when no custom colors)
  const variantStyles: Record<string, string> = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  };

  // Determine if using custom colors
  const hasCustomColors = backgroundColor || textColor;

  // Build style object for custom colors
  const customStyle: React.CSSProperties = {
    borderRadius: `${borderRadius}px`,
    ...(backgroundColor && { backgroundColor }),
    ...(textColor && { color: textColor }),
  };

  const ButtonElement = href ? 'a' : 'button';
  const linkProps = href ? { href, target, rel: target === '_blank' ? 'noopener noreferrer' : undefined } : {};

  return (
    <ButtonElement
      ref={(ref) => ref && connect(drag(ref))}
      className={cn(
        baseStyles,
        sizeStyles[size],
        !hasCustomColors && variantStyles[variant],
        fullWidth && 'w-full',
        selected && 'outline-dashed outline-2 outline-blue-500 outline-offset-2',
        className
      )}
      style={customStyle}
      {...linkProps}
    >
      {text}
    </ButtonElement>
  );
};

/**
 * Craft.js configuration
 */
BuilderButton.craft = {
  displayName: 'Button',
  props: {
    text: 'Click me',
    variant: 'primary',
    size: 'md',
    href: '',
    target: '_self',
    borderRadius: 6,
    fullWidth: false,
    className: '',
  },
  related: {
    settings: ButtonSettings,
  },
  rules: {
    canDrag: () => true,
  },
};
