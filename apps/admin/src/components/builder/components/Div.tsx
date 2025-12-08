// PagePress v0.0.9 - 2025-12-04
// Div component for the page builder with advanced styling support

import React from 'react';
import { useNode, useEditor } from '@craftjs/core';
import { cn } from '@/lib/utils';
import { useBuilderStore } from '@/stores/builder';
import { useAdvancedStyling } from '../hooks/useAdvancedStyling';
import type { FC, ReactNode } from 'react';
import { DivSettings } from './Div.settings';
import type { HtmlTag } from '../inspector/inputs/TagSelector';
import type { AdvancedStyling } from '../inspector/styles/types';
import type { ElementMetadata } from '../inspector/sidebar/types';

/**
 * Div component props
 */
export interface DivProps {
  htmlTag?: HtmlTag;
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
 * Div component - Generic wrapper with advanced styling
 */
export const Div: FC<DivProps> & { craft?: Record<string, unknown> } = ({
  htmlTag = 'div',
  padding = '16px',
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

  // Base styles (legacy props - overridden by advanced styling)
  const baseStyle: React.CSSProperties = hasAdvancedStyling ? {} : {
    margin: parseValue(margin),
    backgroundColor,
    ...basePaddingStyle,
  };

  // Ensure Div has minimum height when empty for selectability
  const divDefaults: React.CSSProperties = {
    minHeight: '30px',
  };

  const Tag = htmlTag;

  return React.createElement(
    Tag,
    {
      ref: (ref) => {
        if (ref) connect(drag(ref));
      },
      id: elementId,
      className: cn(
        'relative',
        !isPreviewMode && !hasCustomTransition && 'transition-all duration-150',
        advancedClassName,
        className
      ),
      style: {
        ...divDefaults,
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
          {`<${htmlTag}>`}
        </span>
      )}
      {children}
    </>
  );
};

/**
 * Craft.js configuration
 */
Div.craft = {
  displayName: 'Div',
  props: {
    htmlTag: 'div',
    padding: '16px',
    margin: '0px',
    backgroundColor: 'transparent',
    className: '',
    // Advanced styling props
    advancedStyling: {},
    pseudoStateStyling: {},
    metadata: undefined,
  },
  related: {
    settings: DivSettings,
  },
  rules: {
    canDrag: () => true,
    canDrop: () => true,
    canMoveIn: () => true,
  },
};
