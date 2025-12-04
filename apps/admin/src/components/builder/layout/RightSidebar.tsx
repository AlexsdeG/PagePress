// PagePress v0.0.8 - 2025-12-04
// Right sidebar with settings inspector and structure panel

import { useEditor } from '@craftjs/core';
import { 
  Settings, 
  Layers, 
  Trash2,
  PanelRightClose,
  PanelRight,
  CopyPlus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useBuilderStore } from '@/stores/builder';
import { StructureTree } from './StructureTree';
import { toast } from 'sonner';
import { duplicateNode } from '../utils/duplicateNode';

/**
 * Right sidebar component - Settings inspector and structure
 */
export function RightSidebar() {
  const { rightSidebarOpen, setRightSidebarOpen } = useBuilderStore();

  const { selected, parentId, actions } = useEditor((state) => {
    const [currentNodeId] = state.events.selected;
    let parentId: string | undefined;

    if (currentNodeId) {
      const node = state.nodes[currentNodeId];
      parentId = node.data.parent || undefined;
    }

    return {
      selected: currentNodeId,
      parentId,
    };
  });

  // Get query for duplicate action
  const { query } = useEditor();

  // Get the settings component for the selected node
  const { SettingsComponent } = useEditor((state) => {
    const [currentNodeId] = state.events.selected;
    
    if (currentNodeId) {
      const node = state.nodes[currentNodeId];
      return {
        SettingsComponent: node.related?.settings,
      };
    }

    return { SettingsComponent: null };
  });

  const isRoot = selected === 'ROOT';

  const handleDuplicate = () => {
    if (!selected || isRoot || !parentId) return;
    
    try {
      const parentNode = query.node(parentId).get();
      if (parentNode && parentNode.data.nodes) {
        const currentIndex = parentNode.data.nodes.indexOf(selected);
        
        // Use the safe duplicate function
        const newNodeId = duplicateNode(query, actions, selected, parentId, currentIndex + 1);
        
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

  const handleDelete = () => {
    if (!selected || isRoot) return;
    actions.delete(selected);
  };

  if (!rightSidebarOpen) {
    return (
      <div className="w-12 border-l bg-background flex flex-col items-center py-4 gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setRightSidebarOpen(true)}
            >
              <PanelRight className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">Open Sidebar</TooltipContent>
        </Tooltip>
      </div>
    );
  }

  return (
    <div className="w-92 border-l bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <h2 className="font-semibold text-sm">Inspector</h2>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => setRightSidebarOpen(false)}
        >
          <PanelRightClose className="h-4 w-4" />
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="settings" className="flex-1 flex flex-col min-h-0">
        <TabsList className="mx-3 mt-2 grid grid-cols-2">
          <TabsTrigger value="settings" className="text-xs gap-1.5">
            <Settings className="h-3.5 w-3.5" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="structure" className="text-xs gap-1.5">
            <Layers className="h-3.5 w-3.5" />
            Structure
          </TabsTrigger>
        </TabsList>

        {/* Settings Tab */}
        <TabsContent value="settings" className="flex-1 flex flex-col m-0 overflow-hidden">
          {selected && SettingsComponent ? (
            <div className="flex-1 overflow-hidden">
              {/* Settings component - takes full control of layout */}
              <SettingsComponent />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-muted-foreground py-8">
                <Settings className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Select an element to edit its properties</p>
              </div>
            </div>
          )}

          {/* Actions footer */}
          {selected && !isRoot && (
            <div className="p-3 border-t flex gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={handleDuplicate}
              >
                <CopyPlus className="h-3.5 w-3.5 mr-1.5" />
                Duplicate
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="flex-1"
                onClick={handleDelete}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                Delete
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Structure Tab */}
        <TabsContent value="structure" className="flex-1 m-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-3">
              <StructureTree />
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
