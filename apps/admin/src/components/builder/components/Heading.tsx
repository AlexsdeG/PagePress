// PagePress v0.0.9 - 2025-12-04
// Heading component for the page builder with advanced styling support

import React from 'react';
import { useNode, useEditor } from '@craftjs/core';
import { cn } from '@/lib/utils';
import { useBuilderStore } from '@/stores/builder';
import { useAdvancedStyling } from '../hooks/useAdvancedStyling';
import type { FC } from 'react';
import type { HeadingProps } from '../types';
import { HeadingSettings } from './Heading.settings';
import type { AdvancedStyling } from '../inspector/styles/types';
import type { ElementMetadata } from '../inspector/sidebar/types';

/**
 * Default font sizes for each heading level
 */
const defaultFontSizes: Record<number, number> = {
  1: 36,
  2: 30,
  3: 24,
  4: 20,
  5: 18,
  6: 16,
};

// Extend HeadingProps with advanced styling
interface ExtendedHeadingProps extends HeadingProps {
  advancedStyling?: Partial<AdvancedStyling>;
  metadata?: ElementMetadata;
}

/**
 * Heading component - H1-H6 heading block
 */
export const Heading: FC<ExtendedHeadingProps> & { craft?: Record<string, unknown> } = ({
  text = 'Heading',
  level = 2,
  fontSize,
  fontWeight = 'bold',
  textAlign = 'left',
  color = '#000000',
  linkUrl = '',
  linkTarget = '_self',
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

  // Get advanced styling
  const { 
    style: advancedStyle, 
    className: advancedClassName,
    attributes,
    elementId,
    hasAdvancedStyling,
  } = useAdvancedStyling();

  const fontWeightClass: Record<string, string> = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  };

  const textAlignClass: Record<string, string> = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  const HeadingTag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  const actualFontSize = fontSize ?? defaultFontSizes[level];

  // Get outline styles based on selection/hover state
  const getOutlineStyles = (): React.CSSProperties => {
    if (isPreviewMode) return {};
    
    if (isSelected) {
      return {
        outline: '2px solid #2563eb',
        outlineOffset: '-2px',
      };
    }
    
    if (isHovered) {
      return {
        outline: '2px dashed #60a5fa',
        outlineOffset: '-2px',
      };
    }
    
    return {};
  };

  // Handle link click in editor mode
  const handleLinkClick = (e: React.MouseEvent) => {
    if (!isPreviewMode) {
      e.preventDefault();
    }
  };

  // Base styles (legacy - overridden by advanced styling)
  const baseStyle: React.CSSProperties = hasAdvancedStyling ? {} : {
    fontSize: `${actualFontSize}px`,
    color,
  };

  // Render content with optional link
  const renderContent = () => {
    if (linkUrl) {
      return (
        <a
          href={linkUrl}
          target={linkTarget}
          rel={linkTarget === '_blank' ? 'noopener noreferrer' : undefined}
          onClick={handleLinkClick}
          className="hover:opacity-80 transition-opacity"
          style={{ color: 'inherit', textDecoration: 'none' }}
        >
          {text}
        </a>
      );
    }
    return text;
  };

  return React.createElement(
    HeadingTag,
    {
      ref: (ref: HTMLHeadingElement | null) => {
        if (ref) connect(drag(ref));
      },
      id: elementId,
      className: cn(
        'relative',
        !hasAdvancedStyling && fontWeightClass[fontWeight],
        !hasAdvancedStyling && textAlignClass[textAlign],
        !isPreviewMode && 'transition-all duration-150',
        advancedClassName,
        className
      ),
      style: {
        ...baseStyle,
        ...advancedStyle,
        ...getOutlineStyles(),
      },
      ...attributes,
    },
    <>
      {/* Selection label */}
      {isSelected && !isPreviewMode && (
        <span className="absolute -top-5 left-0 text-xs text-white bg-blue-600 px-1.5 py-0.5 rounded-t-lg font-medium z-10">
          Heading
        </span>
      )}
      {renderContent()}
    </>
  );
};

/**
 * Craft.js configuration
 */
Heading.craft = {
  displayName: 'Heading',
  props: {
    text: 'Heading',
    level: 2,
    fontWeight: 'bold',
    textAlign: 'left',
    color: '#000000',
    linkUrl: '',
    linkTarget: '_self',
    className: '',
    // Advanced styling props
    advancedStyling: {},
    pseudoStateStyling: {},
    metadata: undefined,
  },
  related: {
    settings: HeadingSettings,
  },
  rules: {
    canDrag: () => true,
  },
};
