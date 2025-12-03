// PagePress v0.0.6 - 2025-12-03
// HTML Block component for the page builder

import { useNode, useEditor } from '@craftjs/core';
import DOMPurify from 'dompurify';
import { cn } from '@/lib/utils';
import { useBuilderStore } from '@/stores/builder';
import type { FC } from 'react';
import type { HTMLBlockProps } from '../types';
import { HTMLBlockSettings } from './HTMLBlock.settings';

/**
 * HTMLBlock component - Renders sanitized custom HTML
 */
export const HTMLBlock: FC<HTMLBlockProps> & { craft?: Record<string, unknown> } = ({
  html = '',
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

  // Sanitize HTML to prevent XSS attacks
  const sanitizedHtml = DOMPurify.sanitize(html, {
    ADD_TAGS: ['iframe'],
    ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling'],
  });

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

  // Placeholder when no HTML
  if (!html.trim()) {
    return (
      <div
        ref={(ref) => ref && connect(drag(ref))}
        className={cn(
          'relative bg-muted flex items-center justify-center border-2 border-dashed border-muted-foreground/25 p-8',
          !isPreviewMode && 'transition-all duration-150',
          className
        )}
        style={getOutlineStyles()}
      >
        {/* Selection label */}
        {isSelected && !isPreviewMode && (
          <span className="absolute -top-5 left-0 text-xs text-white bg-blue-600 px-1.5 py-0.5 rounded-t font-medium z-10">
            HTML Block
          </span>
        )}
        <div className="text-center text-muted-foreground">
          <span className="text-4xl">{'</>'}</span>
          <p className="text-sm mt-2">Add custom HTML code</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={(ref) => ref && connect(drag(ref))}
      className={cn(
        'relative',
        !isPreviewMode && 'transition-all duration-150',
        className
      )}
      style={getOutlineStyles()}
    >
      {/* Selection label */}
      {isSelected && !isPreviewMode && (
        <span className="absolute -top-5 left-0 text-xs text-white bg-blue-600 px-1.5 py-0.5 rounded-t font-medium z-10">
          HTML Block
        </span>
      )}
      <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
    </div>
  );
};

/**
 * Craft.js configuration
 */
HTMLBlock.craft = {
  displayName: 'HTML Block',
  props: {
    html: '',
    className: '',
  },
  related: {
    settings: HTMLBlockSettings,
  },
  rules: {
    canDrag: () => true,
  },
};
