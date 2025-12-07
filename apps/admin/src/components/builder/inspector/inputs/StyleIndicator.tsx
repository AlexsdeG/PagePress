import { cn } from '@/lib/utils';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

export interface StyleIndicatorProps {
    /** Is the value modified by the user in the current context? (Blue) */
    isModified?: boolean;
    /** Is the value inherited from a CSS class? (Green) */
    isClassInherited?: boolean;
    /** Is the value inherited from global settings? (Red) */
    isGlobalInherited?: boolean;
    /** Is the value an override of the base breakpoint? (Yellow) */
    isResponsiveOverride?: boolean;
    /** Orientation of the dots (default: horizontal) */
    orientation?: 'horizontal' | 'vertical';
    className?: string;
}

export function StyleIndicator({
    isModified,
    isClassInherited,
    isGlobalInherited,
    isResponsiveOverride,
    orientation = 'horizontal',
    className,
}: StyleIndicatorProps) {
    // Determine Source Dot (User > Class > Global)
    let sourceColor = '';
    let sourceLabel = '';

    if (isModified) {
        sourceColor = 'bg-blue-500';
        sourceLabel = 'Modified (User)';
    } else if (isClassInherited) {
        sourceColor = 'bg-green-500';
        sourceLabel = 'Inherited (Class)';
    } else if (isGlobalInherited) {
        sourceColor = 'bg-red-500';
        sourceLabel = 'Inherited (Global)';
    }

    // Determine Responsive Dot
    const showResponsive = isResponsiveOverride;
    const responsiveLabel = 'Responsive Override';

    if (!sourceColor && !showResponsive) {
        return null;
    }

    return (
        <div className={cn(
            "absolute top-1/2 -translate-y-1/2 flex",
            orientation === 'vertical' ? "flex-col gap-0.5 left-1" : "flex-row gap-1 left-1",
            className
        )}>
            <TooltipProvider delayDuration={300}>
                {/* Source Dot */}
                {sourceColor && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className={cn("w-1.5 h-1.5 rounded-full", sourceColor)} />
                        </TooltipTrigger>
                        <TooltipContent side="left" className="text-xs">
                            {sourceLabel}
                        </TooltipContent>
                    </Tooltip>
                )}

                {/* Responsive Dot */}
                {showResponsive && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                        </TooltipTrigger>
                        <TooltipContent side="left" className="text-xs">
                            {responsiveLabel}
                        </TooltipContent>
                    </Tooltip>
                )}
            </TooltipProvider>
        </div>
    );
}
