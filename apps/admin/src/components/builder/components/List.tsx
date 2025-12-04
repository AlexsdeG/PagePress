// PagePress v0.0.9 - 2025-12-04
// List component for the page builder with advanced styling support

import { useNode, useEditor } from '@craftjs/core';
import { cn } from '@/lib/utils';
import { useBuilderStore } from '@/stores/builder';
import { useAdvancedStyling } from '../hooks/useAdvancedStyling';
import type { FC } from 'react';
import { ListSettings } from './List.settings';
import type { AdvancedStyling } from '../inspector/styles/types';
import type { ElementMetadata } from '../inspector/sidebar/types';

/**
 * List component props
 */
export interface ListProps {
  listType?: 'ul' | 'ol';
  items?: string[];
  bulletStyle?: 'disc' | 'circle' | 'square' | 'decimal' | 'alpha' | 'roman' | 'none';
  color?: string;
  fontSize?: string;
  lineHeight?: string;
  gap?: string;
  padding?: string;
  className?: string;
  // Advanced styling
  advancedStyling?: Partial<AdvancedStyling>;
  metadata?: ElementMetadata;
}

/**
 * List component - UL/OL with bullet/number style options
 */
export const List: FC<ListProps> & { craft?: Record<string, unknown> } = ({
  listType = 'ul',
  items = ['First item', 'Second item', 'Third item'],
  bulletStyle = 'disc',
  color = '#000000',
  fontSize = '16px',
  lineHeight = '1.6',
  gap = '8px',
  padding = '0px',
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

  // Map bullet style to CSS list-style-type
  const listStyleMap: Record<string, string> = {
    disc: 'disc',
    circle: 'circle',
    square: 'square',
    decimal: 'decimal',
    alpha: 'lower-alpha',
    roman: 'lower-roman',
    none: 'none',
  };

  // Parse value helper
  const parseValue = (value: string) => {
    if (!value) return '0px';
    return value.includes('px') || value.includes('rem') ? value : `${value}px`;
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
    
    return {};
  };

  // Base list styles (legacy - overridden by advanced styling)
  const baseListStyle: React.CSSProperties = hasAdvancedStyling ? {} : {
    listStyleType: listStyleMap[bulletStyle],
    color,
    fontSize: parseValue(fontSize),
    lineHeight,
    padding: parseValue(padding),
    paddingLeft: bulletStyle !== 'none' ? '1.5em' : parseValue(padding),
    display: 'flex',
    flexDirection: 'column',
    gap: parseValue(gap),
  };

  const ListTag = listType;

  return (
    <div
      ref={(ref) => {
        if (ref) connect(drag(ref));
      }}
      id={elementId}
      className={cn(
        'relative',
        !isPreviewMode && 'transition-all duration-150',
        advancedClassName,
      )}
      style={{
        ...advancedStyle,
        ...getOutlineStyles(),
      }}
      {...attributes}
    >
      {/* Selection label */}
      {isSelected && !isPreviewMode && (
        <span className="absolute -top-5 left-0 text-xs text-white bg-blue-600 px-1.5 py-0.5 rounded-t-lg font-medium z-10">
          List
        </span>
      )}
      <ListTag
        className={cn('m-0', className)}
        style={baseListStyle}
      >
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ListTag>
    </div>
  );
};

/**
 * Craft.js configuration
 */
List.craft = {
  displayName: 'List',
  props: {
    listType: 'ul',
    items: ['First item', 'Second item', 'Third item'],
    bulletStyle: 'disc',
    color: '#000000',
    fontSize: '16px',
    lineHeight: '1.6',
    gap: '8px',
    padding: '0px',
    className: '',
    // Advanced styling props
    advancedStyling: {},
    pseudoStateStyling: {},
    metadata: undefined,
  },
  related: {
    settings: ListSettings,
  },
  rules: {
    canDrag: () => true,
    canMoveIn: () => false, // Leaf node - no children
  },
};
