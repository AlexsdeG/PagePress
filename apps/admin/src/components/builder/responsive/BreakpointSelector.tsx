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

/**
 * Breakpoint selector component for the TopBar
 * Allows switching between desktop, tablet, and mobile views
 */
export function BreakpointSelector() {
  const {
    currentBreakpoint,
    setBreakpoint,
    previewOrientation,
    toggleOrientation,
    showDeviceFrame,
    toggleDeviceFrame,
  } = useBreakpointStore();

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
                    'h-7 w-7 p-0',
                    isActive && 'bg-background shadow-sm'
                  )}
                  onClick={() => setBreakpoint(bp.id)}
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
