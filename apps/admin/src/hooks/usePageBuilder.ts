// PagePress v0.0.5 - 2025-11-30
// React Query hook for page builder operations

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef } from 'react';
import { api, type Page, type UpdatePageData } from '@/lib/api';
import { useBuilderStore } from '@/stores/builder';

/**
 * Hook for loading and saving page content in the builder
 */
export function usePageBuilder(pageId: string) {
  const queryClient = useQueryClient();
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingContentRef = useRef<Record<string, unknown> | null>(null);
  
  const {
    autoSaveEnabled,
    autoSaveInterval,
    hasUnsavedChanges,
    setSaveStatus,
    setLastSavedAt,
    setHasUnsavedChanges,
  } = useBuilderStore();

  // Query for fetching page data
  const {
    data: pageData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['page', pageId],
    queryFn: async () => {
      const response = await api.pages.get(pageId);
      return response.page;
    },
    enabled: !!pageId,
    staleTime: 0, // Always refetch to get latest
  });

  // Mutation for saving page
  const saveMutation = useMutation({
    mutationFn: async (data: UpdatePageData) => {
      setSaveStatus('saving');
      const response = await api.pages.update(pageId, data);
      return response.page;
    },
    onSuccess: (updatedPage) => {
      setSaveStatus('saved');
      setLastSavedAt(new Date());
      setHasUnsavedChanges(false);
      pendingContentRef.current = null;
      
      // Update cache
      queryClient.setQueryData(['page', pageId], updatedPage);
      
      // Reset status after 2 seconds
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    },
    onError: () => {
      setSaveStatus('error');
    },
  });

  // Save function
  const save = useCallback(
    async (contentJson: Record<string, unknown>) => {
      if (!pageId) return;
      
      return saveMutation.mutateAsync({ contentJson });
    },
    [pageId, saveMutation]
  );

  // Save with additional data
  const saveWithData = useCallback(
    async (data: UpdatePageData) => {
      if (!pageId) return;
      
      return saveMutation.mutateAsync(data);
    },
    [pageId, saveMutation]
  );

  // Queue content for auto-save
  const queueAutoSave = useCallback(
    (contentJson: Record<string, unknown>) => {
      pendingContentRef.current = contentJson;
      setHasUnsavedChanges(true);
    },
    [setHasUnsavedChanges]
  );

  // Auto-save logic
  useEffect(() => {
    if (!autoSaveEnabled || !hasUnsavedChanges) {
      return;
    }

    // Clear existing timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // Set new timer for auto-save
    autoSaveTimerRef.current = setTimeout(() => {
      if (pendingContentRef.current) {
        save(pendingContentRef.current);
      }
    }, autoSaveInterval);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [autoSaveEnabled, autoSaveInterval, hasUnsavedChanges, save]);

  // Mark as having unsaved changes
  const markUnsaved = useCallback(() => {
    setHasUnsavedChanges(true);
  }, [setHasUnsavedChanges]);

  // Force save pending content
  const forceSave = useCallback(async () => {
    if (pendingContentRef.current) {
      await save(pendingContentRef.current);
    }
  }, [save]);

  return {
    page: pageData as Page | undefined,
    isLoading,
    error: error as Error | null,
    save,
    saveWithData,
    queueAutoSave,
    forceSave,
    isSaving: saveMutation.isPending,
    saveError: saveMutation.error as Error | null,
    refetch,
    markUnsaved,
  };
}
