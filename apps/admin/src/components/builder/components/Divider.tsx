// PagePress v0.0.9 - 2025-12-04
// Divider component for the page builder with advanced styling support

import { useNode, useEditor } from '@craftjs/core';
import { cn } from '@/lib/utils';
import { useBuilderStore } from '@/stores/builder';
import { useAdvancedStyling } from '../hooks/useAdvancedStyling';
import type { FC } from 'react';
import { DividerSettings } from './Divider.settings';
import type { AdvancedStyling } from '../inspector/styles/types';
import type { ElementMetadata } from '../inspector/sidebar/types';

/**
 * Divider component props
 */
export interface DividerProps {
  style?: 'solid' | 'dashed' | 'dotted' | 'double';
  width?: string;
  thickness?: string;
  color?: string;
  margin?: string;
  className?: string;
  // Advanced styling
  advancedStyling?: Partial<AdvancedStyling>;
  metadata?: ElementMetadata;
}

/**
 * Divider component - Horizontal line with style options
 */
export const Divider: FC<DividerProps> & { craft?: Record<string, unknown> } = ({
  style = 'solid',
  width = '100%',
  thickness = '1px',
  color = '#e5e7eb',
  margin = '16px',
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

  // Parse value helper
  const parseValue = (value: string) => {
    if (!value) return '0px';
    return value.includes('px') || value.includes('%') || value.includes('rem') ? value : `${value}px`;
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

  // Base styles (legacy - overridden by advanced styling)
  const baseStyle: React.CSSProperties = hasAdvancedStyling ? {} : {
    marginTop: parseValue(margin),
    marginBottom: parseValue(margin),
  };

  return (
    <div
      ref={(ref) => {
        if (ref) connect(drag(ref));
      }}
      id={elementId}
      className={cn(
        'relative flex justify-center',
        !isPreviewMode && 'transition-all duration-150',
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
          Divider
        </span>
      )}
      <hr
        style={{
          width: parseValue(width),
          borderWidth: 0,
          borderTopWidth: parseValue(thickness),
          borderStyle: style,
          borderColor: color,
        }}
      />
    </div>
  );
};

/**
 * Craft.js configuration
 */
Divider.craft = {
  displayName: 'Divider',
  props: {
    style: 'solid',
    width: '100%',
    thickness: '1px',
    color: '#e5e7eb',
    margin: '16px',
    className: '',
    // Advanced styling props
    advancedStyling: {},
    pseudoStateStyling: {},
    metadata: undefined,
  },
  related: {
    settings: DividerSettings,
  },
  rules: {
    canDrag: () => true,
    canMoveIn: () => false, // Leaf node - no children
  },
};
