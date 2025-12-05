// PagePress v0.0.13 - 2025-12-05
// Breadcrumb bar showing element hierarchy - fixed at bottom

import { useEditor, type Node } from '@craftjs/core';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';

interface BreadcrumbItem {
  id: string;
  name: string;
  displayName: string;
}

/**
 * BreadcrumbBar - Shows the hierarchy of the currently selected element
 * Fixed at the bottom of the canvas
 * Click on any ancestor to select it
 */
export function BreadcrumbBar() {
  const { selected, nodes, actions } = useEditor((state) => {
    const [selectedId] = state.events.selected;
    return {
      selected: selectedId,
      nodes: state.nodes as Record<string, Node>,
    };
  });

  // Build breadcrumb path from ROOT to selected element
  const breadcrumbs = useMemo((): BreadcrumbItem[] => {
    if (!selected) return [];

    const result: BreadcrumbItem[] = [];
    let currentId: string | undefined = selected;

    while (currentId) {
      const currentNode: Node | undefined = nodes[currentId];
      if (!currentNode) break;

      result.unshift({
        id: currentId,
        name: String(currentNode.data.name || 'Unknown'),
        displayName: String(currentNode.data.displayName || currentNode.data.name || 'Element'),
      });

      currentId = currentNode.data.parent as string | undefined;
    }

    return result;
  }, [selected, nodes]);

  const handleSelect = (nodeId: string) => {
    actions.selectNode(nodeId);
  };

  return (
    <div className="h-8 bg-muted/80 backdrop-blur-sm border-t flex items-center px-4 gap-1 overflow-x-auto shrink-0">
      <span className="text-xs text-muted-foreground mr-2 shrink-0">Path:</span>
      {breadcrumbs.length <= 1 ? (
        <span className="text-xs text-muted-foreground italic">Select an element</span>
      ) : (
        breadcrumbs.map((item, index) => (
          <div key={item.id} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="h-3 w-3 text-muted-foreground mx-1 shrink-0" />
            )}
            <button
              onClick={() => handleSelect(item.id)}
              className={cn(
                'text-xs px-2 py-0.5 rounded transition-colors whitespace-nowrap',
                index === breadcrumbs.length - 1
                  ? 'bg-blue-500 text-white font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              {item.displayName}
            </button>
          </div>
        ))
      )}
    </div>
  );
}
