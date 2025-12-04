// PagePress v0.0.10 - 2025-12-04
// Visual indicator for responsive values

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useBreakpointStore } from './breakpointStore';
import { hasBreakpointOverride, type ResponsiveValue } from './types';

interface ResponsiveIndicatorProps<T> {
  /** The responsive value to check */
  value: T | ResponsiveValue<T>;
  /** Callback when reset button is clicked */
  onReset?: () => void;
  /** Whether to show the indicator inline */
  inline?: boolean;
}

/**
 * Small indicator that shows when a value has a breakpoint-specific override
 * Displays a colored dot and allows resetting to inherit from desktop
 */
export function ResponsiveIndicator<T>({
  value,
  onReset,
  inline = true,
}: ResponsiveIndicatorProps<T>) {
  const { currentBreakpoint } = useBreakpointStore();

  // Don't show indicator on desktop (it's always the base)
  if (currentBreakpoint === 'desktop') {
    return null;
  }

  // Check if current breakpoint has a specific override
  const hasOverride = hasBreakpointOverride(value, currentBreakpoint);

  if (!hasOverride) {
    return null;
  }

  const indicator = (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`${inline ? 'h-4 w-4' : 'h-5 w-5'} p-0 hover:bg-blue-100`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onReset?.();
          }}
        >
          <span className="w-2 h-2 rounded-full bg-blue-500" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top">
        <p className="text-xs">
          Has <span className="font-medium">{currentBreakpoint}</span> value
        </p>
        {onReset && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
            <X className="h-3 w-3" /> Click to reset
          </p>
        )}
      </TooltipContent>
    </Tooltip>
  );

  return indicator;
}

/**
 * Breakpoint badge - shows which breakpoint values are defined
 */
interface BreakpointBadgeProps<T> {
  value: T | ResponsiveValue<T>;
}

export function BreakpointBadge<T>({ value }: BreakpointBadgeProps<T>) {
  const breakpoints = ['tablet', 'mobile', 'mobilePortrait'] as const;
  const definedBreakpoints = breakpoints.filter((bp) =>
    hasBreakpointOverride(value, bp)
  );

  if (definedBreakpoints.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-0.5">
      {definedBreakpoints.map((bp) => (
        <Tooltip key={bp}>
          <TooltipTrigger asChild>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          </TooltipTrigger>
          <TooltipContent>{bp}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}
