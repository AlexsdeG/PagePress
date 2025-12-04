// PagePress v0.0.10 - 2025-12-04
// Global breakpoints settings tab

import { RotateCcw } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useGlobalSettingsStore } from '../globalSettingsStore';
import { DEFAULT_BREAKPOINTS } from '../../responsive/types';
import type { ThemeBreakpoint } from '../types';

/**
 * Breakpoints tab for global settings
 * Allows customizing breakpoint widths
 */
export function BreakpointsTab() {
  const { themeSettings, updateThemeSettings } = useGlobalSettingsStore();
  const breakpoints = themeSettings?.breakpoints || [];

  /**
   * Update a breakpoint value
   */
  const updateBreakpoint = (id: string, field: keyof ThemeBreakpoint, value: unknown) => {
    const updated = breakpoints.map((bp) =>
      bp.id === id ? { ...bp, [field]: value } : bp
    );
    updateThemeSettings({ breakpoints: updated });
  };

  /**
   * Reset to default breakpoints
   */
  const resetToDefaults = () => {
    const defaultBreakpoints: ThemeBreakpoint[] = DEFAULT_BREAKPOINTS.map((bp) => ({
      id: bp.id,
      label: bp.label,
      maxWidth: bp.maxWidth,
      minWidth: bp.minWidth,
    }));
    updateThemeSettings({ breakpoints: defaultBreakpoints });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Customize breakpoint widths for responsive design.
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs"
          onClick={resetToDefaults}
        >
          <RotateCcw className="h-3 w-3 mr-1" />
          Reset
        </Button>
      </div>

      <div className="space-y-4">
        {breakpoints.map((bp) => (
          <div
            key={bp.id}
            className="p-3 rounded-lg border bg-muted/30 space-y-3"
          >
            <div className="flex items-center justify-between">
              <Label className="font-medium text-sm">{bp.label}</Label>
              <span className="text-xs text-muted-foreground font-mono">
                {bp.id}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  Min Width
                </Label>
                <Input
                  type="number"
                  className="h-8"
                  value={bp.minWidth}
                  onChange={(e) =>
                    updateBreakpoint(bp.id, 'minWidth', parseInt(e.target.value) || 0)
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  Max Width
                </Label>
                <Input
                  type="number"
                  className="h-8"
                  value={bp.maxWidth ?? ''}
                  placeholder="∞"
                  disabled={bp.id === 'desktop'}
                  onChange={(e) =>
                    updateBreakpoint(
                      bp.id,
                      'maxWidth',
                      e.target.value ? parseInt(e.target.value) : null
                    )
                  }
                />
              </div>
            </div>

            {/* Visual indicator bar */}
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary/50 rounded-full"
                style={{
                  width: `${Math.min(100, (bp.maxWidth || 1920) / 19.2)}%`,
                  marginLeft: `${bp.minWidth / 19.2}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Breakpoint ranges summary */}
      <div className="p-3 rounded-lg bg-muted/50 space-y-2">
        <Label className="text-xs font-medium">Breakpoint Ranges</Label>
        <div className="text-xs text-muted-foreground space-y-1 font-mono">
          {breakpoints.map((bp) => (
            <div key={bp.id} className="flex justify-between">
              <span>{bp.label}:</span>
              <span>
                {bp.maxWidth
                  ? `${bp.minWidth}px – ${bp.maxWidth}px`
                  : `≥ ${bp.minWidth}px`}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
