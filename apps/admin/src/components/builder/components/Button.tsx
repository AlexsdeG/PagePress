// PagePress v0.0.9 - 2025-12-04
// Button component for the page builder with advanced styling support

import { useNode, useEditor } from '@craftjs/core';
import { cn } from '@/lib/utils';
import { useBuilderStore } from '@/stores/builder';
import { useAdvancedStyling, useGlobalTypography } from '../hooks';
import { useEffect } from 'react';
import { renderIcon } from '../inspector/inputs/IconPicker';
import type { FC } from 'react';
import type { ButtonProps } from '../types';
import { ButtonSettings } from './Button.settings';
import type { AdvancedStyling } from '../inspector/styles/types';
import type { ElementMetadata } from '../inspector/sidebar/types';

// Extend ButtonProps with advanced styling
interface ExtendedButtonProps extends ButtonProps {
  advancedStyling?: Partial<AdvancedStyling>;
  metadata?: ElementMetadata;
}

/**
 * Button component - Interactive button block
 */
export const BuilderButton: FC<ExtendedButtonProps> & { craft?: Record<string, unknown> } = ({
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
  iconBefore,
  iconAfter,
  iconSize = 16,
}) => {
  const { isPreviewMode } = useBuilderStore();

  const {
    connectors: { connect, drag },
    id,
  } = useNode((node) => ({
    id: node.id,
  }));

  const { isSelected, isHovered } = useEditor((state) => ({
    isSelected: state.events.selected.has(id),
    isHovered: state.events.hovered.has(id),
  }));

  // Initialize font size from global settings on mount
  const { getBaseFontSize } = useGlobalTypography();
  useEffect(() => {
    // Only apply if no advanced styling for typography exists
    const hasTypographyOverride = advancedStyling?.typography?.fontSize;
    if (!hasTypographyOverride) {
      const baseSize = getBaseFontSize();
      if (baseSize) {
        setProp((props: ExtendedButtonProps) => {
          if (!props.advancedStyling) props.advancedStyling = {};
          if (!props.advancedStyling.typography) props.advancedStyling.typography = {};
          props.advancedStyling.typography.fontSize = `${baseSize}px`;
        });
      }
    }
  }, []); // Run once on mount

  // Get advanced styling
  const {
    style: advancedStyle,
    className: advancedClassName,
    attributes,
    elementId,
    hasAdvancedStyling,
    hasCustomTransition,
  } = useAdvancedStyling({
    componentType: 'button',
  });

  // Base styles
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

  // Size styles
  const sizeStyles: Record<string, string> = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base',
  };

  // Variant styles (used when no custom colors and no advanced styling)
  const variantStyles: Record<string, string> = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  };

  // Determine if using custom colors
  const hasCustomColors = backgroundColor || textColor;

  // Get outline styles based on selection/hover state
  const getOutlineStyles = (): React.CSSProperties => {
    if (isPreviewMode) return {};

    if (isSelected) {
      return {
        outline: '2px solid #2563eb',
        outlineOffset: '2px',
      };
    }

    if (isHovered) {
      return {
        outline: '2px dashed #60a5fa',
        outlineOffset: '2px',
      };
    }

    return {};
  };

  // Build base style object for custom colors (legacy - overridden by advanced styling)
  const baseStyle: React.CSSProperties = hasAdvancedStyling ? {} : {
    borderRadius: `${borderRadius}px`,
    ...(backgroundColor && { backgroundColor }),
    ...(textColor && { color: textColor }),
  };

  const ButtonElement = href ? 'a' : 'button';
  const linkProps = href ? { href, target, rel: target === '_blank' ? 'noopener noreferrer' : undefined } : {};

  // Render icons
  const iconBeforeElement = iconBefore ? renderIcon(iconBefore, { size: iconSize }) : null;
  const iconAfterElement = iconAfter ? renderIcon(iconAfter, { size: iconSize }) : null;

  return (
    <span className="relative inline-block" id={elementId}>
      {/* Selection label */}
      {isSelected && !isPreviewMode && (
        <span className="absolute -top-5 left-0 text-xs text-white bg-blue-600 px-1.5 py-0.5 rounded-t-lg font-medium z-10">
          Button
        </span>
      )}
      <ButtonElement
        ref={(ref: HTMLButtonElement | HTMLAnchorElement | null) => {
          if (ref) connect(drag(ref));
        }}
        className={cn(
          baseStyles,
          !hasAdvancedStyling && sizeStyles[size],
          !hasCustomColors && !hasAdvancedStyling && variantStyles[variant],
          !hasAdvancedStyling && fullWidth && 'w-full',
          !isPreviewMode && !hasCustomTransition && 'transition-all duration-150',
          (iconBefore || iconAfter) && 'gap-2',
          advancedClassName,
          className
        )}
        style={{
          ...baseStyle,
          ...advancedStyle,
          ...getOutlineStyles(),
        }}
        {...linkProps}
        {...attributes}
      >
        {iconBeforeElement}
        {text}
        {iconAfterElement}
      </ButtonElement>
    </span>
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
    iconBefore: '',
    iconAfter: '',
    iconSize: 16,
    // Advanced styling props
    advancedStyling: {},
    pseudoStateStyling: {},
    metadata: undefined,
  },
  related: {
    settings: ButtonSettings,
  },
  rules: {
    canDrag: () => true,
  },
};
