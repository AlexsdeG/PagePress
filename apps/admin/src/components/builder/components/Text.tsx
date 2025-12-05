// PagePress v0.0.13 - 2025-12-05
// Text component for the page builder with pen icon edit mode

import { useNode, useEditor } from '@craftjs/core';
import { useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useBuilderStore } from '@/stores/builder';
import { useAdvancedStyling, useGlobalTypography } from '../hooks';
import { RichTextEditor } from '../editor';
import { Pencil, Check, X } from 'lucide-react';
import type { FC } from 'react';
import type { TextProps } from '../types';
import { TextSettings } from './Text.settings';
import type { AdvancedStyling } from '../inspector/styles/types';
import type { ElementMetadata } from '../inspector/sidebar/types';

// Extend TextProps with advanced styling
interface ExtendedTextProps extends TextProps {
  advancedStyling?: Partial<AdvancedStyling>;
  metadata?: ElementMetadata;
  /** HTML content for rich text editing */
  htmlContent?: string;
  /** Whether to inherit font from global settings */
  useGlobalFont?: boolean;
}

/**
 * Text component - Paragraph text block with pen icon edit mode
 */
export const Text: FC<ExtendedTextProps> & { craft?: Record<string, unknown> } = ({
  text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  htmlContent,
  fontSize = 16,
  fontWeight = 'normal',
  textAlign = 'left',
  color = '#000000',
  lineHeight = 1.5,
  letterSpacing = 0,
  className = '',
  useGlobalFont = true,
}) => {
  const { isPreviewMode, editingNodeId, setEditingNodeId } = useBuilderStore();
  const { getBodyFontFamily, getBodyLineHeight } = useGlobalTypography();
  
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
    justify: 'text-justify',
  };

  // Handle content changes from rich text editor
  const handleContentChange = useCallback(
    (newHtml: string) => {
      setProp((props: ExtendedTextProps) => {
        props.htmlContent = newHtml;
        // Also update plain text for fallback
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

  // Base styles - use global typography if enabled
  const baseStyle: React.CSSProperties = hasAdvancedStyling ? {} : {
    fontSize: `${fontSize}px`,
    color,
    lineHeight: useGlobalFont ? getBodyLineHeight() : lineHeight,
    letterSpacing: `${letterSpacing}px`,
    fontFamily: useGlobalFont ? getBodyFontFamily() : undefined,
  };

  // Display content - prefer htmlContent for rich text
  const displayContent = htmlContent || `<p>${text}</p>`;

  // In preview mode, render static content
  if (isPreviewMode) {
    return (
      <div
        ref={(ref) => { ref && connect(ref); }}
        id={elementId}
        className={cn(
          !hasAdvancedStyling && fontWeightClass[fontWeight],
          !hasAdvancedStyling && textAlignClass[textAlign],
          advancedClassName,
          className
        )}
        style={{
          ...baseStyle,
          ...advancedStyle,
        }}
        {...attributes}
      >
        <div
          className="prose prose-sm dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: displayContent }}
        />
      </div>
    );
  }

  // Editing mode - show rich text editor with save/cancel buttons
  if (isEditing) {
    return (
      <div
        ref={(ref) => { ref && connect(ref); }}
        id={elementId}
        className={cn(
          'relative',
          !hasAdvancedStyling && fontWeightClass[fontWeight],
          !hasAdvancedStyling && textAlignClass[textAlign],
          advancedClassName,
          className,
          'ring-2 ring-green-400 ring-offset-2'
        )}
        style={{
          ...baseStyle,
          ...advancedStyle,
        }}
        {...attributes}
      >
        {/* Selection label with save/cancel buttons */}
        <div className="absolute -top-6 left-0 flex items-center gap-1 z-10">
          <span className="text-xs text-white bg-green-600 px-1.5 py-0.5 rounded-t-lg font-medium">
            Text (Editing)
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
          placeholder="Start typing..."
          minimalMode={false}
          className={cn(
            !hasAdvancedStyling && fontWeightClass[fontWeight],
            !hasAdvancedStyling && textAlignClass[textAlign]
          )}
        />
      </div>
    );
  }

  // Normal display mode with pen icon button
  return (
    <div
      ref={(ref) => { ref && connect(drag(ref)); }}
      id={elementId}
      className={cn(
        'relative',
        !hasAdvancedStyling && fontWeightClass[fontWeight],
        !hasAdvancedStyling && textAlignClass[textAlign],
        !hasCustomTransition && 'transition-all duration-150',
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
      {/* Selection label with pen icon */}
      {isSelected && (
        <div className="absolute -top-6 left-0 flex items-center gap-1 z-10">
          <span className="text-xs text-white bg-blue-600 px-1.5 py-0.5 rounded-t-lg font-medium">
            Text
          </span>
          <button
            onClick={handleStartEditing}
            className="h-5 w-5 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-t-lg transition-colors"
            title="Edit text"
          >
            <Pencil className="h-3 w-3" />
          </button>
        </div>
      )}
      {/* Render HTML content */}
      <div
        className="prose prose-sm dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: displayContent }}
      />
    </div>
  );
};

/**
 * Craft.js configuration
 */
Text.craft = {
  displayName: 'Text',
  props: {
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    htmlContent: '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>',
    fontSize: 16,
    fontWeight: 'normal',
    textAlign: 'left',
    color: '#000000',
    lineHeight: 1.5,
    letterSpacing: 0,
    className: '',
    useGlobalFont: true,
    // Advanced styling props
    advancedStyling: {},
    pseudoStateStyling: {},
    metadata: undefined,
  },
  related: {
    settings: TextSettings,
  },
  rules: {
    canDrag: () => true,
  },
};
