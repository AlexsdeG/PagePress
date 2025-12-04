// PagePress v0.0.8 - 2025-12-04
// Structure tree panel showing element hierarchy with icons

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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Row: Rows,
  Column: Columns,
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

interface TreeNodeProps {
  nodeId: string;
  depth: number;
}

/**
 * Single node in the structure tree
 */
function TreeNode({ nodeId, depth }: TreeNodeProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
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

  if (!node) return null;

  // Get custom name from element metadata or fall back to display name
  const metadata = node.data.props?.elementMetadata as ElementMetadata | undefined;
  const customName = metadata?.customName;
  const componentName = node.data.displayName || node.data.name || 'Element';
  const displayName = customName || componentName;
  const Icon = componentIcons[componentName] || Box;
  const hasChildren = childNodes.length > 0;
  const isRoot = nodeId === 'ROOT';
  const isHovered = hoveredNodeId === nodeId;

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

  // Save the edited name
  const handleSaveEdit = useCallback(() => {
    actions.setProp(nodeId, (props: Record<string, unknown>) => {
      const currentMetadata = (props.elementMetadata || {}) as ElementMetadata;
      props.elementMetadata = {
        ...currentMetadata,
        customName: editValue.trim() || undefined,
      };
    });
    setIsEditing(false);
    toast.success('Element renamed');
  }, [actions, nodeId, editValue]);

  // Cancel editing
  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditValue('');
  }, []);

  // Handle keyboard events in edit mode
  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isRoot) return;
    
    const parentId = node.data.parent;
    if (!parentId) return;
    
    try {
      const parentNode = query.node(parentId).get();
      if (parentNode && parentNode.data.nodes) {
        const currentIndex = parentNode.data.nodes.indexOf(nodeId);
        
        // Use the safe duplicate function
        const newNodeId = duplicateNode(query, actions, nodeId, parentId, currentIndex + 1);
        
        if (newNodeId) {
          // Select the newly created element
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

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isRoot) return;
    actions.delete(nodeId);
  };

  const handleMouseEnter = () => {
    setHoveredNodeId(nodeId);
  };

  const handleMouseLeave = () => {
    setHoveredNodeId(null);
  };

  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-1 py-1 px-1 rounded-md cursor-pointer transition-colors group',
          isSelected && 'bg-blue-500/20 text-blue-600',
          isHovered && !isSelected && 'bg-muted',
          !isSelected && !isHovered && 'hover:bg-muted/50'
        )}
        style={{ paddingLeft: `${depth * 12 + 4}px` }}
        onClick={handleSelect}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
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

        {/* Quick actions (visible on hover) */}
        {!isRoot && !isEditing && (
          <div className="hidden group-hover:flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5"
              onClick={handleStartEdit}
              title="Rename"
            >
              <Pencil className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5"
              onClick={handleDuplicate}
            >
              <CopyPlus className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 text-destructive hover:text-destructive"
              onClick={handleDelete}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>

      {/* Children */}
      {hasChildren && isOpen && (
        <div>
          {childNodes.map((childId: string) => (
            <TreeNode key={childId} nodeId={childId} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * StructureTree - Hierarchical view of all elements on the page
 */
export function StructureTree() {
  const { nodes } = useEditor((state) => ({
    nodes: state.nodes,
  }));

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
      <TreeNode nodeId="ROOT" depth={0} />
    </div>
  );
}
