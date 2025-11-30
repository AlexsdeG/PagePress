// PagePress v0.0.5 - 2025-11-30
// HTML Block component for the page builder

import { useNode } from '@craftjs/core';
import DOMPurify from 'dompurify';
import { cn } from '@/lib/utils';
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
  const {
    connectors: { connect, drag },
    selected,
  } = useNode((state) => ({
    selected: state.events.selected,
  }));

  // Sanitize HTML to prevent XSS attacks
  const sanitizedHtml = DOMPurify.sanitize(html, {
    ADD_TAGS: ['iframe'],
    ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling'],
  });

  // Placeholder when no HTML
  if (!html.trim()) {
    return (
      <div
        ref={(ref) => ref && connect(drag(ref))}
        className={cn(
          'bg-muted flex items-center justify-center border-2 border-dashed border-muted-foreground/25 p-8',
          selected && 'outline-dashed outline-2 outline-blue-500 outline-offset-2',
          className
        )}
      >
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
        selected && 'outline-dashed outline-2 outline-blue-500 outline-offset-2',
        className
      )}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
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
