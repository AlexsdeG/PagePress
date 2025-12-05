// PagePress v0.0.12 - 2025-12-05
// Container component for the page builder with advanced styling support

import React from 'react';
import { useNode, useEditor } from '@craftjs/core';
import { cn } from '@/lib/utils';
import { useBuilderStore } from '@/stores/builder';
import { useAdvancedStyling } from '../hooks/useAdvancedStyling';
import type { FC } from 'react';
import type { ContainerProps } from '../types';
import { ContainerSettings } from './Container.settings';

/**
 * Container component - A flexible wrapper component with advanced styling
 */
export const Container: FC<ContainerProps> & { craft?: Record<string, unknown> } = ({
  htmlTag = 'div',
  display = 'flex',
  flexDirection = 'column',
  justifyContent = 'start',
  alignItems = 'stretch',
  gap = 8,
  padding = 16,
  paddingTop,
  paddingRight,
  paddingBottom,
  paddingLeft,
  margin = 0,
  marginTop,
  marginRight,
  marginBottom,
  marginLeft,
  backgroundColor = 'transparent',
  borderRadius = 0,
  borderWidth = 0,
  borderColor = '#e5e7eb',
  minHeight = 60,
  width = 'full',
  className = '',
  children,
}) => {
  const { isPreviewMode } = useBuilderStore();
  
  const {
    connectors: { connect, drag },
    id,
    isCanvas,
  } = useNode((node) => ({
    id: node.id,
    isCanvas: node.data.isCanvas,
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

  const flexClasses: Record<string, Record<string, string>> = {
    justifyContent: {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly',
    },
    alignItems: {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
      baseline: 'items-baseline',
    },
    flexDirection: {
      row: 'flex-row',
      column: 'flex-col',
      'row-reverse': 'flex-row-reverse',
      'column-reverse': 'flex-col-reverse',
    },
  };

  const widthClass = width === 'full' ? 'w-full' : width === 'fit' ? 'w-fit' : 'w-auto';

  // Calculate padding from props (legacy support - will be overridden by advanced styling)
  const basePaddingStyle = hasAdvancedStyling ? {} : {
    paddingTop: paddingTop ?? padding,
    paddingRight: paddingRight ?? padding,
    paddingBottom: paddingBottom ?? padding,
    paddingLeft: paddingLeft ?? padding,
  };

  // Calculate margin from props (legacy support - will be overridden by advanced styling)
  const baseMarginStyle = hasAdvancedStyling ? {} : {
    marginTop: marginTop ?? margin,
    marginRight: marginRight ?? margin,
    marginBottom: marginBottom ?? margin,
    marginLeft: marginLeft ?? margin,
  };

  // Determine outline styles based on selection/hover state (editor only)
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
    
    // Default dotted outline for containers to show structure
    return {
      outline: '1px dashed #d1d5db',
      outlineOffset: '-1px',
    };
  };

  // Base styles (legacy props - will be overridden by advanced styling if present)
  const baseStyle: React.CSSProperties = hasAdvancedStyling ? {} : {
    gap: `${gap}px`,
    ...basePaddingStyle,
    ...baseMarginStyle,
    backgroundColor,
    borderRadius: `${borderRadius}px`,
    borderWidth: `${borderWidth}px`,
    borderColor,
    borderStyle: borderWidth > 0 ? 'solid' : 'none',
    minHeight: `${minHeight}px`,
  };

  const Tag = htmlTag;

  return React.createElement(
    Tag,
    {
      ref: (ref: HTMLElement | null) => {
        if (ref) {
          if (isCanvas) {
            connect(ref);
          } else {
            connect(drag(ref));
          }
        }
      },
      id: elementId,
      className: cn(
        'relative',
        // Only apply flex classes if no advanced styling display
        !hasAdvancedStyling && display === 'flex' && 'flex',
        !hasAdvancedStyling && display === 'grid' && 'grid',
        !hasAdvancedStyling && display === 'flex' && flexClasses.flexDirection[flexDirection],
        !hasAdvancedStyling && display === 'flex' && flexClasses.justifyContent[justifyContent],
        !hasAdvancedStyling && display === 'flex' && flexClasses.alignItems[alignItems],
        !hasAdvancedStyling && widthClass,
        // Only apply default transition if not in preview mode AND no custom transition is set
        !isPreviewMode && !hasCustomTransition && 'transition-all duration-150',
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
          Container
        </span>
      )}
      {children}
    </>
  );
};

/**
 * Craft.js configuration
 */
Container.craft = {
  displayName: 'Container',
  props: {
    htmlTag: 'div',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'start',
    alignItems: 'stretch',
    gap: 8,
    padding: 16,
    margin: 0,
    backgroundColor: 'transparent',
    borderRadius: 0,
    borderWidth: 0,
    borderColor: '#e5e7eb',
    minHeight: 60,
    width: 'full',
    className: '',
    // Advanced styling props
    advancedStyling: {},
    pseudoStateStyling: {},
    metadata: undefined,
  },
  related: {
    settings: ContainerSettings,
  },
  rules: {
    canDrag: () => true,
    canDrop: () => true,
    canMoveIn: () => true,
  },
};
