// PagePress v0.0.10 - 2025-12-04
// Visual device frame for canvas preview

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useBreakpointStore } from './breakpointStore';
import { BREAKPOINT_DIMENSIONS, type BreakpointId } from './types';

interface DeviceFrameProps {
  children: ReactNode;
}

/**
 * Visual device frame that wraps the canvas when enabled
 * Shows phone/tablet bezel graphics with accurate dimensions
 */
export function DeviceFrame({ children }: DeviceFrameProps) {
  const { currentBreakpoint, showDeviceFrame, previewOrientation } =
    useBreakpointStore();

  // Don't show frame for desktop or when disabled
  if (!showDeviceFrame || currentBreakpoint === 'desktop') {
    return <>{children}</>;
  }

  const dimensions = BREAKPOINT_DIMENSIONS[currentBreakpoint];
  const isLandscape = previewOrientation === 'landscape';

  // Swap dimensions for landscape orientation
  const width = isLandscape ? dimensions.height : dimensions.width;
  const height = isLandscape ? dimensions.width : dimensions.height;

  const isPhone =
    currentBreakpoint === 'mobile' || currentBreakpoint === 'mobilePortrait';
  const isTablet = currentBreakpoint === 'tablet';

  return (
    <div className="flex items-center justify-center p-8">
      <div
        className={cn(
          'relative bg-gray-900 shadow-2xl',
          // Bezel sizes
          isPhone && 'rounded-[40px] p-3',
          isTablet && 'rounded-[30px] p-4'
        )}
      >
        {/* Notch for modern phones */}
        {isPhone && !isLandscape && (
          <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-20 h-5 bg-gray-900 rounded-b-xl z-10" />
        )}

        {/* Side notch for landscape phones */}
        {isPhone && isLandscape && (
          <div className="absolute left-1.5 top-1/2 -translate-y-1/2 h-20 w-5 bg-gray-900 rounded-r-xl z-10" />
        )}

        {/* Home button for tablets (iPad style) */}
        {isTablet && !isLandscape && (
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full border-2 border-gray-700" />
        )}

        {/* Camera dot */}
        {isPhone && !isLandscape && (
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-700 rounded-full" />
        )}

        {/* Screen */}
        <div
          className={cn(
            'bg-white overflow-auto',
            isPhone && 'rounded-4xl',
            isTablet && 'rounded-[20px]'
          )}
          style={{
            width: `${width}px`,
            height: `${height}px`,
            maxHeight: 'calc(100vh - 200px)',
          }}
        >
          {children}
        </div>

        {/* Power button (right side) */}
        <div
          className={cn(
            'absolute bg-gray-700 rounded-l-sm',
            isLandscape
              ? 'top-2 right-0 w-1 h-10 rounded-t-sm'
              : 'top-20 -right-0.5 w-1 h-16'
          )}
        />

        {/* Volume buttons (left side for phone) */}
        {isPhone && (
          <>
            <div
              className={cn(
                'absolute bg-gray-700 rounded-r-sm',
                isLandscape
                  ? 'bottom-16 left-0 w-1 h-8'
                  : 'top-28 -left-0.5 w-1 h-8'
              )}
            />
            <div
              className={cn(
                'absolute bg-gray-700 rounded-r-sm',
                isLandscape
                  ? 'bottom-28 left-0 w-1 h-8'
                  : 'top-40 -left-0.5 w-1 h-8'
              )}
            />
          </>
        )}
      </div>

      {/* Device label */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-muted-foreground">
        {width} × {height}
      </div>
    </div>
  );
}

/**
 * Get canvas width based on current breakpoint and orientation
 */
export function getCanvasWidth(
  breakpoint: BreakpointId, 
  orientation: 'portrait' | 'landscape' = 'portrait'
): number {
  const dimensions = BREAKPOINT_DIMENSIONS[breakpoint];
  // For non-desktop breakpoints, swap width/height in landscape
  if (breakpoint !== 'desktop' && orientation === 'landscape') {
    return dimensions.height;
  }
  return dimensions.width;
}

/**
 * Get canvas height based on current breakpoint and orientation
 */
export function getCanvasHeight(
  breakpoint: BreakpointId, 
  orientation: 'portrait' | 'landscape' = 'portrait'
): number {
  const dimensions = BREAKPOINT_DIMENSIONS[breakpoint];
  // For non-desktop breakpoints, swap width/height in landscape
  if (breakpoint !== 'desktop' && orientation === 'landscape') {
    return dimensions.width;
  }
  return dimensions.height;
}
