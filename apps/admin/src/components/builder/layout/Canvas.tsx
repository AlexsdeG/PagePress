// PagePress v0.0.5 - 2025-11-30
// Canvas component for the page builder

import { useEditor, Frame, Element } from '@craftjs/core';
import { useBuilderStore, VIEWPORT_DIMENSIONS } from '@/stores/builder';
import { Container } from '../components/Container';
import { cn } from '@/lib/utils';

interface CanvasProps {
  initialContent?: string;
}

/**
 * Canvas component - The editable area where components are rendered
 */
export function Canvas({ initialContent }: CanvasProps) {
  const { viewport, isPreviewMode } = useBuilderStore();
  const { width } = VIEWPORT_DIMENSIONS[viewport];
  const { enabled } = useEditor((state) => ({ enabled: state.options.enabled }));

  return (
    <div className="flex-1 bg-muted/50 overflow-auto p-8">
      <div
        className={cn(
          'mx-auto bg-background shadow-lg transition-all duration-300',
          isPreviewMode && 'pointer-events-none'
        )}
        style={{
          width: `${width}px`,
          maxWidth: '100%',
          minHeight: 'calc(100vh - 200px)',
        }}
      >
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
    </div>
  );
}
