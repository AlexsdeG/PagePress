// PagePress v0.0.9 - 2025-12-04
// Icon component for the page builder with advanced styling support

import { useNode, useEditor } from '@craftjs/core';
import { cn } from '@/lib/utils';
import { useBuilderStore } from '@/stores/builder';
import { useAdvancedStyling } from '../hooks/useAdvancedStyling';
import type { FC } from 'react';
import { IconSettings } from './Icon.settings';
import { renderIcon } from '../inspector/inputs/IconPicker';
import type { AdvancedStyling } from '../inspector/styles/types';
import type { ElementMetadata } from '../inspector/sidebar/types';

/**
 * Icon component props
 */
export interface IconProps {
  iconName?: string;
  size?: string;
  color?: string;
  strokeWidth?: number;
  className?: string;
  // Advanced styling
  advancedStyling?: Partial<AdvancedStyling>;
  metadata?: ElementMetadata;
}

/**
 * Icon component - Lucide icon with customization
 */
export const Icon: FC<IconProps> & { craft?: Record<string, unknown> } = ({
  iconName = 'Star',
  size = '24px',
  color = '#000000',
  strokeWidth = 2,
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
    hasCustomTransition,
  } = useAdvancedStyling();

  // Parse size value
  const parseSize = (value: string) => {
    if (!value) return 24;
    const num = parseInt(value, 10);
    return isNaN(num) ? 24 : num;
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

  const iconSize = parseSize(size);
  const iconElement = renderIcon(iconName, { size: iconSize, color, strokeWidth });

  return (
    <span
      ref={(ref) => {
        if (ref) connect(drag(ref));
      }}
      id={elementId}
      className={cn(
        'relative inline-flex items-center justify-center',
        !isPreviewMode && !hasCustomTransition && 'transition-all duration-150',
        advancedClassName,
        className
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
          Icon
        </span>
      )}
      {iconElement || (
        <span className="text-muted-foreground text-sm">No icon</span>
      )}
    </span>
  );
};

/**
 * Craft.js configuration
 */
Icon.craft = {
  displayName: 'Icon',
  props: {
    iconName: 'Star',
    size: '24px',
    color: '#000000',
    strokeWidth: 2,
    className: '',
    // Advanced styling props
    advancedStyling: {},
    pseudoStateStyling: {},
    metadata: undefined,
  },
  related: {
    settings: IconSettings,
  },
  rules: {
    canDrag: () => true,
    canMoveIn: () => false, // Leaf node - no children
  },
};
