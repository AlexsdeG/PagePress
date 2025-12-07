// PagePress v0.0.10 - 2025-12-04
// Breakpoint switcher component for TopBar

import { Monitor, Tablet, Smartphone, RotateCcw, Frame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useBuilderStore, type ViewportMode } from '@/stores/builder';
import { useBuilderContext } from '../context';
import { useBreakpointStore } from './breakpointStore';
import { DEFAULT_BREAKPOINTS, type BreakpointId } from './types';

/**
 * Icon mapping for breakpoints
 */
const BREAKPOINT_ICONS: Record<BreakpointId, React.ElementType> = {
  desktop: Monitor,
  tablet: Tablet,
  mobile: Smartphone,
  mobilePortrait: Smartphone,
};

// ...

export function BreakpointSelector() {
  const { save } = useBuilderContext();
  const {
    activeBreakpoint,
    setActiveBreakpoint,
    setViewport,
    hasUnsavedChanges
  } = useBuilderStore();

  const {
    currentBreakpoint,
    setBreakpoint,
    previewOrientation,
    toggleOrientation,
    showDeviceFrame,
    toggleDeviceFrame,
  } = useBreakpointStore();

  const handleBreakpointChange = async (bpId: BreakpointId) => {
    // Auto-save if needed
    if (hasUnsavedChanges) {
      await save();
    }

    // Update both stores
    setBreakpoint(bpId);

    // Map BreakpointId to ViewportMode (they share desktop/tablet/mobile)
    // mobilePortrait maps to mobile for the builder store
    const viewportMode = (bpId === 'mobilePortrait' ? 'mobile' : bpId) as ViewportMode;
    setActiveBreakpoint(viewportMode);
    setViewport(viewportMode);
  };

  // Only show first 3 breakpoints in selector (desktop, tablet, mobile)
  // mobilePortrait is accessible via the mobile breakpoint with portrait orientation
  const visibleBreakpoints = DEFAULT_BREAKPOINTS.slice(0, 3);

  return (
    <div className="flex items-center gap-1">
      {/* Breakpoint buttons */}
      <div className="flex items-center gap-0.5 bg-muted rounded-lg p-1">
        {visibleBreakpoints.map((bp) => {
          const Icon = BREAKPOINT_ICONS[bp.id];
          const isActive = currentBreakpoint === bp.id;

          return (
            <Tooltip key={bp.id}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'h-7 w-7 p-0 hover:bg-muted-foreground/20',
                    isActive && 'bg-background shadow-sm hover:bg-background'
                  )}
                  onClick={() => handleBreakpointChange(bp.id)}
                >
                  <Icon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-medium">{bp.label}</p>
                <p className="text-xs text-muted-foreground">
                  {bp.maxWidth ? `≤${bp.maxWidth}px` : `≥${bp.minWidth}px`}
                </p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>

      {/* Orientation toggle (only for mobile/tablet) */}
      {(currentBreakpoint === 'mobile' ||
        currentBreakpoint === 'mobilePortrait' ||
        currentBreakpoint === 'tablet') && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={toggleOrientation}
              >
                <RotateCcw
                  className={cn(
                    'h-4 w-4 transition-transform',
                    previewOrientation === 'landscape' && 'rotate-90'
                  )}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {previewOrientation === 'portrait' ? 'Landscape' : 'Portrait'}
            </TooltipContent>
          </Tooltip>
        )}

      {/* Device frame toggle */}
      {currentBreakpoint !== 'desktop' && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={showDeviceFrame ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 w-7 p-0"
              onClick={toggleDeviceFrame}
            >
              <Frame className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {showDeviceFrame ? 'Hide Device Frame' : 'Show Device Frame'}
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
