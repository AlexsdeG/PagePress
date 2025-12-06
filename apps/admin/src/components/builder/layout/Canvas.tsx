// PagePress v0.0.13 - 2025-12-05
// Canvas component for the page builder - breadcrumb moved to bottom

import { useCallback } from 'react';
import { Frame, Element } from '@craftjs/core';
import { useBuilderStore } from '@/stores/builder';
import { useBreakpointStore } from '../responsive/breakpointStore';
import { DeviceFrame, getCanvasWidth, getCanvasHeight } from '../responsive/DeviceFrame';
import { Container } from '../components/Container';
import { BreadcrumbBar } from './BreadcrumbBar';
import { FloatingToolbar } from './FloatingToolbar';
import { BuilderContextMenu } from './ContextMenu';
import { cn } from '@/lib/utils';

interface CanvasProps {
  initialContent?: string;
}

/**
 * Canvas component - The editable area where components are rendered
 * Breadcrumb bar is fixed at the bottom
 */
export function Canvas({ initialContent }: CanvasProps) {
  const { isWireframeMode, showSpacingVisualizer, isPreviewMode, editingNodeId } = useBuilderStore();
  const {
    currentBreakpoint,
    previewOrientation,
    showDeviceFrame
  } = useBreakpointStore();

  // Get dimensions based on breakpoint AND orientation
  const canvasWidth = getCanvasWidth(currentBreakpoint, previewOrientation);
  const canvasHeight = getCanvasHeight(currentBreakpoint, previewOrientation);

  // Prevent default browser context menu on canvas when not in preview mode or editing
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    if (!isPreviewMode) {
      // If we are editing text, we might want the browser menu (for spellcheck etc), 
      // but for general canvas we want our custom menu
      // The BuilderContextMenu component will handle the actual menu display
      e.preventDefault();
    }
  }, [isPreviewMode]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Main canvas area */}
      <div
        className="flex-1 bg-muted/50 overflow-auto p-8 relative"
        onContextMenu={handleContextMenu}
      >
        <BuilderContextMenu>
          <DeviceFrame>
            <div
              data-builder-canvas
              className={cn(
                'mx-auto bg-background shadow-lg transition-all duration-300 relative',
                isWireframeMode && 'builder-wireframe-mode',
                showSpacingVisualizer && 'builder-spacing-mode',
                // Remove shadow when device frame is shown
                showDeviceFrame && currentBreakpoint !== 'desktop' && 'shadow-none'
              )}
              style={{
                width: `${canvasWidth}px`,
                maxWidth: '100%',
                minHeight: currentBreakpoint === 'desktop'
                  ? 'calc(100vh - 200px)'
                  : undefined,
                // Set height for mobile/tablet based on orientation
                height: currentBreakpoint !== 'desktop' && showDeviceFrame
                  ? `${canvasHeight}px`
                  : undefined,
                overflow: currentBreakpoint !== 'desktop' ? 'auto' : undefined,
              }}
            >
              {/* Floating toolbar */}
              <FloatingToolbar />

              <Frame {...(initialContent ? { data: initialContent } : {})}>
                <Element
                  is={Container}
                  canvas
                  display="flex"
                  flexDirection="column"
                  padding={24}
                  minHeight={400}
                  backgroundColor="#ffffff"
                />
              </Frame>
            </div>
          </DeviceFrame>
        </BuilderContextMenu>
      </div>

      {/* Breadcrumb bar - fixed at bottom, shows element hierarchy path */}
      <BreadcrumbBar />

      {/* Wireframe and spacing mode styles */}
      <style>{`
        .builder-wireframe-mode * {
          outline: 1px dashed rgba(156, 163, 175, 0.5) !important;
          outline-offset: -1px !important;
        }
        
        .builder-wireframe-mode [data-builder-canvas] {
          outline: none !important;
        }
        
        .builder-spacing-mode [style*="padding"],
        .builder-spacing-mode [class*="p-"] {
          position: relative;
        }
        
        .builder-spacing-mode [style*="padding"]::before,
        .builder-spacing-mode [class*="p-"]::before {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          /* Padding indicator - green */
          box-shadow: inset 0 0 0 2px rgba(34, 197, 94, 0.3);
        }
        
        .builder-spacing-mode [style*="margin"]::after,
        .builder-spacing-mode [class*="m-"]::after {
          content: '';
          position: absolute;
          inset: -4px;
          pointer-events: none;
          /* Margin indicator - orange */
          border: 2px dashed rgba(249, 115, 22, 0.4);
          border-radius: 2px;
        }
      `}</style>
    </div>
  );
}
