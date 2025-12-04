// PagePress v0.0.9 - 2025-12-04
// Image component for the page builder with advanced styling support

import { useNode, useEditor } from '@craftjs/core';
import { cn } from '@/lib/utils';
import { useBuilderStore } from '@/stores/builder';
import { useAdvancedStyling } from '../hooks/useAdvancedStyling';
import type { FC } from 'react';
import type { ImageProps } from '../types';
import { ImageSettings } from './Image.settings';
import type { AdvancedStyling } from '../inspector/styles/types';
import type { ElementMetadata } from '../inspector/sidebar/types';

// Extend ImageProps with advanced styling
interface ExtendedImageProps extends ImageProps {
  advancedStyling?: Partial<AdvancedStyling>;
  metadata?: ElementMetadata;
}

/**
 * Image component - Image block with various display options
 */
export const BuilderImage: FC<ExtendedImageProps> & { craft?: Record<string, unknown> } = ({
  src = '',
  alt = 'Image',
  width = 'full',
  height = 'auto',
  objectFit = 'cover',
  borderRadius = 0,
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

  const objectFitClass: Record<string, string> = {
    cover: 'object-cover',
    contain: 'object-contain',
    fill: 'object-fill',
    none: 'object-none',
  };

  const widthValue = typeof width === 'number' ? `${width}px` : width === 'full' ? '100%' : 'auto';
  const heightValue = typeof height === 'number' ? `${height}px` : 'auto';

  // Convert absolute URLs to relative for proxy
  const getProxiedSrc = (url: string) => {
    if (!url) return '';
    // If the URL is from localhost:3000, convert to relative /uploads path
    if (url.includes('localhost:3000/uploads/')) {
      return url.replace(/http:\/\/localhost:3000/, '');
    }
    return url;
  };

  const proxiedSrc = getProxiedSrc(src);

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
    width: widthValue,
    height: heightValue,
    borderRadius: `${borderRadius}px`,
  };

  // Placeholder when no image source
  if (!src) {
    // In preview mode, show alt text or nothing
    if (isPreviewMode) {
      return alt ? (
        <div
          id={elementId}
          className={cn(
            'bg-muted/50 flex items-center justify-center text-muted-foreground text-sm p-4',
            advancedClassName,
            className
          )}
          style={{
            ...baseStyle,
            height: heightValue === 'auto' ? '100px' : heightValue,
            ...advancedStyle,
          }}
          {...attributes}
        >
          {alt}
        </div>
      ) : null;
    }

    // In edit mode, show placeholder
    return (
      <div
        ref={(ref) => { ref && connect(drag(ref)); }}
        id={elementId}
        className={cn(
          'relative bg-muted flex items-center justify-center border-2 border-dashed border-muted-foreground/25',
          'transition-all duration-150',
          advancedClassName,
          className
        )}
        style={{
          ...baseStyle,
          height: heightValue === 'auto' ? '200px' : heightValue,
          ...advancedStyle,
          ...getOutlineStyles(),
        }}
        {...attributes}
      >
        {/* Selection label */}
        {isSelected && (
          <span className="absolute -top-5 left-0 text-xs text-white bg-blue-600 px-1.5 py-0.5 rounded-t font-medium z-10">
            Image
          </span>
        )}
        <div className="text-center text-muted-foreground">
          <span className="text-4xl">🖼️</span>
          <p className="text-sm mt-2">Click to add image</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative inline-block" id={elementId}>
      {/* Selection label */}
      {isSelected && !isPreviewMode && (
        <span className="absolute -top-5 left-0 text-xs text-white bg-blue-600 px-1.5 py-0.5 rounded-t font-medium z-10">
          Image
        </span>
      )}
      <img
        ref={(ref) => { ref && connect(drag(ref)); }}
        src={proxiedSrc}
        alt={alt}
        className={cn(
          !hasAdvancedStyling && objectFitClass[objectFit],
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
      />
    </div>
  );
};

/**
 * Craft.js configuration
 */
BuilderImage.craft = {
  displayName: 'Image',
  props: {
    src: '',
    alt: 'Image',
    width: 'full',
    height: 'auto',
    objectFit: 'cover',
    borderRadius: 0,
    className: '',
    // Advanced styling props
    advancedStyling: {},
    pseudoStateStyling: {},
    metadata: undefined,
  },
  related: {
    settings: ImageSettings,
  },
  rules: {
    canDrag: () => true,
  },
};
