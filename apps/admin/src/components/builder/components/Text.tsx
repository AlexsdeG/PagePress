// PagePress v0.0.6 - 2025-12-03
// Text component for the page builder

import { useNode, useEditor } from '@craftjs/core';
import { cn } from '@/lib/utils';
import { useBuilderStore } from '@/stores/builder';
import type { FC } from 'react';
import type { TextProps } from '../types';
import { TextSettings } from './Text.settings';

/**
 * Text component - Paragraph text block
 */
export const Text: FC<TextProps> & { craft?: Record<string, unknown> } = ({
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

  return (
    <p
      ref={(ref) => ref && connect(drag(ref))}
      className={cn(
        'relative',
        fontWeightClass[fontWeight],
        textAlignClass[textAlign],
        !isPreviewMode && 'transition-all duration-150',
        className
      )}
      style={{
        fontSize: `${fontSize}px`,
        color,
        lineHeight,
        letterSpacing: `${letterSpacing}px`,
        ...getOutlineStyles(),
      }}
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
  },
  related: {
    settings: TextSettings,
  },
  rules: {
    canDrag: () => true,
  },
};
