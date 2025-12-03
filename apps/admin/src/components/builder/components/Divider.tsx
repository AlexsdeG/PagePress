// PagePress v0.0.6 - 2025-12-03
// Divider component for the page builder

import { useNode, useEditor } from '@craftjs/core';
import { cn } from '@/lib/utils';
import { useBuilderStore } from '@/stores/builder';
import type { FC } from 'react';
import { DividerSettings } from './Divider.settings';

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

  return (
    <div
      ref={(ref) => {
        if (ref) connect(drag(ref));
      }}
      className={cn(
        'relative flex justify-center',
        !isPreviewMode && 'transition-all duration-150',
        className
      )}
      style={{
        marginTop: parseValue(margin),
        marginBottom: parseValue(margin),
        ...getOutlineStyles(),
      }}
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
  },
  related: {
    settings: DividerSettings,
  },
  rules: {
    canDrag: () => true,
    canMoveIn: () => false, // Leaf node - no children
  },
};
