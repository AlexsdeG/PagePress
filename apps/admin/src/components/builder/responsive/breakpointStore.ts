// PagePress v0.0.10 - 2025-12-04
// Breakpoint state management

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BreakpointId } from './types';

/**
 * Preview orientation for mobile breakpoints
 */
export type PreviewOrientation = 'portrait' | 'landscape';

/**
 * Breakpoint store state
 */
interface BreakpointState {
  // Current active breakpoint
  currentBreakpoint: BreakpointId;
  setBreakpoint: (breakpoint: BreakpointId) => void;

  // Preview orientation (portrait/landscape)
  previewOrientation: PreviewOrientation;
  setPreviewOrientation: (orientation: PreviewOrientation) => void;
  toggleOrientation: () => void;

  // Show device frame around canvas
  showDeviceFrame: boolean;
  setShowDeviceFrame: (show: boolean) => void;
  toggleDeviceFrame: () => void;

  // Reset to defaults
  reset: () => void;
}

/**
 * Default state values
 */
const defaultState = {
  currentBreakpoint: 'desktop' as BreakpointId,
  previewOrientation: 'portrait' as PreviewOrientation,
  showDeviceFrame: false,
};

/**
 * Breakpoint store with persistence
 */
export const useBreakpointStore = create<BreakpointState>()(
  persist(
    (set) => ({
      ...defaultState,

      setBreakpoint: (currentBreakpoint) => set({ currentBreakpoint }),

      setPreviewOrientation: (previewOrientation) => set({ previewOrientation }),
      toggleOrientation: () =>
        set((state) => ({
          previewOrientation:
            state.previewOrientation === 'portrait' ? 'landscape' : 'portrait',
        })),

      setShowDeviceFrame: (showDeviceFrame) => set({ showDeviceFrame }),
      toggleDeviceFrame: () =>
        set((state) => ({ showDeviceFrame: !state.showDeviceFrame })),

      reset: () => set(defaultState),
    }),
    {
      name: 'pagepress-breakpoint',
      partialize: (state) => ({
        currentBreakpoint: state.currentBreakpoint,
        previewOrientation: state.previewOrientation,
        showDeviceFrame: state.showDeviceFrame,
      }),
    }
  )
);
