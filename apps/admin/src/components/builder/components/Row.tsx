// PagePress v0.0.6 - 2025-12-03
// Row component for the page builder

import { useNode, useEditor } from '@craftjs/core';
import { cn } from '@/lib/utils';
import { useBuilderStore } from '@/stores/builder';
import type { FC, ReactNode } from 'react';
import { RowSettings } from './Row.settings';

/**
 * Row component props
 */
export interface RowProps {
  gap?: string;
  justifyContent?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  alignItems?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  wrap?: boolean;
  padding?: string;
  paddingTop?: string;
  paddingRight?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  margin?: string;
  backgroundColor?: string;
  className?: string;
  children?: ReactNode;
}

/**
 * Row component - Horizontal flex container for columns
 */
export const Row: FC<RowProps> & { craft?: Record<string, unknown> } = ({
  gap = '16px',
  justifyContent = 'start',
  alignItems = 'stretch',
  wrap = true,
  padding = '0px',
  paddingTop,
  paddingRight,
  paddingBottom,
  paddingLeft,
  margin = '0px',
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

  // Justify content classes
  const justifyClasses: Record<string, string> = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
  };

  // Align items classes
  const alignClasses: Record<string, string> = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
    baseline: 'items-baseline',
  };

  // Parse value helper
  const parseValue = (value: string) => {
    if (!value) return '0px';
    return value.includes('px') || value.includes('%') || value.includes('rem') ? value : `${value}px`;
  };

  // Calculate padding styles
  const paddingStyle = {
    paddingTop: parseValue(paddingTop ?? padding),
    paddingRight: parseValue(paddingRight ?? padding),
    paddingBottom: parseValue(paddingBottom ?? padding),
    paddingLeft: parseValue(paddingLeft ?? padding),
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
        'relative flex flex-row w-full',
        justifyClasses[justifyContent],
        alignClasses[alignItems],
        wrap && 'flex-wrap',
        !isPreviewMode && 'transition-all duration-150',
        className
      )}
      style={{
        gap: parseValue(gap),
        margin: parseValue(margin),
        backgroundColor,
        ...paddingStyle,
        ...getOutlineStyles(),
      }}
    >
      {/* Selection label */}
      {isSelected && !isPreviewMode && (
        <span className="absolute -top-5 left-0 text-xs text-white bg-blue-600 px-1.5 py-0.5 rounded-t-lg font-medium z-10">
          Row
        </span>
      )}
      {children}
    </div>
  );
};

/**
 * Craft.js configuration
 */
Row.craft = {
  displayName: 'Row',
  props: {
    gap: '16px',
    justifyContent: 'start',
    alignItems: 'stretch',
    wrap: true,
    padding: '0px',
    margin: '0px',
    backgroundColor: 'transparent',
    className: '',
  },
  related: {
    settings: RowSettings,
  },
  rules: {
    canDrag: () => true,
    canDrop: () => true,
    canMoveIn: () => true,
  },
};
