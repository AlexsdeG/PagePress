// PagePress v0.0.6 - 2025-12-03
// Floating toolbar with quick actions for selected element

import { useCallback, useEffect, useState } from 'react';
import { useEditor } from '@craftjs/core';
import { 
  Copy, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  CopyPlus,
  BoxSelect
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useBuilderStore } from '@/stores/builder';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { duplicateNode } from '../utils/duplicateNode';

/**
 * FloatingToolbar - Quick actions that appear above the selected element
 */
export function FloatingToolbar() {
  const { isPreviewMode, setClipboard } = useBuilderStore();
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  const { 
    selected, 
    parentId,
    siblings,
    actions,
    query,
  } = useEditor((state) => {
    const [selectedId] = state.events.selected;
    const node = selectedId ? state.nodes[selectedId] : null;
    const pId = node?.data.parent;
    const parent = pId ? state.nodes[pId] : null;
    const sibs = parent?.data.nodes || [];

    return {
      selected: selectedId,
      parentId: pId,
      siblings: sibs,
    };
  });

  // Calculate position based on selected element
  useEffect(() => {
    if (!selected || isPreviewMode) {
      requestAnimationFrame(() => setPosition(null));
      return;
    }

    const updatePosition = () => {
      const element = document.querySelector(`[data-craft-node-id="${selected}"]`) as HTMLElement;
      if (!element) {
        setPosition(null);
        return;
      }

      const rect = element.getBoundingClientRect();
      const canvasElement = document.querySelector('[data-builder-canvas]');
      const canvasRect = canvasElement?.getBoundingClientRect();

      if (!canvasRect) {
        setPosition(null);
        return;
      }

      // Position toolbar above the element, centered
      const top = rect.top - canvasRect.top - 40;
      const left = rect.left - canvasRect.left + rect.width / 2;

      setPosition({ top: Math.max(0, top), left });
    };

    updatePosition();
    
    // Update position on scroll or resize
    const handleUpdate = () => requestAnimationFrame(updatePosition);
    window.addEventListener('scroll', handleUpdate, true);
    window.addEventListener('resize', handleUpdate);

    return () => {
      window.removeEventListener('scroll', handleUpdate, true);
      window.removeEventListener('resize', handleUpdate);
    };
  }, [selected, isPreviewMode]);

  // Get current index in siblings
  const currentIndex = siblings.indexOf(selected || '');
  const canMoveUp = currentIndex > 0;
  const canMoveDown = currentIndex < siblings.length - 1;
  const isRoot = selected === 'ROOT';

  // Action handlers
  const handleDuplicate = useCallback(() => {
    if (!selected || isRoot || !parentId) return;
    
    try {
      const parentNode = query.node(parentId).get();
      if (parentNode && parentNode.data.nodes) {
        const currentIndex = parentNode.data.nodes.indexOf(selected);
        
        // Use the safe duplicate function
        const newNodeId = duplicateNode(query, actions, selected, parentId, currentIndex + 1);
        
        if (newNodeId) {
          setTimeout(() => {
            actions.selectNode(newNodeId);
          }, 50);
          toast.success('Element duplicated');
        } else {
          toast.error('Failed to duplicate element');
        }
      }
    } catch (error) {
      console.error('Duplicate error:', error);
      toast.error('Failed to duplicate element');
    }
  }, [selected, parentId, query, actions, isRoot]);

  const handleDelete = useCallback(() => {
    if (!selected || isRoot) return;
    actions.delete(selected);
  }, [selected, actions, isRoot]);

  const handleMoveUp = useCallback(() => {
    if (!selected || !canMoveUp || !parentId) return;
    actions.move(selected, parentId, currentIndex - 1);
  }, [selected, canMoveUp, parentId, currentIndex, actions]);

  const handleMoveDown = useCallback(() => {
    if (!selected || !canMoveDown || !parentId) return;
    actions.move(selected, parentId, currentIndex + 2);
  }, [selected, canMoveDown, parentId, currentIndex, actions]);

  const handleCopy = useCallback(() => {
    if (!selected || isRoot) return;
    const nodeTree = query.node(selected).toSerializedNode();
    setClipboard(JSON.stringify(nodeTree));
  }, [selected, query, setClipboard, isRoot]);

  const handleSelectParent = useCallback(() => {
    if (parentId && parentId !== 'ROOT') {
      actions.selectNode(parentId);
    }
  }, [parentId, actions]);

  // Don't render if nothing selected, preview mode, or no position
  if (!selected || isPreviewMode || !position || isRoot) {
    return null;
  }

  return (
    <div
      className={cn(
        'absolute z-50 flex items-center gap-0.5 bg-background border rounded-lg shadow-lg p-1',
        'transform -translate-x-1/2'
      )}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Select Parent */}
      {parentId && parentId !== 'ROOT' && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleSelectParent}
            >
              <BoxSelect className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Select Parent</TooltipContent>
        </Tooltip>
      )}

      {/* Divider */}
      {parentId && parentId !== 'ROOT' && (
        <div className="w-px h-4 bg-border mx-0.5" />
      )}

      {/* Move Up */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleMoveUp}
            disabled={!canMoveUp}
          >
            <ChevronUp className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Move Up</TooltipContent>
      </Tooltip>

      {/* Move Down */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleMoveDown}
            disabled={!canMoveDown}
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Move Down</TooltipContent>
      </Tooltip>

      {/* Divider */}
      <div className="w-px h-4 bg-border mx-0.5" />

      {/* Copy */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleCopy}
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Copy (Ctrl+C)</TooltipContent>
      </Tooltip>

      {/* Duplicate */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleDuplicate}
          >
            <CopyPlus className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Duplicate (Ctrl+D)</TooltipContent>
      </Tooltip>

      {/* Divider */}
      <div className="w-px h-4 bg-border mx-0.5" />

      {/* Delete */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleDelete}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Delete (Del)</TooltipContent>
      </Tooltip>
    </div>
  );
}
