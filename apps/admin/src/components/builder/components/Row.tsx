// PagePress v0.0.9 - 2025-12-04
// Row component for the page builder with advanced styling support

import { useNode, useEditor } from '@craftjs/core';
import { cn } from '@/lib/utils';
import { useBuilderStore } from '@/stores/builder';
import { useAdvancedStyling } from '../hooks/useAdvancedStyling';
import type { FC, ReactNode } from 'react';
import { RowSettings } from './Row.settings';
import type { AdvancedStyling } from '../inspector/styles/types';
import type { ElementMetadata } from '../inspector/sidebar/types';

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
  // Advanced styling
  advancedStyling?: Partial<AdvancedStyling>;
  metadata?: ElementMetadata;
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
    hasCustomTransition,
  } = useAdvancedStyling();

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

  // Calculate padding styles (legacy - overridden by advanced styling)
  const basePaddingStyle = hasAdvancedStyling ? {} : {
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

  // Base styles (legacy - overridden by advanced styling)
  const baseStyle: React.CSSProperties = hasAdvancedStyling ? {} : {
    gap: parseValue(gap),
    margin: parseValue(margin),
    backgroundColor,
    ...basePaddingStyle,
  };

  // Ensure Row always has flex-row behavior
  // Even with advanced styling, maintain baseline flex-row unless explicitly changed
  const flexDefaults: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    minHeight: '50px', // Ensure selectable when empty
  };

  return (
    <div
      ref={(ref) => {
        if (ref) connect(drag(ref));
      }}
      id={elementId}
      className={cn(
        'relative w-full',
        !hasAdvancedStyling && justifyClasses[justifyContent],
        !hasAdvancedStyling && alignClasses[alignItems],
        !hasAdvancedStyling && wrap && 'flex-wrap',
        !isPreviewMode && !hasCustomTransition && 'transition-all duration-150',
        advancedClassName,
        className
      )}
      style={{
        ...flexDefaults,
        ...baseStyle,
        ...advancedStyle,
        ...getOutlineStyles(),
      }}
      {...attributes}
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
    // Advanced styling props
    advancedStyling: {},
    pseudoStateStyling: {},
    metadata: undefined,
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
