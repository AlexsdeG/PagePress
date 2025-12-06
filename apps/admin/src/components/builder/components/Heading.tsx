// PagePress v0.0.13 - 2025-12-05
// Heading component for the page builder with pen icon edit mode

import React, { useCallback, useEffect } from 'react';
import { useNode, useEditor } from '@craftjs/core';
import { cn } from '@/lib/utils';
import { useBuilderStore } from '@/stores/builder';
import { useAdvancedStyling, useGlobalTypography } from '../hooks';
import { RichTextEditor } from '../editor';
import { Pencil, Check, X } from 'lucide-react';
import type { FC } from 'react';
import type { HeadingProps } from '../types';
import { HeadingSettings } from './Heading.settings';
import type { AdvancedStyling } from '../inspector/styles/types';
import type { ElementMetadata } from '../inspector/sidebar/types';

/**
 * Default font sizes for each heading level (in px)
 */
export const defaultHeadingFontSizes: Record<number, number> = {
  1: 36,
  2: 30,
  3: 24,
  4: 20,
  5: 18,
  6: 16,
};

// Extend HeadingProps with advanced styling
interface ExtendedHeadingProps extends HeadingProps {
  advancedStyling?: Partial<AdvancedStyling>;
  metadata?: ElementMetadata;
  /** HTML content for rich text editing (inline formatting) */
  htmlContent?: string;
  /** Whether fontSize has been explicitly set by user (not auto from level) */
  fontSizeModified?: boolean;
  /** Whether to use global heading font */
  useGlobalFont?: boolean;
}

/**
 * Heading component - H1-H6 heading block with pen icon edit mode
 */
export const Heading: FC<ExtendedHeadingProps> & { craft?: Record<string, unknown> } = ({
  text = 'Heading',
  htmlContent,
  level = 2,
  fontSize,
  fontWeight = 'bold',
  textAlign = 'left',
  color = '#000000',
  linkUrl = '',
  linkTarget = '_self',
  className = '',
  fontSizeModified = false,
  useGlobalFont = true,
}) => {
  const { isPreviewMode, editingNodeId, setEditingNodeId } = useBuilderStore();
  const { getHeadingFontFamily, getHeadingLineHeight, getHeadingSize } = useGlobalTypography();

  const {
    connectors: { connect, drag },
    id,
    actions: { setProp },
  } = useNode((node) => ({
    id: node.id,
  }));

  const isEditing = editingNodeId === id;

  const { isSelected, isHovered } = useEditor((state) => ({
    isSelected: state.events.selected.has(id),
    isHovered: state.events.hovered.has(id),
  }));

  // Clear editing state when element is deselected
  useEffect(() => {
    if (!isSelected && isEditing) {
      setEditingNodeId(null);
    }
  }, [isSelected, isEditing, setEditingNodeId]);

  // Get advanced styling
  const {
    style: advancedStyle,
    className: advancedClassName,
    attributes,
    elementId,
    hasAdvancedStyling,
    hasCustomTransition,
  } = useAdvancedStyling();

  const fontWeightClass: Record<string, string> = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  };

  const textAlignClass: Record<string, string> = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  const HeadingTag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

  // Use user-set fontSize if modified, otherwise use global or default
  const getActualFontSize = (): string => {
    // If explicitly modified by user, use that
    if (fontSizeModified && fontSize !== undefined) {
      return `${fontSize}px`;
    }

    // If using global font, try to get it
    if (useGlobalFont) {
      const globalSize = getHeadingSize(`h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6');
      if (globalSize) return globalSize;
    }

    // Fallback to default for this level
    return `${defaultHeadingFontSizes[level]}px`;
  };

  // Handle content changes from rich text editor
  const handleContentChange = useCallback(
    (newHtml: string) => {
      setProp((props: ExtendedHeadingProps) => {
        props.htmlContent = newHtml;
        // Also update plain text for fallback/SEO
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = newHtml;
        props.text = tempDiv.textContent || '';
      });
    },
    [setProp]
  );

  // Start editing
  const handleStartEditing = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      setEditingNodeId(id);
    },
    [setEditingNodeId, id]
  );

  // Save and exit editing
  const handleSaveEditing = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      e?.preventDefault();
      setEditingNodeId(null);
    },
    [setEditingNodeId]
  );

  // Cancel editing
  const handleCancelEditing = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      setEditingNodeId(null);
    },
    [setEditingNodeId]
  );

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

  // Handle link click in editor mode
  const handleLinkClick = (e: React.MouseEvent) => {
    if (!isPreviewMode) {
      e.preventDefault();
    }
  };

  // Base styles - use global typography if enabled
  const baseStyle: React.CSSProperties = hasAdvancedStyling ? {} : {
    fontSize: getActualFontSize(),
    color,
    fontFamily: useGlobalFont ? getHeadingFontFamily() : undefined,
    lineHeight: useGlobalFont ? getHeadingLineHeight() : undefined,
  };

  // Display content - prefer htmlContent for rich text
  const displayContent = htmlContent || text;

  // Render content with optional link
  const renderContent = () => {
    if (linkUrl && !isEditing) {
      return (
        <a
          href={linkUrl}
          target={linkTarget}
          rel={linkTarget === '_blank' ? 'noopener noreferrer' : undefined}
          onClick={handleLinkClick}
          className="hover:opacity-80 transition-opacity"
          style={{ color: 'inherit', textDecoration: 'none' }}
          dangerouslySetInnerHTML={{ __html: displayContent }}
        />
      );
    }
    return <span dangerouslySetInnerHTML={{ __html: displayContent }} />;
  };

  // Preview mode - no edit controls
  if (isPreviewMode) {
    return React.createElement(
      HeadingTag,
      {
        ref: (ref: HTMLHeadingElement | null) => { if (ref) connect(ref); },
        id: elementId,
        className: cn(
          !hasAdvancedStyling && fontWeightClass[fontWeight],
          !hasAdvancedStyling && textAlignClass[textAlign],
          advancedClassName,
          className
        ),
        style: { ...baseStyle, ...advancedStyle },
        ...attributes,
      },
      renderContent()
    );
  }

  // Editing mode - show rich text editor with save/cancel buttons
  if (isEditing) {
    return React.createElement(
      HeadingTag,
      {
        ref: (ref: HTMLHeadingElement | null) => { if (ref) connect(ref); },
        id: elementId,
        className: cn(
          'relative',
          !hasAdvancedStyling && fontWeightClass[fontWeight],
          !hasAdvancedStyling && textAlignClass[textAlign],
          advancedClassName,
          className,
          'ring-2 ring-green-400 ring-offset-2'
        ),
        style: { ...baseStyle, ...advancedStyle },
        ...attributes,
      },
      <>
        {/* Selection label with save/cancel buttons */}
        <div className="absolute -top-6 left-0 flex items-center gap-1 z-10">
          <span className="text-xs text-white bg-green-600 px-1.5 py-0.5 rounded-t-lg font-medium">
            H{level} (Editing)
          </span>
          <button
            onClick={handleSaveEditing}
            className="h-5 w-5 flex items-center justify-center bg-green-600 hover:bg-green-700 text-white rounded-t-lg transition-colors"
            title="Save and exit (Escape)"
          >
            <Check className="h-3 w-3" />
          </button>
          <button
            onClick={handleCancelEditing}
            className="h-5 w-5 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-t-lg transition-colors"
            title="Cancel and exit"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
        <RichTextEditor
          content={displayContent}
          onChange={handleContentChange}
          onEscape={() => handleSaveEditing()}
          placeholder="Enter heading..."
          minimalMode={true}
          className={cn(
            !hasAdvancedStyling && fontWeightClass[fontWeight],
            !hasAdvancedStyling && textAlignClass[textAlign]
          )}
        />
      </>
    );
  }

  // Normal display mode with pen icon button
  return React.createElement(
    HeadingTag,
    {
      ref: (ref: HTMLHeadingElement | null) => { if (ref) connect(drag(ref)); },
      id: elementId,
      className: cn(
        'relative',
        !hasAdvancedStyling && fontWeightClass[fontWeight],
        !hasAdvancedStyling && textAlignClass[textAlign],
        !hasCustomTransition && 'transition-all duration-150',
        advancedClassName,
        className
      ),
      style: { ...baseStyle, ...advancedStyle, ...getOutlineStyles() },
      ...attributes,
      onDoubleClick: handleStartEditing,
    },
    <>
      {/* Selection label with pen icon */}
      {isSelected && (
        <div className="absolute -top-6 left-0 flex items-center gap-1 z-10">
          <span className="text-xs text-white bg-blue-600 px-1.5 py-0.5 rounded-t-lg font-medium">
            H{level}
          </span>
          <button
            onClick={handleStartEditing}
            className="h-5 w-5 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-t-lg transition-colors"
            title="Edit heading"
          >
            <Pencil className="h-3 w-3" />
          </button>
        </div>
      )}
      {renderContent()}
    </>
  );
};

/**
 * Craft.js configuration
 */
Heading.craft = {
  displayName: 'Heading',
  props: {
    text: 'Heading',
    htmlContent: 'Heading',
    level: 2,
    fontWeight: 'bold',
    textAlign: 'left',
    color: '#000000',
    linkUrl: '',
    linkTarget: '_self',
    className: '',
    fontSizeModified: false,
    useGlobalFont: true,
    advancedStyling: {},
    pseudoStateStyling: {},
    metadata: undefined,
  },
  related: {
    settings: HeadingSettings,
  },
  rules: {
    canDrag: () => true,
  },
};
