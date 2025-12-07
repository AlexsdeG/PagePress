// PagePress v0.0.9 - 2025-12-04
// List component for the page builder with advanced styling support

import { useNode, useEditor } from '@craftjs/core';
import { cn } from '@/lib/utils';
import { useBuilderStore } from '@/stores/builder';
import { useAdvancedStyling, useGlobalTypography } from '../hooks';
import { useEffect } from 'react';
import type { FC } from 'react';
import { ListSettings } from './List.settings';
import type { AdvancedStyling } from '../inspector/styles/types';
import type { ElementMetadata } from '../inspector/sidebar/types';
import { RichTextEditor } from '../editor';
import { Pencil, Check, X } from 'lucide-react';

/**
 * List component props
 */
export interface ListProps {
  listType?: 'ul' | 'ol';
  items?: string[];
  bulletStyle?: 'disc' | 'circle' | 'square' | 'decimal' | 'alpha' | 'roman' | 'none';
  color?: string;
  fontSize?: string;
  lineHeight?: string;
  gap?: string;
  padding?: string;
  className?: string;
  // Advanced styling
  advancedStyling?: Partial<AdvancedStyling>;
  metadata?: ElementMetadata;
  htmlContent?: string;
}

/**
 * List component - UL/OL with bullet/number style options
 */
export const List: FC<ListProps> & { craft?: Record<string, unknown> } = ({
  listType = 'ul',
  items = ['First item', 'Second item', 'Third item'],
  bulletStyle = 'disc',
  color = '#000000',
  fontSize = '16px',
  lineHeight = '1.6',
  gap = '8px',
  padding = '0px',
  className = '',
  ...props
}) => {
  const { isPreviewMode, editingNodeId, setEditingNodeId } = useBuilderStore();

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

  // Initialize font size from global settings on mount
  const { getBaseFontSize } = useGlobalTypography();
  useEffect(() => {
    // Check if fontSize is the default '16px' string or undefined
    if ((fontSize === '16px' || !fontSize)) {
      const baseSize = getBaseFontSize();
      if (baseSize && baseSize !== 16) {
        setProp((props: ListProps) => {
          props.fontSize = `${baseSize}px`;

          // Also update advanced styling for consistency
          if (!props.advancedStyling) props.advancedStyling = {};
          if (!props.advancedStyling.typography) props.advancedStyling.typography = {};
          props.advancedStyling.typography.fontSize = `${baseSize}px`;
        });
      }
    }
  }, []); // Run once on mount

  // Get advanced styling
  const {
    style: advancedStyle,
    className: advancedClassName,
    attributes,
    elementId,
    hasAdvancedStyling,
    hasCustomTransition,
  } = useAdvancedStyling();

  // Map bullet style to CSS list-style-type
  const listStyleMap: Record<string, string> = {
    disc: 'disc',
    circle: 'circle',
    square: 'square',
    decimal: 'decimal',
    alpha: 'lower-alpha',
    roman: 'lower-roman',
    none: 'none',
  };

  // Parse value helper
  const parseValue = (value: string) => {
    if (!value) return '0px';
    return value.includes('px') || value.includes('rem') ? value : `${value}px`;
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

  // Handle content changes from rich text editor
  const handleContentChange = (newHtml: string) => {
    setProp((p: ListProps) => {
      p.htmlContent = newHtml;
    });
  };

  // Start editing
  const handleStartEditing = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setEditingNodeId(id);
  };

  // Save and exit editing
  const handleSaveEditing = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    e?.preventDefault();
    setEditingNodeId(null);
  };

  // Cancel editing
  const handleCancelEditing = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setEditingNodeId(null);
  };

  // Base list styles (legacy - overridden by advanced styling)
  const baseListStyle: React.CSSProperties = hasAdvancedStyling ? {} : {
    color,
    fontSize: parseValue(fontSize),
    lineHeight,
    padding: parseValue(padding),
  };

  // Inject gap styles and bullet styles for inner lists
  const gapValue = parseValue(gap);
  const bulletStyleValue = listStyleMap[bulletStyle];

  const customStyles = `
    #${elementId} li {
      margin-bottom: ${gapValue};
    }
    #${elementId} li:last-child {
      margin-bottom: 0;
    }
    #${elementId} ul, #${elementId} ol {
      list-style-type: ${bulletStyleValue};
      padding-left: ${bulletStyle !== 'none' ? '1.5em' : '0'};
      margin-left: ${bulletStyle !== 'none' ? '1em' : '0'};
      list-style-position: outside;
    }
  `;

  // Display content - prefer htmlContent
  // If no htmlContent, construct it from items
  const displayContent = props.htmlContent ||
    `<${listType}>${items.map(i => `<li>${i}</li>`).join('')}</${listType}>`;

  // Editing mode
  if (isEditing) {
    return (
      <div
        ref={() => {
          // Do not connect in edit mode
        }}
        id={elementId}
        className={cn(
          'relative',
          !isPreviewMode && !hasCustomTransition && 'transition-all duration-150',
          advancedClassName,
          'ring-2 ring-green-400 ring-offset-2'
        )}
        style={{
          ...advancedStyle,
          ...baseListStyle,
        }}
        {...attributes}
      >
        <style>{customStyles}</style>

        {/* Selection label with save/cancel buttons */}
        <div className="absolute -top-6 left-0 flex items-center gap-1 z-10">
          <span className="text-xs text-white bg-green-600 px-1.5 py-0.5 rounded-t-lg font-medium">
            List (Editing)
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
          placeholder="List items..."
          className={cn('min-h-[50px]', className)}
        />
      </div>
    );
  }

  return (
    <div
      ref={(ref) => {
        if (ref) connect(drag(ref));
      }}
      id={elementId}
      className={cn(
        'relative',
        !isPreviewMode && !hasCustomTransition && 'transition-all duration-150',
        advancedClassName,
      )}
      style={{
        ...advancedStyle,
        ...baseListStyle,
        ...getOutlineStyles(),
      }}
      {...attributes}
      onDoubleClick={handleStartEditing}
    >
      <style>{customStyles}</style>

      {/* Selection label with pen icon */}
      {isSelected && !isPreviewMode && (
        <div className="absolute -top-5 left-0 flex items-center gap-1 z-10">
          <span className="text-xs text-white bg-blue-600 px-1.5 py-0.5 rounded-t-lg font-medium">
            List
          </span>
          <button
            onClick={handleStartEditing}
            className="h-5 w-5 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-t-lg transition-colors"
            title="Edit list"
          >
            <Pencil className="h-3 w-3" />
          </button>
        </div>
      )}

      <div
        className={cn('m-0', className)}
        dangerouslySetInnerHTML={{ __html: displayContent }}
      />
    </div>
  );
};

/**
 * Craft.js configuration
 */
List.craft = {
  displayName: 'List',
  props: {
    listType: 'ul',
    items: ['First item', 'Second item', 'Third item'],
    bulletStyle: 'disc',
    color: '#000000',
    fontSize: '16px',
    lineHeight: '1.6',
    gap: '8px',
    padding: '0px',
    className: '',
    // Advanced styling props
    advancedStyling: {},
    pseudoStateStyling: {},
    metadata: undefined,
  },
  related: {
    settings: ListSettings,
  },
  rules: {
    canDrag: () => true,
    canMoveIn: () => false, // Leaf node - no children
  },
};
