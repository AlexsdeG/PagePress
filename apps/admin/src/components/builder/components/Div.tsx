// PagePress v0.0.6 - 2025-12-03
// Div component for the page builder

import React from 'react';
import { useNode, useEditor } from '@craftjs/core';
import { cn } from '@/lib/utils';
import { useBuilderStore } from '@/stores/builder';
import type { FC, ReactNode } from 'react';
import { DivSettings } from './Div.settings';
import type { HtmlTag } from '../inspector/inputs/TagSelector';

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
}

/**
 * Div component - Generic wrapper with custom HTML tag selector
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
    connectors: { connect },
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

  const Tag = htmlTag;

  return React.createElement(
    Tag,
    {
      ref: connect,
      className: cn(
        'relative',
        !isPreviewMode && 'transition-all duration-150',
        className
      ),
      style: {
        margin: parseValue(margin),
        backgroundColor,
        ...paddingStyle,
        ...getOutlineStyles(),
      },
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
