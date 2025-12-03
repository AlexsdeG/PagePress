// PagePress v0.0.6 - 2025-12-03
// Image component for the page builder

import { useNode, useEditor } from '@craftjs/core';
import { cn } from '@/lib/utils';
import { useBuilderStore } from '@/stores/builder';
import type { FC } from 'react';
import type { ImageProps } from '../types';
import { ImageSettings } from './Image.settings';

/**
 * Image component - Image block with various display options
 */
export const BuilderImage: FC<ImageProps> & { craft?: Record<string, unknown> } = ({
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

  const objectFitClass: Record<string, string> = {
    cover: 'object-cover',
    contain: 'object-contain',
    fill: 'object-fill',
    none: 'object-none',
  };

  const widthValue = typeof width === 'number' ? `${width}px` : width === 'full' ? '100%' : 'auto';
  const heightValue = typeof height === 'number' ? `${height}px` : 'auto';

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

  // Placeholder when no image source
  if (!src) {
    return (
      <div
        ref={(ref) => ref && connect(drag(ref))}
        className={cn(
          'relative bg-muted flex items-center justify-center border-2 border-dashed border-muted-foreground/25',
          !isPreviewMode && 'transition-all duration-150',
          className
        )}
        style={{
          width: widthValue,
          height: heightValue === 'auto' ? '200px' : heightValue,
          borderRadius: `${borderRadius}px`,
          ...getOutlineStyles(),
        }}
      >
        {/* Selection label */}
        {isSelected && !isPreviewMode && (
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
    <div className="relative inline-block">
      {/* Selection label */}
      {isSelected && !isPreviewMode && (
        <span className="absolute -top-5 left-0 text-xs text-white bg-blue-600 px-1.5 py-0.5 rounded-t font-medium z-10">
          Image
        </span>
      )}
      <img
        ref={(ref) => ref && connect(drag(ref))}
        src={src}
        alt={alt}
        className={cn(
          objectFitClass[objectFit],
          !isPreviewMode && 'transition-all duration-150',
          className
        )}
        style={{
          width: widthValue,
          height: heightValue,
          borderRadius: `${borderRadius}px`,
          ...getOutlineStyles(),
        }}
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
  },
  related: {
    settings: ImageSettings,
  },
  rules: {
    canDrag: () => true,
  },
};
