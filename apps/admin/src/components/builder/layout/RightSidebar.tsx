// PagePress v0.0.5 - 2025-11-30
// Right sidebar with settings inspector

import { useEditor } from '@craftjs/core';
import { Button } from '@/components/ui/button';
import { useBuilderStore } from '@/stores/builder';

/**
 * Right sidebar component - Settings inspector
 */
export function RightSidebar() {
  const { rightSidebarOpen, setRightSidebarOpen } = useBuilderStore();

  const { selected, selectedNodeName } = useEditor((state) => {
    const [currentNodeId] = state.events.selected;
    let selectedNodeName = '';

    if (currentNodeId) {
      const node = state.nodes[currentNodeId];
      selectedNodeName = node.data.displayName || node.data.name || 'Unknown';
    }

    return {
      selected: currentNodeId,
      selectedNodeName,
    };
  });

  // Get the settings component for the selected node
  const { Settings } = useEditor((state) => {
    const [currentNodeId] = state.events.selected;
    
    if (currentNodeId) {
      const node = state.nodes[currentNodeId];
      return {
        Settings: node.related?.settings,
      };
    }

    return { Settings: null };
  });

  if (!rightSidebarOpen) {
    return (
      <div className="w-12 border-l bg-background flex flex-col items-center py-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setRightSidebarOpen(true)}
          className="mb-2"
        >
          ◀
        </Button>
      </div>
    );
  }

  return (
    <div className="w-72 border-l bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="font-semibold text-sm">
          {selected ? `${selectedNodeName} Settings` : 'Settings'}
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setRightSidebarOpen(false)}
        >
          ▶
        </Button>
      </div>

      {/* Settings content */}
      <div className="flex-1 overflow-auto p-4">
        {selected && Settings ? (
          <Settings />
        ) : (
          <div className="text-center text-muted-foreground py-8">
            <p className="text-sm">Select an element to edit its properties</p>
          </div>
        )}
      </div>

      {/* Actions */}
      {selected && (
        <div className="p-4 border-t">
          <DeleteButton />
        </div>
      )}
    </div>
  );
}

/**
 * Delete button for selected element
 */
function DeleteButton() {
  const { actions, selected } = useEditor((state) => ({
    selected: state.events.selected,
  }));

  const handleDelete = () => {
    const [nodeId] = selected;
    if (nodeId) {
      actions.delete(nodeId);
    }
  };

  return (
    <Button
      variant="destructive"
      size="sm"
      className="w-full"
      onClick={handleDelete}
    >
      Delete Element
    </Button>
  );
}
