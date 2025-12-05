// PagePress v0.0.9 - 2025-12-04
// Section component for the page builder with advanced styling support

import { useNode, useEditor } from '@craftjs/core';
import { cn } from '@/lib/utils';
import { useBuilderStore } from '@/stores/builder';
import { useAdvancedStyling } from '../hooks/useAdvancedStyling';
import type { FC, ReactNode } from 'react';
import { SectionSettings } from './Section.settings';
import type { AdvancedStyling } from '../inspector/styles/types';
import type { ElementMetadata } from '../inspector/sidebar/types';

/**
 * Section component props
 */
export interface SectionProps {
  contentWidth?: 'full' | 'boxed';
  maxWidth?: string;
  minHeight?: string;
  verticalAlign?: 'start' | 'center' | 'end';
  padding?: string;
  paddingTop?: string;
  paddingRight?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  backgroundColor?: string;
  className?: string;
  children?: ReactNode;
  // Advanced styling
  advancedStyling?: Partial<AdvancedStyling>;
  metadata?: ElementMetadata;
}

/**
 * Section component - Full-width wrapper with semantic <section> tag
 */
export const Section: FC<SectionProps> & { craft?: Record<string, unknown> } = ({
  contentWidth = 'boxed',
  maxWidth = '1200px',
  minHeight = '100px',
  verticalAlign = 'start',
  padding = '40px',
  paddingTop,
  paddingRight,
  paddingBottom,
  paddingLeft,
  backgroundColor = 'transparent',
  className = '',
  children,
}) => {
  const { isPreviewMode } = useBuilderStore();
  
  const {
    connectors: { connect },
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
    hasCustomTransition,
  } = useAdvancedStyling();

  // Vertical alignment classes
  const alignClasses: Record<string, string> = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
  };

  // Parse padding value
  const parsePadding = (value: string) => {
    if (!value) return '0px';
    return value.includes('px') || value.includes('%') || value.includes('rem') ? value : `${value}px`;
  };

  // Calculate padding styles (legacy - overridden by advanced styling)
  const basePaddingStyle = hasAdvancedStyling ? {} : {
    paddingTop: parsePadding(paddingTop ?? padding),
    paddingRight: parsePadding(paddingRight ?? padding),
    paddingBottom: parsePadding(paddingBottom ?? padding),
    paddingLeft: parsePadding(paddingLeft ?? padding),
  };

  // Get outline styles based on selection/hover state
  const getOutlineStyles = () => {
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
    
    return {
      outline: '1px dashed #d1d5db',
      outlineOffset: '-1px',
    };
  };

  // Base styles (legacy - overridden by advanced styling)
  const baseStyle: React.CSSProperties = hasAdvancedStyling ? {} : {
    backgroundColor,
    minHeight,
  };

  return (
    <section
      ref={(ref) => {
        if (ref) connect(ref);
      }}
      id={elementId}
      className={cn(
        'relative w-full',
        !isPreviewMode && !hasCustomTransition && 'transition-all duration-150',
        advancedClassName,
        className
      )}
      style={{
        ...baseStyle,
        ...advancedStyle,
        ...getOutlineStyles(),
      }}
      {...attributes}
    >
      {/* Selection label */}
      {isSelected && !isPreviewMode && (
        <span className="absolute -top-5 left-0 text-xs text-white bg-blue-600 px-1.5 py-0.5 rounded-t-lg font-medium z-10">
          Section
        </span>
      )}
      
      {/* Inner container for content width control */}
      <div
        className={cn(
          'flex flex-col w-full h-full',
          alignClasses[verticalAlign]
        )}
        style={{
          maxWidth: contentWidth === 'boxed' ? maxWidth : '100%',
          marginLeft: contentWidth === 'boxed' ? 'auto' : undefined,
          marginRight: contentWidth === 'boxed' ? 'auto' : undefined,
          minHeight: hasAdvancedStyling ? undefined : minHeight,
          ...basePaddingStyle,
        }}
      >
        {children}
      </div>
    </section>
  );
};

/**
 * Craft.js configuration
 */
Section.craft = {
  displayName: 'Section',
  props: {
    contentWidth: 'boxed',
    maxWidth: '1200px',
    minHeight: '100px',
    verticalAlign: 'start',
    padding: '40px',
    backgroundColor: 'transparent',
    className: '',
    // Advanced styling props
    advancedStyling: {},
    pseudoStateStyling: {},
    metadata: undefined,
  },
  related: {
    settings: SectionSettings,
  },
  rules: {
    canDrag: () => true,
    canDrop: () => true,
    canMoveIn: () => true,
  },
};
