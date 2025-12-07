// PagePress v0.0.9 - 2025-12-04
// Box Shadow Input Component

import { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { HexColorPicker } from 'react-colorful';
import { Plus, X, ChevronDown, ChevronUp, GripVertical, Copy } from 'lucide-react';
import type { BoxShadow } from '../styles/types';
import { boxShadowToCSS } from '../styles/styleToCSS';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

/**
 * Clickable slider value component for shadow sliders
 */
interface ClickableShadowSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}

function ClickableShadowSlider({ label, value, min, max, step, onChange }: ClickableShadowSliderProps) {
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
        <Label className="text-xs">{label}</Label>
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
            {value}px
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

import { StyleIndicator } from './StyleIndicator';
import type { StyleSourceResult } from '../sidebar/types';

interface BoxShadowInputProps {
  value: BoxShadow[];
  onChange: (value: BoxShadow[]) => void;
  getStyleSource?: (path: string) => StyleSourceResult;
  path?: string;
  className?: string;
}

/**
 * Generate a unique ID for shadows
 */
function generateShadowId(): string {
  return `shadow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Default shadow
 */
const defaultShadow: Omit<BoxShadow, 'id'> = {
  inset: false,
  x: 0,
  y: 4,
  blur: 8,
  spread: 0,
  color: 'rgba(0, 0, 0, 0.2)',
};

/**
 * Shadow presets
 */
const shadowPresets: { name: string; shadows: Omit<BoxShadow, 'id'>[] }[] = [
  {
    name: 'Small',
    shadows: [{ inset: false, x: 0, y: 1, blur: 2, spread: 0, color: 'rgba(0, 0, 0, 0.05)' }],
  },
  {
    name: 'Medium',
    shadows: [{ inset: false, x: 0, y: 4, blur: 6, spread: -1, color: 'rgba(0, 0, 0, 0.1)' }],
  },
  {
    name: 'Large',
    shadows: [
      { inset: false, x: 0, y: 10, blur: 15, spread: -3, color: 'rgba(0, 0, 0, 0.1)' },
      { inset: false, x: 0, y: 4, blur: 6, spread: -2, color: 'rgba(0, 0, 0, 0.05)' },
    ],
  },
  {
    name: 'XL',
    shadows: [
      { inset: false, x: 0, y: 20, blur: 25, spread: -5, color: 'rgba(0, 0, 0, 0.1)' },
      { inset: false, x: 0, y: 10, blur: 10, spread: -5, color: 'rgba(0, 0, 0, 0.04)' },
    ],
  },
  {
    name: 'Inner',
    shadows: [{ inset: true, x: 0, y: 2, blur: 4, spread: 0, color: 'rgba(0, 0, 0, 0.06)' }],
  },
];

/**
 * Box Shadow Input - Multiple shadows with inset option
 */
export function BoxShadowInput({ value, onChange, getStyleSource, path, className }: BoxShadowInputProps) {
  // Get CSS box-shadow string for preview
  const shadowCSS = useMemo(() => {
    const result = boxShadowToCSS(value);
    return result.boxShadow || 'none';
  }, [value]);

  // Add a new shadow
  const handleAddShadow = useCallback(() => {
    const newShadow: BoxShadow = {
      id: generateShadowId(),
      ...defaultShadow,
    };
    onChange([...value, newShadow]);
  }, [value, onChange]);

  // Remove a shadow
  const handleRemoveShadow = useCallback(
    (id: string) => {
      onChange(value.filter((shadow) => shadow.id !== id));
    },
    [value, onChange]
  );

  // Duplicate a shadow
  const handleDuplicateShadow = useCallback(
    (id: string) => {
      const shadowToDuplicate = value.find((s) => s.id === id);
      if (shadowToDuplicate) {
        const newShadow: BoxShadow = {
          ...shadowToDuplicate,
          id: generateShadowId(),
        };
        const index = value.findIndex((s) => s.id === id);
        const newValue = [...value];
        newValue.splice(index + 1, 0, newShadow);
        onChange(newValue);
      }
    },
    [value, onChange]
  );

  // Move shadow up
  const handleMoveUp = useCallback(
    (id: string) => {
      const index = value.findIndex((s) => s.id === id);
      if (index > 0) {
        const newValue = [...value];
        [newValue[index - 1], newValue[index]] = [newValue[index], newValue[index - 1]];
        onChange(newValue);
      }
    },
    [value, onChange]
  );

  // Move shadow down
  const handleMoveDown = useCallback(
    (id: string) => {
      const index = value.findIndex((s) => s.id === id);
      if (index < value.length - 1) {
        const newValue = [...value];
        [newValue[index], newValue[index + 1]] = [newValue[index + 1], newValue[index]];
        onChange(newValue);
      }
    },
    [value, onChange]
  );

  // Update a shadow property
  const handleUpdateShadow = useCallback(
    (id: string, updates: Partial<BoxShadow>) => {
      onChange(
        value.map((shadow) => (shadow.id === id ? { ...shadow, ...updates } : shadow))
      );
    },
    [value, onChange]
  );

  // Apply preset
  const handleApplyPreset = useCallback(
    (preset: typeof shadowPresets[0]) => {
      const newShadows = preset.shadows.map((s) => ({
        ...s,
        id: generateShadowId(),
      }));
      onChange(newShadows);
    },
    [onChange]
  );

  return (
    <div className={cn('space-y-3', className)}>
      {/* Preview */}
      <div className="flex items-center gap-3">
        <div
          className="flex-1 h-16 rounded-md bg-white dark:bg-zinc-800 border flex items-center justify-center text-xs text-muted-foreground"
          style={{ boxShadow: shadowCSS }}
        >
          Preview
        </div>
      </div>

      {/* Presets */}
      <div className="flex gap-1 flex-wrap">
        {shadowPresets.map((preset) => (
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

      {/* Shadows list */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground">Shadows</Label>
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
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAddShadow}
            className="h-6 px-2 text-xs"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add
          </Button>
        </div>

        {value.length === 0 ? (
          <div className="text-xs text-muted-foreground text-center py-4 border rounded-md border-dashed">
            No shadows. Click Add to create one.
          </div>
        ) : (
          <Accordion type="multiple" className="space-y-1">
            {value.map((shadow, index) => (
              <AccordionItem
                key={shadow.id}
                value={shadow.id}
                className="border rounded-md px-2"
              >
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />

                  <AccordionTrigger className="flex-1 py-2 hover:no-underline">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: shadow.color }}
                      />
                      <span className="text-xs">
                        Shadow {index + 1}
                        {shadow.inset && ' (inset)'}
                      </span>
                    </div>
                  </AccordionTrigger>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMoveUp(shadow.id)}
                      disabled={index === 0}
                      className="h-6 w-6 p-0"
                    >
                      <ChevronUp className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMoveDown(shadow.id)}
                      disabled={index === value.length - 1}
                      className="h-6 w-6 p-0"
                    >
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDuplicateShadow(shadow.id)}
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveShadow(shadow.id)}
                      className="h-6 w-6 p-0 text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <AccordionContent className="pt-2 pb-3 space-y-3">
                  {/* Inset toggle */}
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Inset</Label>
                    <button
                      role="switch"
                      aria-checked={shadow.inset}
                      onClick={() => handleUpdateShadow(shadow.id, { inset: !shadow.inset })}
                      className={cn(
                        'relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors',
                        shadow.inset ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                      )}
                    >
                      <span
                        className={cn(
                          'pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform',
                          shadow.inset ? 'translate-x-4' : 'translate-x-0'
                        )}
                      />
                    </button>
                  </div>

                  {/* Color */}
                  <div className="space-y-1">
                    <Label className="text-xs">Color</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="w-full h-8 rounded border flex items-center gap-2 px-2">
                          <div
                            className="w-5 h-5 rounded border"
                            style={{ backgroundColor: shadow.color }}
                          />
                          <span className="text-xs flex-1 text-left">{shadow.color}</span>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-3" align="start">
                        <HexColorPicker
                          color={shadow.color}
                          onChange={(color) => handleUpdateShadow(shadow.id, { color })}
                        />
                        <Input
                          value={shadow.color}
                          onChange={(e) => handleUpdateShadow(shadow.id, { color: e.target.value })}
                          placeholder="rgba(0, 0, 0, 0.2)"
                          className="mt-2 h-8 text-xs"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* X Offset */}
                  <ClickableShadowSlider
                    label="X Offset"
                    value={shadow.x}
                    min={-50}
                    max={50}
                    step={1}
                    onChange={(val) => handleUpdateShadow(shadow.id, { x: val })}
                  />

                  {/* Y Offset */}
                  <ClickableShadowSlider
                    label="Y Offset"
                    value={shadow.y}
                    min={-50}
                    max={50}
                    step={1}
                    onChange={(val) => handleUpdateShadow(shadow.id, { y: val })}
                  />

                  {/* Blur */}
                  <ClickableShadowSlider
                    label="Blur"
                    value={shadow.blur}
                    min={0}
                    max={100}
                    step={1}
                    onChange={(val) => handleUpdateShadow(shadow.id, { blur: val })}
                  />

                  {/* Spread */}
                  <ClickableShadowSlider
                    label="Spread"
                    value={shadow.spread}
                    min={-50}
                    max={50}
                    step={1}
                    onChange={(val) => handleUpdateShadow(shadow.id, { spread: val })}
                  />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </div>
  );
}
