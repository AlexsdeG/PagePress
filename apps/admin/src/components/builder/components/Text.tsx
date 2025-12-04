// PagePress v0.0.9 - 2025-12-04
// Text component for the page builder with advanced styling support

import { useNode, useEditor } from '@craftjs/core';
import { cn } from '@/lib/utils';
import { useBuilderStore } from '@/stores/builder';
import { useAdvancedStyling } from '../hooks/useAdvancedStyling';
import type { FC } from 'react';
import type { TextProps } from '../types';
import { TextSettings } from './Text.settings';
import type { AdvancedStyling } from '../inspector/styles/types';
import type { ElementMetadata } from '../inspector/sidebar/types';

// Extend TextProps with advanced styling
interface ExtendedTextProps extends TextProps {
  advancedStyling?: Partial<AdvancedStyling>;
  metadata?: ElementMetadata;
}

/**
 * Text component - Paragraph text block
 */
export const Text: FC<ExtendedTextProps> & { craft?: Record<string, unknown> } = ({
  text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  fontSize = 16,
  fontWeight = 'normal',
  textAlign = 'left',
  color = '#000000',
  lineHeight = 1.5,
  letterSpacing = 0,
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
    justify: 'text-justify',
  };

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

  // Base styles (legacy - overridden by advanced styling)
  const baseStyle: React.CSSProperties = hasAdvancedStyling ? {} : {
    fontSize: `${fontSize}px`,
    color,
    lineHeight,
    letterSpacing: `${letterSpacing}px`,
  };

  return (
    <p
      ref={(ref) => { ref && connect(drag(ref)); }}
      id={elementId}
      className={cn(
        'relative',
        !hasAdvancedStyling && fontWeightClass[fontWeight],
        !hasAdvancedStyling && textAlignClass[textAlign],
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
        <span className="absolute -top-5 left-0 text-xs text-white bg-blue-600 px-1.5 py-0.5 rounded-t font-medium z-10">
          Text
        </span>
      )}
      {text}
    </p>
  );
};

/**
 * Craft.js configuration
 */
Text.craft = {
  displayName: 'Text',
  props: {
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    fontSize: 16,
    fontWeight: 'normal',
    textAlign: 'left',
    color: '#000000',
    lineHeight: 1.5,
    letterSpacing: 0,
    className: '',
    // Advanced styling props
    advancedStyling: {},
    pseudoStateStyling: {},
    metadata: undefined,
  },
  related: {
    settings: TextSettings,
  },
  rules: {
    canDrag: () => true,
  },
};
