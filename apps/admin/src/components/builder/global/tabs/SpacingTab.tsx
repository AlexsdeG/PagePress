// PagePress v0.0.10 - 2025-12-04
// Global spacing settings tab

import { RotateCcw } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useGlobalSettingsStore } from '../globalSettingsStore';

/**
 * Spacing tab for global settings
 * Manages base spacing unit and scale
 */
export function SpacingTab() {
  const { themeSettings, updateThemeSettings } = useGlobalSettingsStore();
  const spacing = themeSettings?.spacing || { base: 4, scale: [] };

  /**
   * Update spacing configuration
   */
  const updateSpacing = (field: 'base' | 'scale', value: number | number[]) => {
    updateThemeSettings({
      spacing: { ...spacing, [field]: value },
    });
  };

  /**
   * Reset to default spacing
   */
  const resetToDefaults = () => {
    updateThemeSettings({
      spacing: {
        base: 4,
        scale: [0.25, 0.5, 1, 1.5, 2, 3, 4, 6, 8, 12, 16],
      },
    });
  };

  /**
   * Generate spacing values based on scale
   */
  const getSpacingValues = () => {
    return spacing.scale.map((multiplier) => ({
      multiplier,
      value: spacing.base * multiplier,
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Configure your spacing scale for consistent layouts.
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

      {/* Base Unit */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Base Unit</Label>
          <span className="text-sm text-muted-foreground font-mono">
            {spacing.base}px
          </span>
        </div>
        <Slider
          value={[spacing.base]}
          min={2}
          max={8}
          step={1}
          onValueChange={([value]) => updateSpacing('base', value)}
        />
        <p className="text-xs text-muted-foreground">
          The base unit is multiplied by scale values to create your spacing
          system.
        </p>
      </div>

      {/* Scale Preview */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Spacing Scale</Label>
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-muted/50">
                <th className="px-3 py-2 text-left font-medium">Multiplier</th>
                <th className="px-3 py-2 text-left font-medium">Value</th>
                <th className="px-3 py-2 text-left font-medium">Preview</th>
              </tr>
            </thead>
            <tbody>
              {getSpacingValues().map(({ multiplier, value }) => (
                <tr key={multiplier} className="border-t">
                  <td className="px-3 py-2 font-mono">{multiplier}×</td>
                  <td className="px-3 py-2 font-mono">{value}px</td>
                  <td className="px-3 py-2">
                    <div
                      className="h-4 bg-primary/50 rounded"
                      style={{ width: `${Math.min(100, value * 2)}px` }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Custom Scale Input */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Custom Scale</Label>
        <Input
          className="h-9 text-sm font-mono"
          value={spacing.scale.join(', ')}
          onChange={(e) => {
            const values = e.target.value
              .split(',')
              .map((v) => parseFloat(v.trim()))
              .filter((v) => !isNaN(v));
            if (values.length > 0) {
              updateSpacing('scale', values);
            }
          }}
          placeholder="0.25, 0.5, 1, 1.5, 2, 3, 4, 6, 8, 12, 16"
        />
        <p className="text-xs text-muted-foreground">
          Enter comma-separated multipliers for your spacing scale.
        </p>
      </div>

      {/* Quick Reference */}
      <div className="p-3 rounded-lg bg-muted/50 space-y-2">
        <Label className="text-xs font-medium">CSS Custom Properties</Label>
        <div className="text-xs text-muted-foreground font-mono space-y-1">
          {getSpacingValues().slice(0, 6).map(({ multiplier, value }) => (
            <div key={multiplier}>
              --spacing-{multiplier.toString().replace('.', '-')}: {value}px;
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
