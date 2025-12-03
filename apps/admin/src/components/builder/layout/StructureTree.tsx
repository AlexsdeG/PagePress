// PagePress v0.0.6 - 2025-12-03
// Structure tree panel showing element hierarchy with icons

import { useState } from 'react';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBuilderStore } from '@/stores/builder';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { duplicateNode } from '../utils/duplicateNode';

// Component type to icon mapping
const componentIcons: Record<string, React.ElementType> = {
  Container: Box,
  Text: Type,
  Heading: Heading1,
  Image: Image,
  Button: MousePointer2,
  'Code Block': Code2,
  'HTML Block': Code2,
  HTMLBlock: Code2,
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

  if (!node) return null;

  const displayName = node.data.displayName || node.data.name || 'Element';
  const Icon = componentIcons[displayName] || Box;
  const hasChildren = childNodes.length > 0;
  const isRoot = nodeId === 'ROOT';
  const isHovered = hoveredNodeId === nodeId;

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    actions.selectNode(nodeId);
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

        {/* Name */}
        <span className={cn(
          'flex-1 text-xs truncate',
          isSelected && 'font-medium'
        )}>
          {isRoot ? 'Page' : displayName}
        </span>

        {/* Quick actions (visible on hover) */}
        {!isRoot && (
          <div className="hidden group-hover:flex items-center gap-0.5">
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
