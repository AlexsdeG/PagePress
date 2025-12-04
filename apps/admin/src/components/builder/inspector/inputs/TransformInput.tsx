// PagePress v0.0.9 - 2025-12-04
// Transform Input Component

import { useCallback, useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import type { TransformSettings } from '../styles/types';

interface TransformInputProps {
  value: TransformSettings;
  onChange: (value: TransformSettings) => void;
  className?: string;
}

/**
 * Default transform settings
 */
export const defaultTransformSettings: TransformSettings = {
  translateX: '0',
  translateY: '0',
  translateZ: '0',
  rotateX: 0,
  rotateY: 0,
  rotateZ: 0,
  scaleX: 1,
  scaleY: 1,
  skewX: 0,
  skewY: 0,
  perspective: 'none',
  originX: 'center',
  originY: 'center',
};

/**
 * Origin presets grid
 */
const originPresets = [
  { x: 'left', y: 'top', label: 'TL' },
  { x: 'center', y: 'top', label: 'T' },
  { x: 'right', y: 'top', label: 'TR' },
  { x: 'left', y: 'center', label: 'L' },
  { x: 'center', y: 'center', label: 'C' },
  { x: 'right', y: 'center', label: 'R' },
  { x: 'left', y: 'bottom', label: 'BL' },
  { x: 'center', y: 'bottom', label: 'B' },
  { x: 'right', y: 'bottom', label: 'BR' },
] as const;

/**
 * Clickable slider value component for transform sliders
 */
interface ClickableSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (value: number) => void;
}

function ClickableSlider({ label, value, min, max, step, unit = '', onChange }: ClickableSliderProps) {
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
    <div className="space-y-1">
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
            className="h-5 w-16 px-1.5 text-xs text-right"
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
 * Transform Input - Translate, Rotate, Scale, Skew controls
 */
export function TransformInput({ value, onChange, className }: TransformInputProps) {
  // Update a single property
  const handleChange = useCallback(
    <K extends keyof TransformSettings>(key: K, newValue: TransformSettings[K]) => {
      onChange({ ...value, [key]: newValue });
    },
    [value, onChange]
  );

  // Reset to defaults
  const handleReset = useCallback(() => {
    onChange(defaultTransformSettings);
  }, [onChange]);

  // Check if values differ from defaults
  const hasChanges =
    value.translateX !== '0' ||
    value.translateY !== '0' ||
    value.translateZ !== '0' ||
    value.rotateX !== 0 ||
    value.rotateY !== 0 ||
    value.rotateZ !== 0 ||
    value.scaleX !== 1 ||
    value.scaleY !== 1 ||
    value.skewX !== 0 ||
    value.skewY !== 0;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header with reset */}
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Transform</Label>
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

      {/* Translate */}
      <div className="space-y-3">
        <Label className="text-xs text-muted-foreground">Translate</Label>
        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">X</Label>
            <Input
              value={value.translateX}
              onChange={(e) => handleChange('translateX', e.target.value)}
              placeholder="0px"
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Y</Label>
            <Input
              value={value.translateY}
              onChange={(e) => handleChange('translateY', e.target.value)}
              placeholder="0px"
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Z</Label>
            <Input
              value={value.translateZ}
              onChange={(e) => handleChange('translateZ', e.target.value)}
              placeholder="0px"
              className="h-8 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Rotate */}
      <div className="space-y-3">
        <Label className="text-xs text-muted-foreground">Rotate</Label>
        <div className="space-y-2">
          <ClickableSlider
            label="X"
            value={value.rotateX}
            min={-180}
            max={180}
            step={1}
            unit="°"
            onChange={(val) => handleChange('rotateX', val)}
          />
          <ClickableSlider
            label="Y"
            value={value.rotateY}
            min={-180}
            max={180}
            step={1}
            unit="°"
            onChange={(val) => handleChange('rotateY', val)}
          />
          <ClickableSlider
            label="Z"
            value={value.rotateZ}
            min={-180}
            max={180}
            step={1}
            unit="°"
            onChange={(val) => handleChange('rotateZ', val)}
          />
        </div>
      </div>

      {/* Scale */}
      <div className="space-y-3">
        <Label className="text-xs text-muted-foreground">Scale</Label>
        <div className="grid grid-cols-2 gap-3">
          <ClickableSlider
            label="X"
            value={value.scaleX}
            min={0}
            max={3}
            step={0.01}
            onChange={(val) => handleChange('scaleX', val)}
          />
          <ClickableSlider
            label="Y"
            value={value.scaleY}
            min={0}
            max={3}
            step={0.01}
            onChange={(val) => handleChange('scaleY', val)}
          />
        </div>
      </div>

      {/* Skew */}
      <div className="space-y-3">
        <Label className="text-xs text-muted-foreground">Skew</Label>
        <div className="grid grid-cols-2 gap-3">
          <ClickableSlider
            label="X"
            value={value.skewX}
            min={-45}
            max={45}
            step={1}
            unit="°"
            onChange={(val) => handleChange('skewX', val)}
          />
          <ClickableSlider
            label="Y"
            value={value.skewY}
            min={-45}
            max={45}
            step={1}
            unit="°"
            onChange={(val) => handleChange('skewY', val)}
          />
        </div>
      </div>

      {/* Perspective */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Perspective</Label>
        <Input
          value={value.perspective}
          onChange={(e) => handleChange('perspective', e.target.value)}
          placeholder="none or 1000px"
          className="h-8 text-xs"
        />
      </div>

      {/* Transform Origin */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Transform Origin</Label>
        <div className="grid grid-cols-3 gap-1">
          {originPresets.map((preset) => (
            <Button
              key={preset.label}
              variant={
                value.originX === preset.x && value.originY === preset.y
                  ? 'default'
                  : 'outline'
              }
              size="sm"
              className="h-8 text-xs"
              onClick={() => {
                handleChange('originX', preset.x);
                handleChange('originY', preset.y);
              }}
            >
              {preset.label}
            </Button>
          ))}
        </div>
        
        {/* Custom origin inputs */}
        {(value.originX === 'custom' || value.originY === 'custom') && (
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Custom X</Label>
              <Input
                value={value.originXCustom || ''}
                onChange={(e) => handleChange('originXCustom', e.target.value)}
                placeholder="50%"
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Custom Y</Label>
              <Input
                value={value.originYCustom || ''}
                onChange={(e) => handleChange('originYCustom', e.target.value)}
                placeholder="50%"
                className="h-8 text-xs"
              />
            </div>
          </div>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          className="h-6 text-xs w-full"
          onClick={() => {
            handleChange('originX', 'custom');
            handleChange('originY', 'custom');
          }}
        >
          Use Custom Values
        </Button>
      </div>
    </div>
  );
}
