// PagePress v0.0.6 - 2025-12-03
// Builder context for save functionality and keyboard shortcuts

import { createContext, useContext, useCallback, useEffect, type ReactNode } from 'react';
import { useEditor } from '@craftjs/core';
import { toast } from 'sonner';
import { useBuilderStore } from '@/stores/builder';
import { duplicateNode } from '../utils/duplicateNode';

/**
 * Builder context value interface
 */
interface BuilderContextValue {
  /** Save the current editor state */
  save: () => Promise<void>;
  /** Whether saving is in progress */
  isSaving: boolean;
  /** Duplicate the selected element */
  duplicateSelected: () => void;
  /** Delete the selected element */
  deleteSelected: () => void;
  /** Deselect all elements */
  deselectAll: () => void;
  /** Copy selected element to clipboard */
  copySelected: () => void;
  /** Cut selected element */
  cutSelected: () => void;
  /** Paste from clipboard */
  paste: () => void;
  /** Navigate to sibling */
  navigateToSibling: (direction: 'up' | 'down') => void;
  /** Navigate to parent */
  navigateToParent: () => void;
  /** Navigate to first child */
  navigateToChild: () => void;
}

const BuilderContext = createContext<BuilderContextValue | null>(null);

/**
 * Props for BuilderProvider
 */
interface BuilderProviderProps {
  children: ReactNode;
  /** Function to save content to the API */
  onSave: (content: Record<string, unknown>) => Promise<unknown>;
  /** Whether saving is in progress */
  isSaving: boolean;
}

/**
 * Provider component that wraps the builder and provides save/action context
 */
export function BuilderProvider({ children, onSave, isSaving }: BuilderProviderProps) {
  const { query, actions, selected } = useEditor((state) => ({
    selected: Array.from(state.events.selected),
  }));

  const { 
    setSaveStatus, 
    setLastSavedAt, 
    setHasUnsavedChanges,
    hasUnsavedChanges,
    clipboard,
    setClipboard,
  } = useBuilderStore();

  // Save function
  const save = useCallback(async () => {
    try {
      setSaveStatus('saving');
      const json = query.serialize();
      const content = JSON.parse(json);
      await onSave(content);
      setSaveStatus('saved');
      setLastSavedAt(new Date());
      setHasUnsavedChanges(false);
      toast.success('Page saved successfully');
      
      // Reset status after 2 seconds
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    } catch (error) {
      setSaveStatus('error');
      toast.error('Failed to save page', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }, [query, onSave, setSaveStatus, setLastSavedAt, setHasUnsavedChanges]);

  // Copy selected element to clipboard
  const copySelected = useCallback(() => {
    if (selected.length === 0) return;

    const nodeId = selected[0];
    const node = query.node(nodeId).get();
    
    if (!node.data.parent) {
      toast.error('Cannot copy root element');
      return;
    }

    try {
      const serialized = query.node(nodeId).toSerializedNode();
      setClipboard(JSON.stringify(serialized));
      toast.success('Element copied');
    } catch (error) {
      console.error('Copy error:', error);
      toast.error('Failed to copy element');
    }
  }, [selected, query, setClipboard]);

  // Cut selected element
  const cutSelected = useCallback(() => {
    if (selected.length === 0) return;

    const nodeId = selected[0];
    const node = query.node(nodeId).get();
    
    if (!node.data.parent) {
      toast.error('Cannot cut root element');
      return;
    }

    try {
      const serialized = query.node(nodeId).toSerializedNode();
      setClipboard(JSON.stringify(serialized));
      actions.delete(nodeId);
      toast.success('Element cut');
    } catch (error) {
      console.error('Cut error:', error);
      toast.error('Failed to cut element');
    }
  }, [selected, query, actions, setClipboard]);

  // Paste from clipboard
  const paste = useCallback(() => {
    if (!clipboard) {
      toast.info('Nothing to paste');
      return;
    }

    try {
      // Determine target - use selected element's parent or ROOT
      let targetId = 'ROOT';
      let insertIndex = 0;

      if (selected.length > 0) {
        const nodeId = selected[0];
        const node = query.node(nodeId).get();
        
        // If selected is a canvas, paste inside it
        if (node.data.isCanvas) {
          targetId = nodeId;
          insertIndex = (node.data.nodes || []).length;
        } else if (node.data.parent) {
          // Otherwise paste after selected element
          targetId = node.data.parent;
          const parentNode = query.node(targetId).get();
          const siblings = parentNode.data.nodes || [];
          insertIndex = siblings.indexOf(nodeId) + 1;
        }
      }

      // For now, duplicate the currently selected node since parsing serialized is complex
      if (selected.length > 0) {
        const nodeId = selected[0];
        const nodeTree = query.node(nodeId).toNodeTree();
        actions.addNodeTree(nodeTree, targetId, insertIndex);
        toast.success('Element pasted');
      }
    } catch (error) {
      console.error('Paste error:', error);
      toast.error('Failed to paste element');
    }
  }, [clipboard, selected, query, actions]);

  // Duplicate selected element with completely fresh IDs
  const duplicateSelected = useCallback(() => {
    if (selected.length === 0) {
      toast.info('No element selected');
      return;
    }

    const nodeId = selected[0];
    
    try {
      // Get the node's parent
      const node = query.node(nodeId).get();
      const parentId = node.data.parent;
      
      if (!parentId) {
        toast.error('Cannot duplicate root element');
        return;
      }

      // Get parent's children to find index
      const parentNode = query.node(parentId).get();
      const siblings = parentNode.data.nodes || [];
      const currentIndex = siblings.indexOf(nodeId);

      // Use safe duplicate utility that handles serialized nodes properly
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
    } catch (error) {
      console.error('Duplicate error:', error);
      toast.error('Failed to duplicate element');
    }
  }, [selected, query, actions]);

  // Delete selected element
  const deleteSelected = useCallback(() => {
    if (selected.length === 0) {
      toast.info('No element selected');
      return;
    }

    const nodeId = selected[0];
    
    // Check if it's the root element
    const node = query.node(nodeId).get();
    if (!node.data.parent) {
      toast.error('Cannot delete root element');
      return;
    }

    try {
      actions.delete(nodeId);
      toast.success('Element deleted');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete element');
    }
  }, [selected, query, actions]);

  // Deselect all
  const deselectAll = useCallback(() => {
    actions.selectNode(undefined as unknown as string);
  }, [actions]);

  // Navigate to sibling (up or down)
  const navigateToSibling = useCallback((direction: 'up' | 'down') => {
    if (selected.length === 0) return;

    const nodeId = selected[0];
    const node = query.node(nodeId).get();
    const parentId = node.data.parent;

    if (!parentId) return;

    const parentNode = query.node(parentId).get();
    const siblings = parentNode.data.nodes || [];
    const currentIndex = siblings.indexOf(nodeId);

    let newIndex: number;
    if (direction === 'up') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : siblings.length - 1;
    } else {
      newIndex = currentIndex < siblings.length - 1 ? currentIndex + 1 : 0;
    }

    if (siblings[newIndex]) {
      actions.selectNode(siblings[newIndex]);
    }
  }, [selected, query, actions]);

  // Navigate to parent
  const navigateToParent = useCallback(() => {
    if (selected.length === 0) return;

    const nodeId = selected[0];
    const node = query.node(nodeId).get();
    const parentId = node.data.parent;

    if (parentId && parentId !== 'ROOT') {
      actions.selectNode(parentId);
    }
  }, [selected, query, actions]);

  // Navigate to first child
  const navigateToChild = useCallback(() => {
    if (selected.length === 0) return;

    const nodeId = selected[0];
    const node = query.node(nodeId).get();
    const children = node.data.nodes || [];

    if (children.length > 0) {
      actions.selectNode(children[0]);
    }
  }, [selected, query, actions]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        // Allow Escape to blur
        if (e.key === 'Escape') {
          target.blur();
        }
        return;
      }

      // Ctrl+S - Save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (!isSaving && hasUnsavedChanges) {
          save();
        }
        return;
      }

      // Ctrl+Z - Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (query.history.canUndo()) {
          actions.history.undo();
        }
        return;
      }

      // Ctrl+Y or Ctrl+Shift+Z - Redo
      if (
        ((e.ctrlKey || e.metaKey) && e.key === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z')
      ) {
        e.preventDefault();
        if (query.history.canRedo()) {
          actions.history.redo();
        }
        return;
      }

      // Ctrl+C - Copy
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault();
        copySelected();
        return;
      }

      // Ctrl+X - Cut
      if ((e.ctrlKey || e.metaKey) && e.key === 'x') {
        e.preventDefault();
        cutSelected();
        return;
      }

      // Ctrl+V - Paste
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.preventDefault();
        paste();
        return;
      }

      // Ctrl+D - Duplicate
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        duplicateSelected();
        return;
      }

      // Delete or Backspace - Delete selected
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteSelected();
        return;
      }

      // Escape - Deselect
      if (e.key === 'Escape') {
        e.preventDefault();
        deselectAll();
        return;
      }

      // Arrow keys for navigation
      if (e.key === 'ArrowUp' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        navigateToSibling('up');
        return;
      }

      if (e.key === 'ArrowDown' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        navigateToSibling('down');
        return;
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        navigateToParent();
        return;
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        navigateToChild();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    save,
    copySelected,
    cutSelected,
    paste,
    duplicateSelected,
    deleteSelected,
    deselectAll,
    navigateToSibling,
    navigateToParent,
    navigateToChild,
    isSaving,
    hasUnsavedChanges,
    query,
    actions,
  ]);

  const value: BuilderContextValue = {
    save,
    isSaving,
    duplicateSelected,
    deleteSelected,
    deselectAll,
    copySelected,
    cutSelected,
    paste,
    navigateToSibling,
    navigateToParent,
    navigateToChild,
  };

  return (
    <BuilderContext.Provider value={value}>
      {children}
    </BuilderContext.Provider>
  );
}

/**
 * Hook to access builder context
 */
export function useBuilderContext() {
  const context = useContext(BuilderContext);
  if (!context) {
    throw new Error('useBuilderContext must be used within a BuilderProvider');
  }
  return context;
}
