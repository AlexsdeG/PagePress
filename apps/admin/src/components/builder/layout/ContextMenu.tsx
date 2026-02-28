// PagePress v0.0.15 - 2026-02-28
// Right-click context menu for builder elements

import { useCallback, useState } from 'react';
import { useEditor } from '@craftjs/core';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useBuilderStore } from '@/stores/builder';
import { toast } from 'sonner';
import { duplicateNode } from '../utils/duplicateNode';
import { api, type SectionTemplateCategory } from '@/lib/api';

interface BuilderContextMenuProps {
  children: React.ReactNode;
}

/**
 * BuilderContextMenu - Provides right-click context menu for canvas elements
 */
export function BuilderContextMenu({ children }: BuilderContextMenuProps) {
  const { setClipboard, clipboard, isPreviewMode, editingNodeId } = useBuilderStore();
  const [saveAsTemplateOpen, setSaveAsTemplateOpen] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateCategory, setTemplateCategory] = useState<SectionTemplateCategory>('other');
  const [templateDescription, setTemplateDescription] = useState('');
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [nodeToSave, setNodeToSave] = useState<string | null>(null);

  const {
    selected,
    parentId,
    siblings,
    actions,
    query,
    isGlobal,
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
      isGlobal: !!(node?.data.custom?.globalElementId),
    };
  });

  const currentIndex = siblings.indexOf(selected || '');
  const canMoveUp = currentIndex > 0;
  const canMoveDown = currentIndex < siblings.length - 1;
  const isRoot = selected === 'ROOT';
  const hasClipboard = !!clipboard;

  // Action handlers
  const handleCopy = useCallback(() => {
    if (!selected || isRoot) return;
    const nodeTree = query.node(selected).toSerializedNode();
    setClipboard(JSON.stringify(nodeTree));
    toast.success('Element copied');
  }, [selected, query, setClipboard, isRoot]);

  const handleCut = useCallback(() => {
    if (!selected || isRoot) return;
    const nodeTree = query.node(selected).toSerializedNode();
    setClipboard(JSON.stringify(nodeTree));
    actions.delete(selected);
    toast.success('Element cut');
  }, [selected, query, setClipboard, actions, isRoot]);

  const handlePaste = useCallback(() => {
    if (!clipboard || !selected) return;

    try {
      // Check if selected node is a canvas (can accept children)
      const node = query.node(selected).get();
      const targetId = node.data.isCanvas ? selected : (parentId || 'ROOT');

      // For now, just duplicate since parsing serialized node is complex
      // This will be enhanced later
      const nodeTree = query.node(selected).toNodeTree();
      const parent = query.node(targetId).get();

      if (parent && parent.data.nodes) {
        const insertIndex = parent.data.nodes.indexOf(selected) + 1;
        actions.addNodeTree(nodeTree, targetId, insertIndex);
        toast.success('Element pasted');
      }
    } catch (error) {
      console.error('Paste failed:', error);
      toast.error('Failed to paste element');
    }
  }, [clipboard, selected, parentId, query, actions]);

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
    toast.success('Element deleted');
  }, [selected, actions, isRoot]);

  const handleMoveUp = useCallback(() => {
    if (!selected || !canMoveUp || !parentId) return;
    actions.move(selected, parentId, currentIndex - 1);
  }, [selected, canMoveUp, parentId, currentIndex, actions]);

  const handleMoveDown = useCallback(() => {
    if (!selected || !canMoveDown || !parentId) return;
    actions.move(selected, parentId, currentIndex + 2);
  }, [selected, canMoveDown, parentId, currentIndex, actions]);

  const handleMoveToTop = useCallback(() => {
    if (!selected || !parentId || currentIndex === 0) return;
    actions.move(selected, parentId, 0);
  }, [selected, parentId, currentIndex, actions]);

  const handleMoveToBottom = useCallback(() => {
    if (!selected || !parentId || currentIndex === siblings.length - 1) return;
    actions.move(selected, parentId, siblings.length);
  }, [selected, parentId, currentIndex, siblings.length, actions]);

  const handleSelectParent = useCallback(() => {
    if (parentId && parentId !== 'ROOT') {
      actions.selectNode(parentId);
    }
  }, [parentId, actions]);

  const handleSaveAsTemplate = useCallback(() => {
    if (!selected || isRoot) return;
    setNodeToSave(selected);
    const node = query.node(selected).get();
    setTemplateName(node.data.custom?.displayName || node.data.displayName || node.data.name || 'My Template');
    setTemplateCategory('other');
    setTemplateDescription('');
    setSaveAsTemplateOpen(true);
  }, [selected, isRoot, query]);

  const handleConfirmSaveAsTemplate = useCallback(async () => {
    if (!nodeToSave || !templateName.trim()) return;
    try {
      setSavingTemplate(true);
      const serialized = query.node(nodeToSave).toSerializedNode();
      await api.sectionTemplates.create({
        name: templateName.trim(),
        description: templateDescription.trim() || null,
        category: templateCategory,
        contentJson: serialized as unknown as Record<string, unknown>,
      });
      toast.success('Saved as section template');
      setSaveAsTemplateOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save template');
    } finally {
      setSavingTemplate(false);
    }
  }, [nodeToSave, templateName, templateDescription, templateCategory, query]);

  const handleMarkAsGlobal = useCallback(async () => {
    if (!selected || isRoot) return;
    try {
      const node = query.node(selected).get();
      const serialized = query.node(selected).toSerializedNode();
      const name = node.data.custom?.displayName || node.data.displayName || node.data.name || 'Global Element';
      const result = await api.globalElements.create({
        name,
        contentJson: serialized as unknown as Record<string, unknown>,
      });
      // Mark the node with globalElementId in custom data
      actions.setCustom(selected, (custom: Record<string, unknown>) => {
        custom.globalElementId = result.id;
        custom.globalElementName = name;
      });
      toast.success(`Marked "${name}" as global element`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to mark as global');
    }
  }, [selected, isRoot, query, actions]);

  const handleUnlinkGlobal = useCallback(() => {
    if (!selected || isRoot) return;
    actions.setCustom(selected, (custom: Record<string, unknown>) => {
      delete custom.globalElementId;
      delete custom.globalElementName;
    });
    toast.success('Element unlinked from global');
  }, [selected, isRoot, actions]);

  // In preview mode, just render children
  if (isPreviewMode) {
    return <>{children}</>;
  }

  // If editing text, we might want to allow browser default behavior for text interaction
  // But we still wrap it to maintain structure
  if (editingNodeId) {
    // Check if the click target is inside the editing node
    // This logic is handled by the trigger's onContextMenu
  }

  return (
    <>
    <ContextMenu>
      <ContextMenuTrigger asChild className="context-menu-trigger">
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        {selected && !isRoot ? (
          <>
            {/* Edit Actions */}
            <ContextMenuItem onClick={handleCopy}>
              Copy
              <ContextMenuShortcut>Ctrl+C</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem onClick={handleCut}>
              Cut
              <ContextMenuShortcut>Ctrl+X</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem onClick={handlePaste} disabled={!hasClipboard}>
              Paste
              <ContextMenuShortcut>Ctrl+V</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem onClick={handleDuplicate}>
              Duplicate
              <ContextMenuShortcut>Ctrl+D</ContextMenuShortcut>
            </ContextMenuItem>

            <ContextMenuSeparator />

            {/* Move Actions */}
            <ContextMenuSub>
              <ContextMenuSubTrigger>Move</ContextMenuSubTrigger>
              <ContextMenuSubContent>
                <ContextMenuItem onClick={handleMoveUp} disabled={!canMoveUp}>
                  Move Up
                  <ContextMenuShortcut>↑</ContextMenuShortcut>
                </ContextMenuItem>
                <ContextMenuItem onClick={handleMoveDown} disabled={!canMoveDown}>
                  Move Down
                  <ContextMenuShortcut>↓</ContextMenuShortcut>
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem onClick={handleMoveToTop} disabled={currentIndex === 0}>
                  Move to Top
                </ContextMenuItem>
                <ContextMenuItem onClick={handleMoveToBottom} disabled={currentIndex === siblings.length - 1}>
                  Move to Bottom
                </ContextMenuItem>
              </ContextMenuSubContent>
            </ContextMenuSub>

            {/* Selection */}
            {parentId && parentId !== 'ROOT' && (
              <ContextMenuItem onClick={handleSelectParent}>
                Select Parent
              </ContextMenuItem>
            )}

            <ContextMenuSeparator />

            {/* Save as Template */}
            <ContextMenuItem onClick={handleSaveAsTemplate}>
              Save as Template
            </ContextMenuItem>

            {/* Global Element */}
            {isGlobal ? (
              <ContextMenuItem onClick={handleUnlinkGlobal}>
                Unlink Global Element
              </ContextMenuItem>
            ) : (
              <ContextMenuItem onClick={handleMarkAsGlobal}>
                Mark as Global
              </ContextMenuItem>
            )}

            <ContextMenuSeparator />

            {/* Delete */}
            <ContextMenuItem
              onClick={handleDelete}
              className="text-destructive focus:text-destructive"
            >
              Delete
              <ContextMenuShortcut>Del</ContextMenuShortcut>
            </ContextMenuItem>
          </>
        ) : (
          <>
            <ContextMenuItem onClick={handlePaste} disabled={!hasClipboard}>
              Paste
              <ContextMenuShortcut>Ctrl+V</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem disabled>
              <span className="text-muted-foreground">No element selected</span>
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>

      {/* Save as Template Dialog */}
      <Dialog open={saveAsTemplateOpen} onOpenChange={setSaveAsTemplateOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Save as Template</DialogTitle>
            <DialogDescription>Save this element as a reusable section template.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="template-name">Name</Label>
              <Input
                id="template-name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Template name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template-category">Category</Label>
              <select
                id="template-category"
                className="w-full h-9 border rounded-md px-3 text-sm bg-background"
                value={templateCategory}
                onChange={(e) => setTemplateCategory(e.target.value as SectionTemplateCategory)}
              >
                <option value="hero">Hero</option>
                <option value="features">Features</option>
                <option value="cta">Call to Action</option>
                <option value="contact">Contact</option>
                <option value="testimonials">Testimonials</option>
                <option value="pricing">Pricing</option>
                <option value="faq">FAQ</option>
                <option value="footer">Footer</option>
                <option value="header">Header</option>
                <option value="content">Content</option>
                <option value="gallery">Gallery</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="template-desc">Description (optional)</Label>
              <Input
                id="template-desc"
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                placeholder="Brief description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveAsTemplateOpen(false)}>Cancel</Button>
            <Button onClick={handleConfirmSaveAsTemplate} disabled={savingTemplate || !templateName.trim()}>
              {savingTemplate ? 'Saving...' : 'Save Template'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
