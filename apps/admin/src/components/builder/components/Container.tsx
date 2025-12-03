// PagePress v0.0.6 - 2025-12-03
// Container component for the page builder

import { useNode, useEditor } from '@craftjs/core';
import { cn } from '@/lib/utils';
import { useBuilderStore } from '@/stores/builder';
import type { FC } from 'react';
import type { ContainerProps } from '../types';
import { ContainerSettings } from './Container.settings';

/**
 * Container component - A flexible wrapper component
 */
export const Container: FC<ContainerProps> & { craft?: Record<string, unknown> } = ({
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

  // Calculate padding
  const paddingStyle = {
    paddingTop: paddingTop ?? padding,
    paddingRight: paddingRight ?? padding,
    paddingBottom: paddingBottom ?? padding,
    paddingLeft: paddingLeft ?? padding,
  };

  // Calculate margin
  const marginStyle = {
    marginTop: marginTop ?? margin,
    marginRight: marginRight ?? margin,
    marginBottom: marginBottom ?? margin,
    marginLeft: marginLeft ?? margin,
  };

  // Determine outline styles based on selection/hover state
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

  return (
    <div
      ref={(ref) => {
        if (ref) {
          // Canvas containers only need connect (for dropping)
          // Non-canvas containers need both connect and drag
          if (isCanvas) {
            connect(ref);
          } else {
            connect(drag(ref));
          }
        }
      }}
      className={cn(
        'relative',
        display === 'flex' && 'flex',
        display === 'grid' && 'grid',
        display === 'flex' && flexClasses.flexDirection[flexDirection],
        display === 'flex' && flexClasses.justifyContent[justifyContent],
        display === 'flex' && flexClasses.alignItems[alignItems],
        widthClass,
        !isPreviewMode && 'transition-all duration-150',
        className
      )}
      style={{
        gap: `${gap}px`,
        ...paddingStyle,
        ...marginStyle,
        backgroundColor,
        borderRadius: `${borderRadius}px`,
        borderWidth: `${borderWidth}px`,
        borderColor,
        borderStyle: borderWidth > 0 ? 'solid' : 'none',
        minHeight: `${minHeight}px`,
        ...getOutlineStyles(),
      }}
    >
      {/* Selection label */}
      {isSelected && !isPreviewMode && (
        <span className="absolute -top-5 left-0 text-xs text-white bg-blue-600 px-1.5 py-0.5 rounded-t font-medium z-10">
          Container
        </span>
      )}
      {children}
    </div>
  );
};

/**
 * Craft.js configuration
 */
Container.craft = {
  displayName: 'Container',
  props: {
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
