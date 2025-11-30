// PagePress v0.0.5 - 2025-11-30
// Image component for the page builder

import { useNode } from '@craftjs/core';
import { cn } from '@/lib/utils';
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
  const {
    connectors: { connect, drag },
    selected,
  } = useNode((state) => ({
    selected: state.events.selected,
  }));

  const objectFitClass: Record<string, string> = {
    cover: 'object-cover',
    contain: 'object-contain',
    fill: 'object-fill',
    none: 'object-none',
  };

  const widthValue = typeof width === 'number' ? `${width}px` : width === 'full' ? '100%' : 'auto';
  const heightValue = typeof height === 'number' ? `${height}px` : 'auto';

  // Placeholder when no image source
  if (!src) {
    return (
      <div
        ref={(ref) => ref && connect(drag(ref))}
        className={cn(
          'bg-muted flex items-center justify-center border-2 border-dashed border-muted-foreground/25',
          selected && 'outline-dashed outline-2 outline-blue-500 outline-offset-2',
          className
        )}
        style={{
          width: widthValue,
          height: heightValue === 'auto' ? '200px' : heightValue,
          borderRadius: `${borderRadius}px`,
        }}
      >
        <div className="text-center text-muted-foreground">
          <span className="text-4xl">🖼️</span>
          <p className="text-sm mt-2">Click to add image</p>
        </div>
      </div>
    );
  }

  return (
    <img
      ref={(ref) => ref && connect(drag(ref))}
      src={src}
      alt={alt}
      className={cn(
        objectFitClass[objectFit],
        selected && 'outline-dashed outline-2 outline-blue-500 outline-offset-2',
        className
      )}
      style={{
        width: widthValue,
        height: heightValue,
        borderRadius: `${borderRadius}px`,
      }}
    />
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
