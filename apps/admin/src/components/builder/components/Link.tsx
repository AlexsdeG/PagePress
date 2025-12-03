// PagePress v0.0.6 - 2025-12-03
// Link component for the page builder

import { useNode, useEditor } from '@craftjs/core';
import { cn } from '@/lib/utils';
import { useBuilderStore } from '@/stores/builder';
import type { FC } from 'react';
import { LinkSettings } from './Link.settings';

/**
 * Link component props
 */
export interface LinkProps {
  text?: string;
  href?: string;
  target?: '_self' | '_blank';
  color?: string;
  hoverColor?: string;
  underline?: 'always' | 'hover' | 'none';
  fontSize?: string;
  fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold';
  className?: string;
}

/**
 * Link component - Styled anchor with hover states
 */
export const Link: FC<LinkProps> & { craft?: Record<string, unknown> } = ({
  text = 'Click here',
  href = '#',
  target = '_self',
  color = '#3b82f6',
  hoverColor = '#2563eb',
  underline = 'hover',
  fontSize = '16px',
  fontWeight = 'normal',
  className = '',
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

  // Font weight classes
  const fontWeightClasses: Record<string, string> = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  };

  // Underline classes
  const underlineClasses: Record<string, string> = {
    always: 'underline',
    hover: 'hover:underline',
    none: 'no-underline',
  };

  // Get outline styles based on selection/hover state
  const getOutlineStyles = () => {
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

  // Handle click in editor mode
  const handleClick = (e: React.MouseEvent) => {
    if (!isPreviewMode) {
      e.preventDefault();
    }
  };

  return (
    <span className="relative inline-block">
      {/* Selection label */}
      {isSelected && !isPreviewMode && (
        <span className="absolute -top-5 left-0 text-xs text-white bg-blue-600 px-1.5 py-0.5 rounded-t-lg font-medium z-10">
          Link
        </span>
      )}
      <a
        ref={(ref) => {
          if (ref) connect(drag(ref));
        }}
        href={href}
        target={target}
        rel={target === '_blank' ? 'noopener noreferrer' : undefined}
        onClick={handleClick}
        className={cn(
          'inline-block cursor-pointer transition-colors',
          fontWeightClasses[fontWeight],
          underlineClasses[underline],
          !isPreviewMode && 'transition-all duration-150',
          className
        )}
        style={{
          color,
          fontSize,
          ['--hover-color' as string]: hoverColor,
          ...getOutlineStyles(),
        }}
        onMouseEnter={(e) => {
          if (isPreviewMode) {
            (e.target as HTMLAnchorElement).style.color = hoverColor;
          }
        }}
        onMouseLeave={(e) => {
          if (isPreviewMode) {
            (e.target as HTMLAnchorElement).style.color = color;
          }
        }}
      >
        {text}
      </a>
    </span>
  );
};

/**
 * Craft.js configuration
 */
Link.craft = {
  displayName: 'Link',
  props: {
    text: 'Click here',
    href: '#',
    target: '_self',
    color: '#3b82f6',
    hoverColor: '#2563eb',
    underline: 'hover',
    fontSize: '16px',
    fontWeight: 'normal',
    className: '',
  },
  related: {
    settings: LinkSettings,
  },
  rules: {
    canDrag: () => true,
    canMoveIn: () => false, // Leaf node - no children
  },
};
