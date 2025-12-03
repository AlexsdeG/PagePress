// PagePress v0.0.6 - 2025-12-03
// Heading component for the page builder

import React from 'react';
import { useNode, useEditor } from '@craftjs/core';
import { cn } from '@/lib/utils';
import { useBuilderStore } from '@/stores/builder';
import type { FC } from 'react';
import type { HeadingProps } from '../types';
import { HeadingSettings } from './Heading.settings';

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

/**
 * Heading component - H1-H6 heading block
 */
export const Heading: FC<HeadingProps> & { craft?: Record<string, unknown> } = ({
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
      className: cn(
        'relative',
        fontWeightClass[fontWeight],
        textAlignClass[textAlign],
        !isPreviewMode && 'transition-all duration-150',
        className
      ),
      style: {
        fontSize: `${actualFontSize}px`,
        color,
        ...getOutlineStyles(),
      },
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
  },
  related: {
    settings: HeadingSettings,
  },
  rules: {
    canDrag: () => true,
  },
};
