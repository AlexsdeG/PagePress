// PagePress v0.0.6 - 2025-12-03
// Code Block component for the page builder - HTML, CSS, JavaScript

import { useNode, useEditor } from '@craftjs/core';
import DOMPurify from 'dompurify';
import { Code2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBuilderStore } from '@/stores/builder';
import type { FC } from 'react';
import type { HTMLBlockProps } from '../types';
import { HTMLBlockSettings } from './HTMLBlock.settings';

/**
 * CodeBlock component - Renders custom HTML, CSS, and JavaScript
 * Formerly known as HTMLBlock
 */
export const HTMLBlock: FC<HTMLBlockProps> & { craft?: Record<string, unknown> } = ({
  html = '',
  css = '',
  javascript = '',
  minHeight = 60,
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
    ADD_TAGS: ['iframe', 'style'],
    ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling'],
  });

  // Combine CSS with HTML (inject as style tag)
  const combinedContent = css 
    ? `<style>${css}</style>${sanitizedHtml}` 
    : sanitizedHtml;

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

  const hasContent = html.trim() || css.trim() || javascript.trim();

  // In preview mode, render the content (even if empty, use minHeight)
  if (isPreviewMode) {
    if (!hasContent) {
      return null; // Don't render anything in preview if no content
    }

    return (
      <div
        className={cn('relative', className)}
        style={{ minHeight: `${minHeight}px` }}
      >
        <div dangerouslySetInnerHTML={{ __html: combinedContent }} />
        {javascript && (
          <script dangerouslySetInnerHTML={{ __html: javascript }} />
        )}
      </div>
    );
  }

  // In edit mode, always show placeholder if empty or the content with visual indicator
  return (
    <div
      ref={(ref) => ref && connect(drag(ref))}
      className={cn(
        'relative transition-all duration-150',
        !hasContent && 'bg-muted border-2 border-dashed border-muted-foreground/25',
        className
      )}
      style={{
        minHeight: `${minHeight}px`,
        ...getOutlineStyles(),
      }}
    >
      {/* Selection label */}
      {isSelected && (
        <span className="absolute -top-5 left-0 text-xs text-white bg-blue-600 px-1.5 py-0.5 rounded-t font-medium z-10">
          Code Block
        </span>
      )}

      {hasContent ? (
        <>
          {/* Code indicator badge in edit mode */}
          <div className="absolute top-2 right-2 bg-slate-800 text-slate-200 px-2 py-0.5 rounded text-xs flex items-center gap-1 z-10">
            <Code2 className="h-3 w-3" />
            Code
          </div>
          <div dangerouslySetInnerHTML={{ __html: combinedContent }} />
        </>
      ) : (
        <div className="flex items-center justify-center h-full min-h-[inherit]">
          <div className="text-center text-muted-foreground">
            <Code2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Add custom code</p>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Craft.js configuration
 */
HTMLBlock.craft = {
  displayName: 'Code Block',
  props: {
    html: '',
    css: '',
    javascript: '',
    minHeight: 60,
    className: '',
  },
  related: {
    settings: HTMLBlockSettings,
  },
  rules: {
    canDrag: () => true,
  },
};
