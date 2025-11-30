// PagePress v0.0.5 - 2025-11-30
// Visual page builder with Craft.js

import { useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Editor } from '@craftjs/core';
import { TooltipProvider } from '@/components/ui/tooltip';
import { usePageBuilder } from '@/hooks/usePageBuilder';
import { useBuilderStore } from '@/stores/builder';
import { componentResolver } from '@/components/builder/resolver';
import { TopBar, LeftSidebar, RightSidebar, Canvas } from '@/components/builder/layout';

/**
 * Builder page component
 */
export function BuilderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const {
    page,
    isLoading,
    error,
    save,
    queueAutoSave,
    isSaving,
  } = usePageBuilder(id || '');

  const { reset, setHasUnsavedChanges, isPreviewMode } = useBuilderStore();

  // Reset builder state on mount
  useEffect(() => {
    reset();
    return () => {
      reset();
    };
  }, [reset]);

  // Redirect if no page ID
  useEffect(() => {
    if (!id) {
      navigate('/pages');
    }
  }, [id, navigate]);

  // Handle save
  const handleSave = useCallback(async () => {
    // Get serialized content from Craft.js
    // This will be called from the Editor component
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);

  // Loading state
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading page...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">Failed to load page</p>
          <p className="text-muted-foreground mb-4">{error.message}</p>
          <button
            onClick={() => navigate('/pages')}
            className="text-primary hover:underline"
          >
            Back to Pages
          </button>
        </div>
      </div>
    );
  }

  // No page found
  if (!page) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Page not found</p>
          <button
            onClick={() => navigate('/pages')}
            className="text-primary hover:underline"
          >
            Back to Pages
          </button>
        </div>
      </div>
    );
  }

  // Get initial content from page - only use if it has valid Craft.js state (has ROOT key)
  const hasValidContent = page.contentJson && 
    typeof page.contentJson === 'object' && 
    'ROOT' in page.contentJson;
  const initialContent = hasValidContent
    ? JSON.stringify(page.contentJson)
    : undefined;

  return (
    <TooltipProvider>
      <Editor
        resolver={componentResolver}
        enabled={!isPreviewMode}
        onNodesChange={(query) => {
          // Mark as having unsaved changes
          setHasUnsavedChanges(true);
          
          // Queue auto-save with serialized content
          const json = query.serialize();
          queueAutoSave(JSON.parse(json));
        }}
      >
        <BuilderLayout
          pageTitle={page.title}
          initialContent={initialContent}
          onSave={async () => {
            // This will be handled by the internal EditorSaveHandler
          }}
          isSaving={isSaving}
        />
      </Editor>
    </TooltipProvider>
  );
}

/**
 * Internal builder layout that has access to Editor context
 */
interface BuilderLayoutProps {
  pageTitle: string;
  initialContent?: string;
  onSave: () => void;
  isSaving: boolean;
}

function BuilderLayout({ pageTitle, initialContent, isSaving }: BuilderLayoutProps) {
  const { id } = useParams<{ id: string }>();
  const { save } = usePageBuilder(id || '');

  // Handle save with editor query
  const handleSave = useCallback(async () => {
    // We need to get the serialized content from within the Editor context
    // This is handled by EditorSaveHandler
  }, []);

  return (
    <div className="h-screen flex flex-col bg-background">
      <EditorSaveHandler save={save} />
      <TopBar
        pageTitle={pageTitle}
        onSave={handleSave}
        isSaving={isSaving}
      />
      <div className="flex-1 flex overflow-hidden">
        <LeftSidebar />
        <Canvas initialContent={initialContent} />
        <RightSidebar />
      </div>
    </div>
  );
}

/**
 * Component to handle save with editor context
 */
function EditorSaveHandler({ save }: { save: (content: Record<string, unknown>) => Promise<unknown> }) {
  const { query } = useEditor();
  
  // Expose save function that uses editor query
  useEffect(() => {
    // Make the save function available globally for the TopBar
    (window as Record<string, unknown>).__builderSave = async () => {
      const json = query.serialize();
      await save(JSON.parse(json));
    };

    return () => {
      delete (window as Record<string, unknown>).__builderSave;
    };
  }, [query, save]);

  return null;
}

// Import useEditor hook for EditorSaveHandler
import { useEditor } from '@craftjs/core';
