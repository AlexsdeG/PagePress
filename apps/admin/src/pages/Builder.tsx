// PagePress v0.0.6 - 2025-12-03
// Visual page builder with Craft.js

import { useEffect } from 'react';
import { useParams, useNavigate, useBlocker } from 'react-router-dom';
import { Editor, useEditor } from '@craftjs/core';
import { TooltipProvider } from '@/components/ui/tooltip';
import { usePageBuilder } from '@/hooks/usePageBuilder';
import { useBuilderStore } from '@/stores/builder';
import { componentResolver } from '@/components/builder/resolver';
import { TopBar, LeftSidebar, RightSidebar, Canvas } from '@/components/builder/layout';
import { BuilderProvider } from '@/components/builder/context';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

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

  const { reset, setHasUnsavedChanges, isPreviewMode, hasUnsavedChanges } = useBuilderStore();

  // Navigation blocker for unsaved changes
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      hasUnsavedChanges && currentLocation.pathname !== nextLocation.pathname
  );

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

  // Warn before browser close with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Handle keyboard shortcuts are now in BuilderProvider

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
        onNodesChange={() => {
          // Mark as having unsaved changes
          setHasUnsavedChanges(true);
        }}
      >
        <BuilderProvider onSave={save} isSaving={isSaving}>
          <BuilderLayout
            pageTitle={page.title}
            initialContent={initialContent}
            isSaving={isSaving}
            queueAutoSave={queueAutoSave}
          />
        </BuilderProvider>
      </Editor>

      {/* Unsaved changes dialog */}
      <AlertDialog open={blocker.state === 'blocked'}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to leave? Your changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => blocker.reset?.()}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => blocker.proceed?.()}>
              Leave Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
}

/**
 * Internal builder layout that has access to Editor context
 */
interface BuilderLayoutProps {
  pageTitle: string;
  initialContent?: string;
  isSaving: boolean;
  queueAutoSave: (content: Record<string, unknown>) => void;
}

function BuilderLayout({ pageTitle, initialContent, isSaving, queueAutoSave }: BuilderLayoutProps) {
  return (
    <div className="h-screen flex flex-col bg-background">
      <AutoSaveHandler queueAutoSave={queueAutoSave} />
      <TopBar
        pageTitle={pageTitle}
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
 * Component to handle auto-save by watching editor changes
 */
function AutoSaveHandler({ queueAutoSave }: { queueAutoSave: (content: Record<string, unknown>) => void }) {
  const { query } = useEditor();
  const { autoSaveEnabled, autoSaveInterval, hasUnsavedChanges } = useBuilderStore();

  useEffect(() => {
    if (!autoSaveEnabled || !hasUnsavedChanges) {
      return;
    }

    const timer = setTimeout(() => {
      const json = query.serialize();
      queueAutoSave(JSON.parse(json));
    }, autoSaveInterval);

    return () => clearTimeout(timer);
  }, [autoSaveEnabled, autoSaveInterval, hasUnsavedChanges, query, queueAutoSave]);

  return null;
}
