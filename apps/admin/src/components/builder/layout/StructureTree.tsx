// PagePress v0.0.9 - 2025-12-04
// Structure tree panel with drag-drop reordering

import { useState, useCallback, useRef, useEffect } from 'react';
import { useEditor } from '@craftjs/core';
import { 
  Box, 
  Type, 
  Heading1, 
  Image, 
  MousePointer2, 
  Code2,
  ChevronRight,
  ChevronDown,
  Trash2,
  CopyPlus,
  LayoutGrid,
  Columns,
  Minus,
  Space,
  Link as LinkIcon,
  Play,
  LayoutPanelTop,
  Rows,
  Pencil,
  Check,
  X,
  GripVertical,
  ArrowUp,
  ArrowDown,
  ChevronsUp,
  ChevronsDown,
  MoreVertical,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useBuilderStore } from '@/stores/builder';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { duplicateNode } from '../utils/duplicateNode';
import type { ElementMetadata } from '../inspector/sidebar/types';

// Component type to icon mapping
const componentIcons: Record<string, React.ElementType> = {
  Container: Box,
  Div: Box,
  Section: LayoutPanelTop,
  Row: Columns,
  Column: Rows,
  Text: Type,
  Paragraph: Type,
  Heading: Heading1,
  Image: Image,
  Video: Play,
  Button: MousePointer2,
  Link: LinkIcon,
  TextLink: LinkIcon,
  'Code Block': Code2,
  'HTML Block': Code2,
  HTMLBlock: Code2,
  Divider: Minus,
  Spacer: Space,
  Icon: LayoutGrid,
  IconBox: LayoutGrid,
  List: Type,
};

// Drag state for tree reordering
interface DragState {
  draggedId: string | null;
  dropTargetId: string | null;
  dropPosition: 'before' | 'after' | 'inside' | null;
}

interface TreeNodeProps {
  nodeId: string;
  depth: number;
  dragState: DragState;
  onDragStart: (nodeId: string) => void;
  onDragEnd: () => void;
  onDragOver: (nodeId: string, position: 'before' | 'after' | 'inside') => void;
  onDrop: () => void;
}

/**
 * Single node in the structure tree
 */
function TreeNode({ 
  nodeId, 
  depth, 
  dragState,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
}: TreeNodeProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const nodeRef = useRef<HTMLDivElement>(null);
  const { hoveredNodeId, setHoveredNodeId } = useBuilderStore();

  const { node, isSelected, childNodes, actions, query } = useEditor((state) => {
    const currentNode = state.nodes[nodeId];
    const [selectedId] = state.events.selected;
    const children = currentNode?.data?.nodes || [];

    return {
      node: currentNode,
      isSelected: selectedId === nodeId,
      childNodes: children,
    };
  });

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Save the edited name
  const handleSaveEdit = useCallback(() => {
    if (!node) return;
    actions.setProp(nodeId, (props: Record<string, unknown>) => {
      const currentMetadata = (props.metadata || {}) as ElementMetadata;
      props.metadata = {
        ...currentMetadata,
        customName: editValue.trim() || undefined,
      };
    });
    setIsEditing(false);
    toast.success('Element renamed');
  }, [actions, nodeId, editValue, node]);

  // Cancel editing
  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditValue('');
  }, []);

  if (!node) return null;

  // Get custom name from element metadata or fall back to display name
  const metadata = node.data.props?.metadata as ElementMetadata | undefined;
  const customName = metadata?.customName;
  const componentName = node.data.displayName || node.data.name || 'Element';
  const displayName = customName || componentName;
  const Icon = componentIcons[componentName] || Box;
  const hasChildren = childNodes.length > 0;
  const isRoot = nodeId === 'ROOT';
  const isHovered = hoveredNodeId === nodeId;
  const isCanvas = node.data.isCanvas;

  // Get parent and sibling info for move actions
  const parentId = node.data.parent;
  const parentNode = parentId ? query.node(parentId).get() : null;
  const siblings = parentNode?.data?.nodes || [];
  const currentIndex = siblings.indexOf(nodeId);
  const canMoveUp = currentIndex > 0;
  const canMoveDown = currentIndex < siblings.length - 1;

  // Drag state checks
  const isDragging = dragState.draggedId === nodeId;
  const isDropTarget = dragState.dropTargetId === nodeId;
  const dropPosition = dragState.dropPosition;

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    actions.selectNode(nodeId);
  };

  // Start editing the name
  const handleStartEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isRoot) return;
    setEditValue(customName || '');
    setIsEditing(true);
  };

  // Handle keyboard events in edit mode
  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const handleDuplicate = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (isRoot) return;
    
    if (!parentId) return;
    
    try {
      const parentNode = query.node(parentId).get();
      if (parentNode && parentNode.data.nodes) {
        const currentIndex = parentNode.data.nodes.indexOf(nodeId);
        
        const newNodeId = duplicateNode(query, actions, nodeId, parentId, currentIndex + 1);
        
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
  };

  const handleDelete = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (isRoot) return;
    actions.delete(nodeId);
  };

  // Move actions
  const handleMoveUp = () => {
    if (!canMoveUp || !parentId) return;
    actions.move(nodeId, parentId, currentIndex - 1);
    toast.success('Moved up');
  };

  const handleMoveDown = () => {
    if (!canMoveDown || !parentId) return;
    actions.move(nodeId, parentId, currentIndex + 2);
    toast.success('Moved down');
  };

  const handleMoveToTop = () => {
    if (!parentId || currentIndex === 0) return;
    actions.move(nodeId, parentId, 0);
    toast.success('Moved to top');
  };

  const handleMoveToBottom = () => {
    if (!parentId || currentIndex === siblings.length - 1) return;
    actions.move(nodeId, parentId, siblings.length);
    toast.success('Moved to bottom');
  };

  const handleMouseEnter = () => {
    setHoveredNodeId(nodeId);
  };

  const handleMouseLeave = () => {
    setHoveredNodeId(null);
  };

  // Drag handlers
  const handleDragStart = (e: React.DragEvent) => {
    if (isRoot) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', nodeId);
    onDragStart(nodeId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (dragState.draggedId === nodeId) return;
    
    const rect = nodeRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const y = e.clientY - rect.top;
    const height = rect.height;
    
    let position: 'before' | 'after' | 'inside';
    if (isCanvas && y > height * 0.25 && y < height * 0.75) {
      position = 'inside';
    } else if (y < height / 2) {
      position = 'before';
    } else {
      position = 'after';
    }
    
    onDragOver(nodeId, position);
  };

  const handleDragLeave = () => {
    // Only clear if leaving the tree entirely
  };

  const handleDropEvent = (e: React.DragEvent) => {
    e.preventDefault();
    onDrop();
  };

  return (
    <div>
      <div
        ref={nodeRef}
        draggable={!isRoot && !isEditing}
        onDragStart={handleDragStart}
        onDragEnd={onDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDropEvent}
        className={cn(
          'flex items-center gap-1 py-1 px-1 rounded-md cursor-pointer transition-colors group relative',
          isSelected && 'bg-blue-500/20 text-blue-600',
          isHovered && !isSelected && 'bg-muted',
          !isSelected && !isHovered && 'hover:bg-muted/50',
          isDragging && 'opacity-50',
          isDropTarget && dropPosition === 'before' && 'before:absolute before:left-0 before:right-0 before:top-0 before:h-0.5 before:bg-blue-500',
          isDropTarget && dropPosition === 'after' && 'after:absolute after:left-0 after:right-0 after:bottom-0 after:h-0.5 after:bg-blue-500',
          isDropTarget && dropPosition === 'inside' && 'ring-2 ring-blue-500 ring-inset'
        )}
        style={{ paddingLeft: `${depth * 12 + 4}px` }}
        onClick={handleSelect}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Drag handle */}
        {!isRoot && (
          <GripVertical className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-50 cursor-grab active:cursor-grabbing shrink-0" />
        )}

        {/* Expand/Collapse button */}
        {hasChildren ? (
          <button
            className="p-0.5 hover:bg-muted rounded"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
          >
            {isOpen ? (
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
            )}
          </button>
        ) : (
          <span className="w-4" />
        )}

        {/* Icon */}
        <Icon className={cn(
          'h-3.5 w-3.5 shrink-0',
          isSelected ? 'text-blue-600' : 'text-muted-foreground'
        )} />

        {/* Name (editable) */}
        {isEditing ? (
          <div className="flex-1 flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
            <Input
              ref={inputRef}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleEditKeyDown}
              onBlur={handleSaveEdit}
              placeholder={componentName}
              className="h-5 text-xs py-0 px-1"
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 shrink-0"
              onClick={handleSaveEdit}
            >
              <Check className="h-3 w-3 text-green-600" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 shrink-0"
              onClick={handleCancelEdit}
            >
              <X className="h-3 w-3 text-red-600" />
            </Button>
          </div>
        ) : (
          <>
            <span className={cn(
              'flex-1 text-xs truncate',
              isSelected && 'font-medium',
              customName && 'text-foreground'
            )}>
              {isRoot ? 'Page' : displayName}
            </span>
            {/* Show component type as badge when custom name is set */}
            {customName && !isRoot && (
              <span className="text-[10px] px-1 py-0.5 rounded bg-muted text-muted-foreground shrink-0">
                {componentName}
              </span>
            )}
          </>
        )}

        {/* Quick actions with dropdown */}
        {!isRoot && !isEditing && (
          <div className="hidden group-hover:flex items-center gap-0.5">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={handleStartEdit}>
                  <Pencil className="h-3 w-3 mr-2" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDuplicate()}>
                  <CopyPlus className="h-3 w-3 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleMoveUp} disabled={!canMoveUp}>
                  <ArrowUp className="h-3 w-3 mr-2" />
                  Move Up
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleMoveDown} disabled={!canMoveDown}>
                  <ArrowDown className="h-3 w-3 mr-2" />
                  Move Down
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleMoveToTop} disabled={currentIndex === 0}>
                  <ChevronsUp className="h-3 w-3 mr-2" />
                  Move to Top
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleMoveToBottom} disabled={currentIndex === siblings.length - 1}>
                  <ChevronsDown className="h-3 w-3 mr-2" />
                  Move to Bottom
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => handleDelete()}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-3 w-3 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Children */}
      {hasChildren && isOpen && (
        <div>
          {childNodes.map((childId: string) => (
            <TreeNode 
              key={childId} 
              nodeId={childId} 
              depth={depth + 1}
              dragState={dragState}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onDragOver={onDragOver}
              onDrop={onDrop}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * StructureTree - Hierarchical view with drag-drop reordering
 */
export function StructureTree() {
  const [dragState, setDragState] = useState<DragState>({
    draggedId: null,
    dropTargetId: null,
    dropPosition: null,
  });

  const { nodes, actions, query } = useEditor((state) => ({
    nodes: state.nodes,
  }));

  const handleDragStart = useCallback((nodeId: string) => {
    setDragState({
      draggedId: nodeId,
      dropTargetId: null,
      dropPosition: null,
    });
  }, []);

  const handleDragEnd = useCallback(() => {
    setDragState({
      draggedId: null,
      dropTargetId: null,
      dropPosition: null,
    });
  }, []);

  const handleDragOver = useCallback((nodeId: string, position: 'before' | 'after' | 'inside') => {
    setDragState((prev) => ({
      ...prev,
      dropTargetId: nodeId,
      dropPosition: position,
    }));
  }, []);

  const handleDrop = useCallback(() => {
    const { draggedId, dropTargetId, dropPosition } = dragState;
    
    if (!draggedId || !dropTargetId || !dropPosition) {
      handleDragEnd();
      return;
    }

    try {
      const draggedNode = query.node(draggedId).get();
      const targetNode = query.node(dropTargetId).get();
      
      if (!draggedNode || !targetNode) {
        handleDragEnd();
        return;
      }

      if (dropPosition === 'inside') {
        // Move into the target as last child
        if (targetNode.data.isCanvas) {
          const targetChildren = targetNode.data.nodes || [];
          actions.move(draggedId, dropTargetId, targetChildren.length);
          toast.success('Element moved');
        }
      } else {
        // Move before or after the target
        const targetParentId = targetNode.data.parent;
        if (targetParentId) {
          const parentNode = query.node(targetParentId).get();
          const siblings = parentNode.data.nodes || [];
          const targetIndex = siblings.indexOf(dropTargetId);
          const newIndex = dropPosition === 'before' ? targetIndex : targetIndex + 1;
          actions.move(draggedId, targetParentId, newIndex);
          toast.success('Element moved');
        }
      }
    } catch (error) {
      console.error('Drop error:', error);
      toast.error('Failed to move element');
    }
    
    handleDragEnd();
  }, [dragState, query, actions, handleDragEnd]);

  // Start from ROOT
  if (!nodes.ROOT) {
    return (
      <div className="text-center text-muted-foreground py-4 text-sm">
        No elements on page
      </div>
    );
  }

  return (
    <div className="py-2">
      <TreeNode 
        nodeId="ROOT" 
        depth={0}
        dragState={dragState}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      />
    </div>
  );
}
