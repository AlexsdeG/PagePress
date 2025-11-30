// PagePress v0.0.5 - 2025-11-30
// Zustand store for builder state management

import { create } from 'zustand';

/**
 * Viewport mode for responsive preview
 */
export type ViewportMode = 'desktop' | 'tablet' | 'mobile';

/**
 * Save status for auto-save indicator
 */
export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

/**
 * Builder sidebar panel
 */
export type SidebarPanel = 'components' | 'layers' | 'settings';

/**
 * Viewport dimensions
 */
export const VIEWPORT_DIMENSIONS: Record<ViewportMode, { width: number; label: string }> = {
  desktop: { width: 1280, label: 'Desktop' },
  tablet: { width: 768, label: 'Tablet' },
  mobile: { width: 375, label: 'Mobile' },
};

/**
 * Builder store state
 */
interface BuilderState {
  // Viewport
  viewport: ViewportMode;
  setViewport: (viewport: ViewportMode) => void;
  
  // Preview mode
  isPreviewMode: boolean;
  setPreviewMode: (isPreview: boolean) => void;
  togglePreviewMode: () => void;
  
  // Sidebar
  leftSidebarOpen: boolean;
  rightSidebarOpen: boolean;
  activeLeftPanel: SidebarPanel;
  setLeftSidebarOpen: (open: boolean) => void;
  setRightSidebarOpen: (open: boolean) => void;
  setActiveLeftPanel: (panel: SidebarPanel) => void;
  
  // Save state
  saveStatus: SaveStatus;
  lastSavedAt: Date | null;
  hasUnsavedChanges: boolean;
  setSaveStatus: (status: SaveStatus) => void;
  setLastSavedAt: (date: Date | null) => void;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
  
  // Auto-save
  autoSaveEnabled: boolean;
  autoSaveInterval: number; // in milliseconds
  setAutoSaveEnabled: (enabled: boolean) => void;
  setAutoSaveInterval: (interval: number) => void;
  
  // Selected element (for highlighting in layers)
  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;
  
  // Reset
  reset: () => void;
}

/**
 * Default state values
 */
const defaultState = {
  viewport: 'desktop' as ViewportMode,
  isPreviewMode: false,
  leftSidebarOpen: true,
  rightSidebarOpen: true,
  activeLeftPanel: 'components' as SidebarPanel,
  saveStatus: 'idle' as SaveStatus,
  lastSavedAt: null,
  hasUnsavedChanges: false,
  autoSaveEnabled: true,
  autoSaveInterval: 30000, // 30 seconds
  selectedNodeId: null,
};

/**
 * Builder store
 */
export const useBuilderStore = create<BuilderState>((set) => ({
  ...defaultState,
  
  setViewport: (viewport) => set({ viewport }),
  
  setPreviewMode: (isPreviewMode) => set({ isPreviewMode }),
  togglePreviewMode: () => set((state) => ({ isPreviewMode: !state.isPreviewMode })),
  
  setLeftSidebarOpen: (leftSidebarOpen) => set({ leftSidebarOpen }),
  setRightSidebarOpen: (rightSidebarOpen) => set({ rightSidebarOpen }),
  setActiveLeftPanel: (activeLeftPanel) => set({ activeLeftPanel }),
  
  setSaveStatus: (saveStatus) => set({ saveStatus }),
  setLastSavedAt: (lastSavedAt) => set({ lastSavedAt }),
  setHasUnsavedChanges: (hasUnsavedChanges) => set({ hasUnsavedChanges }),
  
  setAutoSaveEnabled: (autoSaveEnabled) => set({ autoSaveEnabled }),
  setAutoSaveInterval: (autoSaveInterval) => set({ autoSaveInterval }),
  
  setSelectedNodeId: (selectedNodeId) => set({ selectedNodeId }),
  
  reset: () => set(defaultState),
}));
