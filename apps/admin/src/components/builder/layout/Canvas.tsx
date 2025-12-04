// PagePress v0.0.6 - 2025-12-03
// Canvas component for the page builder

import { Frame, Element } from '@craftjs/core';
import { useBuilderStore, VIEWPORT_DIMENSIONS } from '@/stores/builder';
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
 */
export function Canvas({ initialContent }: CanvasProps) {
  const { viewport, isPreviewMode, isWireframeMode, showSpacingVisualizer } = useBuilderStore();
  const { width } = VIEWPORT_DIMENSIONS[viewport];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Breadcrumb bar - shows element hierarchy */}
      <BreadcrumbBar />
      
      {/* Main canvas area */}
      <div className="flex-1 bg-muted/50 overflow-auto p-8 relative">
        <BuilderContextMenu>
          <div
            data-builder-canvas
            className={cn(
              'mx-auto bg-background shadow-lg transition-all duration-300 relative',
              isWireframeMode && 'builder-wireframe-mode',
              showSpacingVisualizer && 'builder-spacing-mode'
            )}
            style={{
              width: `${width}px`,
              maxWidth: '100%',
              minHeight: 'calc(100vh - 200px)',
              // Allow pointer events in preview mode for hover effects to work
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
        </BuilderContextMenu>
      </div>

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
