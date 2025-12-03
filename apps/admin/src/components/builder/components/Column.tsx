// PagePress v0.0.6 - 2025-12-03
// Column component for the page builder

import { useNode, useEditor } from '@craftjs/core';
import { cn } from '@/lib/utils';
import { useBuilderStore } from '@/stores/builder';
import type { FC, ReactNode } from 'react';
import { ColumnSettings } from './Column.settings';

/**
 * Column component props
 */
export interface ColumnProps {
  width?: string;
  minWidth?: string;
  maxWidth?: string;
  order?: number;
  alignSelf?: 'auto' | 'start' | 'center' | 'end' | 'stretch';
  padding?: string;
  paddingTop?: string;
  paddingRight?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  backgroundColor?: string;
  className?: string;
  children?: ReactNode;
}

/**
 * Column component - Flex item with responsive width controls
 */
export const Column: FC<ColumnProps> & { craft?: Record<string, unknown> } = ({
  width = 'auto',
  minWidth = '0px',
  maxWidth = 'none',
  order = 0,
  alignSelf = 'auto',
  padding = '16px',
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

  // Align self classes
  const alignClasses: Record<string, string> = {
    auto: 'self-auto',
    start: 'self-start',
    center: 'self-center',
    end: 'self-end',
    stretch: 'self-stretch',
  };

  // Parse value helper
  const parseValue = (value: string) => {
    if (!value || value === 'auto' || value === 'none') return value;
    return value.includes('px') || value.includes('%') || value.includes('rem') || value.includes('fr') ? value : `${value}px`;
  };

  // Calculate padding styles
  const paddingStyle = {
    paddingTop: parseValue(paddingTop ?? padding),
    paddingRight: parseValue(paddingRight ?? padding),
    paddingBottom: parseValue(paddingBottom ?? padding),
    paddingLeft: parseValue(paddingLeft ?? padding),
  };

  // Calculate flex properties based on width
  const getFlexStyle = () => {
    if (width === 'auto') {
      return { flex: '1 1 0%' };
    }
    if (width.includes('fr')) {
      const frValue = parseFloat(width);
      return { flex: `${frValue} ${frValue} 0%` };
    }
    return { 
      flex: '0 0 auto',
      width: parseValue(width),
    };
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

  return (
    <div
      ref={(ref) => {
        if (ref) connect(ref);
      }}
      className={cn(
        'relative',
        alignClasses[alignSelf],
        !isPreviewMode && 'transition-all duration-150',
        className
      )}
      style={{
        ...getFlexStyle(),
        minWidth: parseValue(minWidth),
        maxWidth: maxWidth === 'none' ? undefined : parseValue(maxWidth),
        order,
        backgroundColor,
        ...paddingStyle,
        ...getOutlineStyles(),
      }}
    >
      {/* Selection label */}
      {isSelected && !isPreviewMode && (
        <span className="absolute -top-5 left-0 text-xs text-white bg-blue-600 px-1.5 py-0.5 rounded-t-lg font-medium z-10">
          Column
        </span>
      )}
      {children}
    </div>
  );
};

/**
 * Craft.js configuration
 */
Column.craft = {
  displayName: 'Column',
  props: {
    width: 'auto',
    minWidth: '0px',
    maxWidth: 'none',
    order: 0,
    alignSelf: 'auto',
    padding: '16px',
    backgroundColor: 'transparent',
    className: '',
  },
  related: {
    settings: ColumnSettings,
  },
  rules: {
    canDrag: () => true,
    canDrop: () => true,
    canMoveIn: () => true,
  },
};
