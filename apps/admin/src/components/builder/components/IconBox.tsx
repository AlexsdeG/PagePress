// PagePress v0.0.9 - 2025-12-04
// IconBox component for the page builder with advanced styling support

import { useNode, useEditor } from '@craftjs/core';
import { cn } from '@/lib/utils';
import { useBuilderStore } from '@/stores/builder';
import { useAdvancedStyling } from '../hooks/useAdvancedStyling';
import type { FC } from 'react';
import { IconBoxSettings } from './IconBox.settings';
import { renderIcon } from '../inspector/inputs/IconPicker';
import type { AdvancedStyling } from '../inspector/styles/types';
import type { ElementMetadata } from '../inspector/sidebar/types';

/**
 * IconBox component props
 */
export interface IconBoxProps {
  iconName?: string;
  iconSize?: string;
  iconColor?: string;
  heading?: string;
  headingTag?: 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  headingColor?: string;
  text?: string;
  textColor?: string;
  layout?: 'top' | 'left' | 'right';
  gap?: string;
  padding?: string;
  backgroundColor?: string;
  className?: string;
  // Advanced styling
  advancedStyling?: Partial<AdvancedStyling>;
  metadata?: ElementMetadata;
}

/**
 * IconBox component - Icon + heading + text combo
 */
export const IconBox: FC<IconBoxProps> & { craft?: Record<string, unknown> } = ({
  iconName = 'Star',
  iconSize = '48px',
  iconColor = '#3b82f6',
  heading = 'Feature Title',
  headingTag = 'h3',
  headingColor = '#000000',
  text = 'Add a short description about this feature.',
  textColor = '#6b7280',
  layout = 'top',
  gap = '16px',
  padding = '24px',
  backgroundColor = 'transparent',
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

  // Parse size value
  const parseSize = (value: string) => {
    if (!value) return 48;
    const num = parseInt(value, 10);
    return isNaN(num) ? 48 : num;
  };

  // Parse value helper
  const parseValue = (value: string) => {
    if (!value) return '0px';
    return value.includes('px') || value.includes('rem') ? value : `${value}px`;
  };

  // Layout classes
  const layoutClasses: Record<string, string> = {
    top: 'flex-col items-center text-center',
    left: 'flex-row items-start text-left',
    right: 'flex-row-reverse items-start text-left',
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

  // Base styles (legacy - overridden by advanced styling)
  const baseStyle: React.CSSProperties = hasAdvancedStyling ? {} : {
    gap: parseValue(gap),
    padding: parseValue(padding),
    backgroundColor,
  };

  const HeadingTag = headingTag;
  const iconSizeNum = parseSize(iconSize);
  const iconElement = renderIcon(iconName, { size: iconSizeNum, color: iconColor, strokeWidth: 1.5 });

  return (
    <div
      ref={(ref) => {
        if (ref) connect(drag(ref));
      }}
      id={elementId}
      className={cn(
        'relative flex',
        !hasAdvancedStyling && layoutClasses[layout],
        !isPreviewMode && !hasCustomTransition && 'transition-all duration-150',
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
          Icon Box
        </span>
      )}
      
      {/* Icon */}
      <div className="shrink-0">
        {iconElement || (
          <div
            className="bg-muted rounded flex items-center justify-center"
            style={{ width: iconSizeNum, height: iconSizeNum }}
          >
            ?
          </div>
        )}
      </div>

      {/* Content */}
      <div className={cn('flex flex-col', layout === 'top' ? 'items-center' : 'items-start')}>
        <HeadingTag
          className="font-semibold m-0"
          style={{ color: headingColor, fontSize: '1.25rem' }}
        >
          {heading}
        </HeadingTag>
        <p
          className="m-0 mt-2"
          style={{ color: textColor, fontSize: '0.875rem' }}
        >
          {text}
        </p>
      </div>
    </div>
  );
};

/**
 * Craft.js configuration
 */
IconBox.craft = {
  displayName: 'Icon Box',
  props: {
    iconName: 'Star',
    iconSize: '48px',
    iconColor: '#3b82f6',
    heading: 'Feature Title',
    headingTag: 'h3',
    headingColor: '#000000',
    text: 'Add a short description about this feature.',
    textColor: '#6b7280',
    layout: 'top',
    gap: '16px',
    padding: '24px',
    backgroundColor: 'transparent',
    className: '',
    // Advanced styling props
    advancedStyling: {},
    pseudoStateStyling: {},
    metadata: undefined,
  },
  related: {
    settings: IconBoxSettings,
  },
  rules: {
    canDrag: () => true,
    canMoveIn: () => false, // Leaf node - no children
  },
};
