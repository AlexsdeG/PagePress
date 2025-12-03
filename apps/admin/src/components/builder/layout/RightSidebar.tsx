// PagePress v0.0.6 - 2025-12-03
// Right sidebar with settings inspector and structure panel

import { useEditor } from '@craftjs/core';
import { 
  Settings, 
  Layers, 
  Trash2,
  PanelRightClose,
  PanelRight,
  CopyPlus,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
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

  const { selected, selectedNodeName, parentId, siblings, actions } = useEditor((state) => {
    const [currentNodeId] = state.events.selected;
    let selectedNodeName = '';
    let parentId: string | undefined;
    let siblings: string[] = [];

    if (currentNodeId) {
      const node = state.nodes[currentNodeId];
      selectedNodeName = node.data.displayName || node.data.name || 'Unknown';
      parentId = node.data.parent;
      
      if (parentId) {
        const parent = state.nodes[parentId];
        siblings = parent?.data?.nodes || [];
      }
    }

    return {
      selected: currentNodeId,
      selectedNodeName,
      parentId,
      siblings,
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

  const currentIndex = siblings.indexOf(selected || '');
  const canMoveUp = currentIndex > 0;
  const canMoveDown = currentIndex < siblings.length - 1;
  const isRoot = selected === 'ROOT';

  const handleMoveUp = () => {
    if (!selected || !canMoveUp || !parentId) return;
    actions.move(selected, parentId, currentIndex - 1);
  };

  const handleMoveDown = () => {
    if (!selected || !canMoveDown || !parentId) return;
    actions.move(selected, parentId, currentIndex + 2);
  };

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
    <div className="w-72 border-l bg-background flex flex-col">
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
          <ScrollArea className="flex-1">
            <div className="p-4">
              {selected && SettingsComponent ? (
                <>
                  {/* Element info header */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium">{selectedNodeName}</h3>
                      {!isRoot && (
                        <div className="flex items-center gap-0.5">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={handleMoveUp}
                                disabled={!canMoveUp}
                              >
                                <ChevronUp className="h-3.5 w-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Move Up</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={handleMoveDown}
                                disabled={!canMoveDown}
                              >
                                <ChevronDown className="h-3.5 w-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Move Down</TooltipContent>
                          </Tooltip>
                        </div>
                      )}
                    </div>
                    <Separator className="mt-3" />
                  </div>

                  {/* Settings component */}
                  <SettingsComponent />
                </>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Settings className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Select an element to edit its properties</p>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Actions footer */}
          {selected && !isRoot && (
            <div className="p-3 border-t flex gap-2">
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
