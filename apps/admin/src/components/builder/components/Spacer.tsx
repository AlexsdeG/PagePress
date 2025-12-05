// PagePress v0.0.9 - 2025-12-04
// Spacer component for the page builder with advanced styling support

import { useNode, useEditor } from '@craftjs/core';
import { cn } from '@/lib/utils';
import { useBuilderStore } from '@/stores/builder';
import { useAdvancedStyling } from '../hooks/useAdvancedStyling';
import type { FC } from 'react';
import { SpacerSettings } from './Spacer.settings';
import type { AdvancedStyling } from '../inspector/styles/types';
import type { ElementMetadata } from '../inspector/sidebar/types';

/**
 * Spacer component props
 */
export interface SpacerProps {
  height?: string;
  className?: string;
  // Advanced styling
  advancedStyling?: Partial<AdvancedStyling>;
  metadata?: ElementMetadata;
}

/**
 * Spacer component - Invisible height block
 */
export const Spacer: FC<SpacerProps> & { craft?: Record<string, unknown> } = ({
  height = '40px',
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
    hasCustomTransition,
  } = useAdvancedStyling();

  // Parse value helper
  const parseValue = (value: string) => {
    if (!value) return '40px';
    return value.includes('px') || value.includes('vh') || value.includes('rem') ? value : `${value}px`;
  };

  // Get editor-only styles for visibility
  const getEditorStyles = () => {
    if (isPreviewMode) return {};
    
    const baseStyles = {
      border: '1px dashed #d1d5db',
      backgroundColor: 'rgba(156, 163, 175, 0.1)',
    };
    
    if (isSelected) {
      return {
        ...baseStyles,
        border: '2px solid #2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
      };
    }
    
    if (isHovered) {
      return {
        ...baseStyles,
        border: '2px dashed #60a5fa',
        backgroundColor: 'rgba(96, 165, 250, 0.1)',
      };
    }
    
    return baseStyles;
  };

  // Base styles (legacy - overridden by advanced styling)
  const baseStyle: React.CSSProperties = hasAdvancedStyling ? {} : {
    height: parseValue(height),
  };

  return (
    <div
      ref={(ref) => {
        if (ref) connect(drag(ref));
      }}
      id={elementId}
      className={cn(
        'relative flex items-center justify-center',
        !isPreviewMode && !hasCustomTransition && 'transition-all duration-150',
        advancedClassName,
        className
      )}
      style={{
        ...baseStyle,
        ...advancedStyle,
        ...getEditorStyles(),
      }}
      {...attributes}
    >
      {/* Editor-only label */}
      {!isPreviewMode && (
        <span className="text-xs text-muted-foreground select-none">
          Spacer: {height}
        </span>
      )}
      {/* Selection label */}
      {isSelected && !isPreviewMode && (
        <span className="absolute -top-5 left-0 text-xs text-white bg-blue-600 px-1.5 py-0.5 rounded-t-lg font-medium z-10">
          Spacer
        </span>
      )}
    </div>
  );
};

/**
 * Craft.js configuration
 */
Spacer.craft = {
  displayName: 'Spacer',
  props: {
    height: '40px',
    className: '',
    // Advanced styling props
    advancedStyling: {},
    pseudoStateStyling: {},
    metadata: undefined,
  },
  related: {
    settings: SpacerSettings,
  },
  rules: {
    canDrag: () => true,
    canMoveIn: () => false, // Leaf node - no children
  },
};
