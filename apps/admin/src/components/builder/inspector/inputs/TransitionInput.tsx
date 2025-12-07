// PagePress v0.0.9 - 2025-12-04
// Transition Input Component

import { useCallback, useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RotateCcw } from 'lucide-react';
import { StyleIndicator } from './StyleIndicator';
import type { TransitionSettings } from '../styles/types';
import type { StyleSourceResult } from '../sidebar/types';

interface TransitionInputProps {
  value: TransitionSettings;
  onChange: (value: TransitionSettings) => void;
  getStyleSource?: (path: string) => StyleSourceResult;
  path?: string;
  className?: string;
}

/**
 * Default transition settings
 */
export const defaultTransitionSettings: TransitionSettings = {
  enabled: false,
  property: 'all',
  duration: 300,
  timingFunction: 'ease',
  delay: 0,
};

/**
 * Transition property options
 */
const transitionProperties: { value: TransitionSettings['property']; label: string }[] = [
  { value: 'all', label: 'All Properties' },
  { value: 'transform', label: 'Transform' },
  { value: 'opacity', label: 'Opacity' },
  { value: 'background', label: 'Background' },
  { value: 'color', label: 'Color' },
  { value: 'border', label: 'Border' },
  { value: 'box-shadow', label: 'Box Shadow' },
  { value: 'custom', label: 'Custom...' },
];

/**
 * Timing function options
 */
const timingFunctions: { value: TransitionSettings['timingFunction']; label: string }[] = [
  { value: 'ease', label: 'Ease' },
  { value: 'ease-in', label: 'Ease In' },
  { value: 'ease-out', label: 'Ease Out' },
  { value: 'ease-in-out', label: 'Ease In Out' },
  { value: 'linear', label: 'Linear' },
  { value: 'cubic-bezier', label: 'Cubic Bezier' },
];

/**
 * Duration presets
 */
const durationPresets = [
  { value: 150, label: 'Fast' },
  { value: 300, label: 'Normal' },
  { value: 500, label: 'Slow' },
  { value: 1000, label: '1s' },
];

/**
 * Clickable slider value component
 */
interface ClickableSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (value: number) => void;
}

function ClickableSlider({ label, value, min, max, step, unit, onChange }: ClickableSliderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleValueClick = () => {
    setIsEditing(true);
    setInputValue(String(value));
  };

  const handleInputBlur = () => {
    setIsEditing(false);
    const parsed = parseFloat(inputValue);
    if (!isNaN(parsed)) {
      const clamped = Math.min(Math.max(parsed, min), max);
      onChange(clamped);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleInputBlur();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setInputValue(String(value));
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs text-muted-foreground">{label}</Label>
        {isEditing ? (
          <Input
            ref={inputRef}
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={handleInputBlur}
            onKeyDown={handleInputKeyDown}
            min={min}
            max={max}
            step={step}
            className="h-5 w-20 px-1.5 text-xs text-right"
          />
        ) : (
          <button
            onClick={handleValueClick}
            className="text-xs text-muted-foreground hover:text-foreground hover:bg-muted px-1.5 py-0.5 rounded transition-colors cursor-text"
            title="Click to edit value"
          >
            {value}{unit}
          </button>
        )}
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([val]) => onChange(val)}
      />
    </div>
  );
}

/**
 * Transition Input - CSS transition controls
 */
export function TransitionInput({ value, onChange, getStyleSource, path, className }: TransitionInputProps) {
  // Update a single property
  const handleChange = useCallback(
    <K extends keyof TransitionSettings>(key: K, newValue: TransitionSettings[K]) => {
      onChange({ ...value, [key]: newValue });
    },
    [value, onChange]
  );

  // Reset to defaults
  const handleReset = useCallback(() => {
    onChange(defaultTransitionSettings);
  }, [onChange]);

  // Check if values differ from defaults
  const hasChanges =
    value.enabled ||
    value.property !== 'all' ||
    value.duration !== 300 ||
    value.timingFunction !== 'ease' ||
    value.delay !== 0;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header with toggle and reset */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium">Transition</Label>
          {getStyleSource && path && (
            <StyleIndicator
              isModified={getStyleSource(path).source === 'user'}
              isClassInherited={getStyleSource(path).source === 'class'}
              isGlobalInherited={getStyleSource(path).source === 'global'}
              isResponsiveOverride={getStyleSource(path).isResponsive}
              className="static translate-y-0 ml-1"
              orientation="vertical"
            />
          )}
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
        <div className="space-y-4">
          {/* Property */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Property</Label>
            <Select
              value={value.property}
              onValueChange={(val) =>
                handleChange('property', val as TransitionSettings['property'])
              }
            >
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {transitionProperties.map((prop) => (
                  <SelectItem key={prop.value} value={prop.value}>
                    {prop.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {value.property === 'custom' && (
              <Input
                value={value.customProperty || ''}
                onChange={(e) => handleChange('customProperty', e.target.value)}
                placeholder="e.g., width, height, opacity"
                className="h-8 text-xs mt-2"
              />
            )}
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <ClickableSlider
              label="Duration"
              value={value.duration}
              min={0}
              max={2000}
              step={50}
              unit="ms"
              onChange={(val) => handleChange('duration', val)}
            />
            <div className="flex gap-1">
              {durationPresets.map((preset) => (
                <Button
                  key={preset.value}
                  variant={value.duration === preset.value ? 'default' : 'outline'}
                  size="sm"
                  className="h-6 px-2 text-xs flex-1"
                  onClick={() => handleChange('duration', preset.value)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Timing Function */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Timing Function</Label>
            <Select
              value={value.timingFunction}
              onValueChange={(val) =>
                handleChange('timingFunction', val as TransitionSettings['timingFunction'])
              }
            >
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timingFunctions.map((func) => (
                  <SelectItem key={func.value} value={func.value}>
                    {func.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Cubic Bezier controls */}
            {value.timingFunction === 'cubic-bezier' && (
              <div className="grid grid-cols-4 gap-2 mt-2">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      P{i + 1}
                    </Label>
                    <Input
                      type="number"
                      step={0.1}
                      min={i % 2 === 0 ? 0 : -1}
                      max={i % 2 === 0 ? 1 : 2}
                      value={value.cubicBezier?.[i] ?? (i % 2 === 0 ? 0 : 1)}
                      onChange={(e) => {
                        const newBezier: [number, number, number, number] = [
                          ...(value.cubicBezier || [0, 0, 1, 1]),
                        ] as [number, number, number, number];
                        newBezier[i] = parseFloat(e.target.value) || 0;
                        handleChange('cubicBezier', newBezier);
                      }}
                      className="h-8 text-xs"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Delay */}
          <ClickableSlider
            label="Delay"
            value={value.delay}
            min={0}
            max={1000}
            step={50}
            unit="ms"
            onChange={(val) => handleChange('delay', val)}
          />

          {/* Preview */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Preview</Label>
            <div className="border rounded-md p-4 flex justify-center">
              <div
                className="w-12 h-12 bg-blue-500 rounded-md hover:scale-110 hover:bg-blue-600"
                style={{
                  transition: value.enabled
                    ? `${value.property === 'custom' ? value.customProperty : value.property} ${value.duration}ms ${value.timingFunction === 'cubic-bezier' && value.cubicBezier ? `cubic-bezier(${value.cubicBezier.join(', ')})` : value.timingFunction} ${value.delay}ms`
                    : 'none',
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Hover to preview transition
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
