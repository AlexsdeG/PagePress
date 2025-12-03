// PagePress v0.0.6 - 2025-12-03
// Icon component for the page builder

import { useNode, useEditor } from '@craftjs/core';
import { cn } from '@/lib/utils';
import { useBuilderStore } from '@/stores/builder';
import type { FC } from 'react';
import { IconSettings } from './Icon.settings';
import { renderIcon } from '../inspector/inputs/IconPicker';

/**
 * Icon component props
 */
export interface IconProps {
  iconName?: string;
  size?: string;
  color?: string;
  strokeWidth?: number;
  className?: string;
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
      className={cn(
        'relative inline-flex items-center justify-center',
        !isPreviewMode && 'transition-all duration-150',
        className
      )}
      style={{
        ...getOutlineStyles(),
      }}
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
  },
  related: {
    settings: IconSettings,
  },
  rules: {
    canDrag: () => true,
    canMoveIn: () => false, // Leaf node - no children
  },
};
