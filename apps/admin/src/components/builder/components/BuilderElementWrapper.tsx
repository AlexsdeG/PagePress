// PagePress v0.0.15 - 2026-02-28
// Shared builder element utilities for visual feedback

import { useNode, useEditor } from '@craftjs/core';
import { useBuilderStore } from '@/stores/builder';

/**
 * Hook to get element outline styles based on selection/hover state
 * @param displayName - The display name to show in the selection label
 */
export function useBuilderElementStyles(displayName: string = 'Element') {
  const { isPreviewMode } = useBuilderStore();
  
  const { id, isGlobal, globalName } = useNode((node) => ({
    id: node.id,
    isGlobal: !!(node.data.custom?.globalElementId),
    globalName: node.data.custom?.globalElementName as string | undefined,
  }));

  const { isSelected, isHovered } = useEditor((state) => ({
    isSelected: state.events.selected.has(id),
    isHovered: state.events.hovered.has(id),
  }));

  /**
   * Get outline styles based on selection/hover state
   */
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

    if (isGlobal) {
      return {
        outline: '1px dashed #9333ea',
        outlineOffset: '-1px',
      };
    }
    
    return {};
  };

  /**
   * Get classes for the element
   */
  const getElementClasses = () => {
    if (isPreviewMode) return '';
    return 'relative transition-all duration-150';
  };

  return {
    isPreviewMode,
    isSelected,
    isHovered,
    displayName,
    isGlobal,
    globalName,
    getOutlineStyles,
    getElementClasses,
  };
}

/**
 * Selection label component shown when an element is selected
 */
export function SelectionLabel({ 
  displayName, 
  isSelected, 
  isPreviewMode,
  isGlobal,
}: { 
  displayName: string; 
  isSelected: boolean; 
  isPreviewMode: boolean;
  isGlobal?: boolean;
}) {
  if (isPreviewMode) return null;
  
  // Global badge shown even when not selected
  if (!isSelected && isGlobal) {
    return (
      <span className="absolute -top-5 right-0 text-[10px] text-white bg-purple-600 px-1.5 py-0.5 rounded-t-lg font-medium z-10 whitespace-nowrap">
        🌐 Global
      </span>
    );
  }
  
  if (!isSelected) return null;
  
  return (
    <span className="absolute -top-5 left-0 text-xs text-white bg-blue-600 px-1.5 py-0.5 rounded-t-lg font-medium z-10 whitespace-nowrap">
      {isGlobal ? '🌐 ' : ''}{displayName}
    </span>
  );
}
