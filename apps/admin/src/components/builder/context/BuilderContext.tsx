// PagePress v0.0.6 - 2025-12-03
// Builder context for save functionality and keyboard shortcuts

import { createContext, useContext, useCallback, useEffect, type ReactNode } from 'react';
import { useEditor } from '@craftjs/core';
import { toast } from 'sonner';
import { useBuilderStore } from '@/stores/builder';

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
    hasUnsavedChanges 
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

  // Duplicate selected element
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

      // Clone the node tree
      const nodeTree = query.node(nodeId).toNodeTree();
      
      // Add the cloned tree to the parent
      actions.addNodeTree(nodeTree, parentId, currentIndex + 1);
      
      toast.success('Element duplicated');
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
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    save,
    duplicateSelected,
    deleteSelected,
    deselectAll,
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
