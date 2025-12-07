// PagePress v0.0.12 - 2025-12-05
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

  // Debug/Wireframe mode - shows all container boundaries
  isWireframeMode: boolean;
  setWireframeMode: (enabled: boolean) => void;
  toggleWireframeMode: () => void;

  // Spacing visualizer - shows margin (orange) and padding (green)
  showSpacingVisualizer: boolean;
  setShowSpacingVisualizer: (show: boolean) => void;
  toggleSpacingVisualizer: () => void;

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

  // Hovered element in structure tree
  hoveredNodeId: string | null;
  setHoveredNodeId: (id: string | null) => void;

  // Drag state
  isDragging: boolean;
  setIsDragging: (dragging: boolean) => void;

  // Clipboard for copy/paste
  clipboard: string | null;
  setClipboard: (nodeJson: string | null) => void;

  // Editing state - which element is currently in edit mode (Text/Heading inline editing)
  editingNodeId: string | null;
  setEditingNodeId: (id: string | null) => void;

  // Breakpoint state for responsive editing
  activeBreakpoint: ViewportMode;
  setActiveBreakpoint: (breakpoint: ViewportMode) => void;

  // Reset
  reset: () => void;
}

/**
 * Default state values
 */
const defaultState = {
  viewport: 'desktop' as ViewportMode,
  activeBreakpoint: 'desktop' as ViewportMode,
  isPreviewMode: false,
  isWireframeMode: false,
  showSpacingVisualizer: false,
  leftSidebarOpen: true,
  rightSidebarOpen: true,
  activeLeftPanel: 'components' as SidebarPanel,
  saveStatus: 'idle' as SaveStatus,
  lastSavedAt: null,
  hasUnsavedChanges: false,
  autoSaveEnabled: true,
  autoSaveInterval: 30000, // 30 seconds
  selectedNodeId: null,
  hoveredNodeId: null,
  isDragging: false,
  clipboard: null,
  editingNodeId: null,
};

/**
 * Builder store
 */
export const useBuilderStore = create<BuilderState>((set) => ({
  ...defaultState,

  setViewport: (viewport) => set({ viewport, activeBreakpoint: viewport }),
  setActiveBreakpoint: (activeBreakpoint) => set({ activeBreakpoint }),

  setPreviewMode: (isPreviewMode) => set({ isPreviewMode }),
  togglePreviewMode: () => set((state) => ({ isPreviewMode: !state.isPreviewMode })),

  setWireframeMode: (isWireframeMode) => set({ isWireframeMode }),
  toggleWireframeMode: () => set((state) => ({ isWireframeMode: !state.isWireframeMode })),

  setShowSpacingVisualizer: (showSpacingVisualizer) => set({ showSpacingVisualizer }),
  toggleSpacingVisualizer: () => set((state) => ({ showSpacingVisualizer: !state.showSpacingVisualizer })),

  setLeftSidebarOpen: (leftSidebarOpen) => set({ leftSidebarOpen }),
  setRightSidebarOpen: (rightSidebarOpen) => set({ rightSidebarOpen }),
  setActiveLeftPanel: (activeLeftPanel) => set({ activeLeftPanel }),

  setSaveStatus: (saveStatus) => set({ saveStatus }),
  setLastSavedAt: (lastSavedAt) => set({ lastSavedAt }),
  setHasUnsavedChanges: (hasUnsavedChanges) => set({ hasUnsavedChanges }),

  setAutoSaveEnabled: (autoSaveEnabled) => set({ autoSaveEnabled }),
  setAutoSaveInterval: (autoSaveInterval) => set({ autoSaveInterval }),

  setSelectedNodeId: (selectedNodeId) => set({ selectedNodeId }),
  setHoveredNodeId: (hoveredNodeId) => set({ hoveredNodeId }),

  setIsDragging: (isDragging) => set({ isDragging }),

  setClipboard: (clipboard) => set({ clipboard }),

  setEditingNodeId: (editingNodeId) => set({ editingNodeId }),

  reset: () => set(defaultState),
}));
