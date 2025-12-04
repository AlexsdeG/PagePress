// PagePress v0.0.7 - 2025-12-04
// CSS Filter Input Component

import { useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import type { FilterSettings, BackdropFilterSettings } from '../styles/types';

interface FilterInputProps {
  value: FilterSettings;
  onChange: (value: FilterSettings) => void;
  className?: string;
}

interface BackdropFilterInputProps {
  value: BackdropFilterSettings;
  onChange: (value: BackdropFilterSettings) => void;
  className?: string;
}

/**
 * Default filter settings
 */
export const defaultFilterSettings: FilterSettings = {
  blur: 0,
  brightness: 100,
  contrast: 100,
  grayscale: 0,
  saturate: 100,
  hueRotate: 0,
  invert: 0,
  sepia: 0,
  opacity: 100,
};

/**
 * Default backdrop filter settings
 */
export const defaultBackdropFilterSettings: BackdropFilterSettings = {
  enabled: false,
  blur: 0,
  brightness: 100,
  contrast: 100,
  grayscale: 0,
  saturate: 100,
};

/**
 * Filter presets
 */
const filterPresets: { name: string; values: Partial<FilterSettings> }[] = [
  { name: 'None', values: defaultFilterSettings },
  { name: 'Grayscale', values: { grayscale: 100 } },
  { name: 'Sepia', values: { sepia: 80 } },
  { name: 'Vintage', values: { sepia: 50, contrast: 85, brightness: 110 } },
  { name: 'High Contrast', values: { contrast: 150, brightness: 105 } },
  { name: 'Faded', values: { brightness: 110, saturate: 80, contrast: 90 } },
  { name: 'Blur', values: { blur: 5 } },
  { name: 'Invert', values: { invert: 100 } },
];

/**
 * Filter slider configuration
 */
const filterSliders: {
  key: keyof FilterSettings;
  label: string;
  min: number;
  max: number;
  step: number;
  unit: string;
  defaultValue: number;
}[] = [
  { key: 'blur', label: 'Blur', min: 0, max: 20, step: 0.5, unit: 'px', defaultValue: 0 },
  { key: 'brightness', label: 'Brightness', min: 0, max: 200, step: 1, unit: '%', defaultValue: 100 },
  { key: 'contrast', label: 'Contrast', min: 0, max: 200, step: 1, unit: '%', defaultValue: 100 },
  { key: 'saturate', label: 'Saturate', min: 0, max: 200, step: 1, unit: '%', defaultValue: 100 },
  { key: 'grayscale', label: 'Grayscale', min: 0, max: 100, step: 1, unit: '%', defaultValue: 0 },
  { key: 'sepia', label: 'Sepia', min: 0, max: 100, step: 1, unit: '%', defaultValue: 0 },
  { key: 'hueRotate', label: 'Hue Rotate', min: 0, max: 360, step: 1, unit: '°', defaultValue: 0 },
  { key: 'invert', label: 'Invert', min: 0, max: 100, step: 1, unit: '%', defaultValue: 0 },
  { key: 'opacity', label: 'Opacity', min: 0, max: 100, step: 1, unit: '%', defaultValue: 100 },
];

/**
 * Filter Input - CSS filter controls
 */
export function FilterInput({ value, onChange, className }: FilterInputProps) {
  // Update a single property
  const handleChange = useCallback(
    (key: keyof FilterSettings, newValue: number) => {
      onChange({ ...value, [key]: newValue });
    },
    [value, onChange]
  );

  // Reset to defaults
  const handleReset = useCallback(() => {
    onChange(defaultFilterSettings);
  }, [onChange]);

  // Apply preset
  const handleApplyPreset = useCallback(
    (preset: typeof filterPresets[0]) => {
      onChange({ ...defaultFilterSettings, ...preset.values });
    },
    [onChange]
  );

  // Check if values differ from defaults
  const hasChanges = filterSliders.some(
    (slider) => value[slider.key] !== slider.defaultValue
  );

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header with reset */}
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Filters</Label>
        {hasChanges && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-6 px-2 text-xs"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset
          </Button>
        )}
      </div>

      {/* Presets */}
      <div className="flex gap-1 flex-wrap">
        {filterPresets.map((preset) => (
          <Button
            key={preset.name}
            variant="outline"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={() => handleApplyPreset(preset)}
          >
            {preset.name}
          </Button>
        ))}
      </div>

      {/* Filter sliders */}
      <div className="space-y-3">
        {filterSliders.map((slider) => (
          <div key={slider.key} className="space-y-1">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">{slider.label}</Label>
              <span className="text-xs text-muted-foreground">
                {value[slider.key]}
                {slider.unit}
              </span>
            </div>
            <Slider
              value={[value[slider.key]]}
              min={slider.min}
              max={slider.max}
              step={slider.step}
              onValueChange={([val]) => handleChange(slider.key, val)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Backdrop filter slider configuration
 */
const backdropFilterSliders: {
  key: keyof Omit<BackdropFilterSettings, 'enabled'>;
  label: string;
  min: number;
  max: number;
  step: number;
  unit: string;
  defaultValue: number;
}[] = [
  { key: 'blur', label: 'Blur', min: 0, max: 30, step: 0.5, unit: 'px', defaultValue: 0 },
  { key: 'brightness', label: 'Brightness', min: 0, max: 200, step: 1, unit: '%', defaultValue: 100 },
  { key: 'contrast', label: 'Contrast', min: 0, max: 200, step: 1, unit: '%', defaultValue: 100 },
  { key: 'saturate', label: 'Saturate', min: 0, max: 200, step: 1, unit: '%', defaultValue: 100 },
  { key: 'grayscale', label: 'Grayscale', min: 0, max: 100, step: 1, unit: '%', defaultValue: 0 },
];

/**
 * Backdrop filter presets
 */
const backdropFilterPresets: { name: string; values: Partial<BackdropFilterSettings> }[] = [
  { name: 'None', values: { enabled: false } },
  { name: 'Frosted Glass', values: { enabled: true, blur: 12, brightness: 100, saturate: 180 } },
  { name: 'Light Blur', values: { enabled: true, blur: 6, brightness: 105 } },
  { name: 'Heavy Blur', values: { enabled: true, blur: 20 } },
  { name: 'Dark Glass', values: { enabled: true, blur: 10, brightness: 80 } },
];

/**
 * Backdrop Filter Input - Backdrop filter controls (glass effects)
 */
export function BackdropFilterInput({ value, onChange, className }: BackdropFilterInputProps) {
  // Update a single property
  const handleChange = useCallback(
    <K extends keyof BackdropFilterSettings>(key: K, newValue: BackdropFilterSettings[K]) => {
      onChange({ ...value, [key]: newValue });
    },
    [value, onChange]
  );

  // Reset to defaults
  const handleReset = useCallback(() => {
    onChange(defaultBackdropFilterSettings);
  }, [onChange]);

  // Apply preset
  const handleApplyPreset = useCallback(
    (preset: typeof backdropFilterPresets[0]) => {
      onChange({ ...defaultBackdropFilterSettings, ...preset.values });
    },
    [onChange]
  );

  // Check if values differ from defaults
  const hasChanges =
    value.enabled ||
    backdropFilterSliders.some(
      (slider) => value[slider.key] !== slider.defaultValue
    );

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header with toggle and reset */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium">Backdrop Filter</Label>
          <button
            role="switch"
            aria-checked={value.enabled}
            onClick={() => handleChange('enabled', !value.enabled)}
            className={cn(
              'relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors',
              value.enabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
            )}
          >
            <span
              className={cn(
                'pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform',
                value.enabled ? 'translate-x-4' : 'translate-x-0'
              )}
            />
          </button>
        </div>
        {hasChanges && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-6 px-2 text-xs"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset
          </Button>
        )}
      </div>

      {value.enabled && (
        <>
          {/* Presets */}
          <div className="flex gap-1 flex-wrap">
            {backdropFilterPresets.map((preset) => (
              <Button
                key={preset.name}
                variant="outline"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => handleApplyPreset(preset)}
              >
                {preset.name}
              </Button>
            ))}
          </div>

          {/* Filter sliders */}
          <div className="space-y-3">
            {backdropFilterSliders.map((slider) => (
              <div key={slider.key} className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">{slider.label}</Label>
                  <span className="text-xs text-muted-foreground">
                    {value[slider.key]}
                    {slider.unit}
                  </span>
                </div>
                <Slider
                  value={[value[slider.key]]}
                  min={slider.min}
                  max={slider.max}
                  step={slider.step}
                  onValueChange={([val]) =>
                    handleChange(slider.key as keyof BackdropFilterSettings, val)
                  }
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
