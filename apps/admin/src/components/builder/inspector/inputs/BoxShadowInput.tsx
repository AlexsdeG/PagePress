// PagePress v0.0.7 - 2025-12-04
// Box Shadow Input Component

import { useCallback, useMemo } from 'react';
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

interface BoxShadowInputProps {
  value: BoxShadow[];
  onChange: (value: BoxShadow[]) => void;
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
export function BoxShadowInput({ value, onChange, className }: BoxShadowInputProps) {
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
          <Label className="text-xs text-muted-foreground">Shadows</Label>
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
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">X Offset</Label>
                      <span className="text-xs text-muted-foreground">{shadow.x}px</span>
                    </div>
                    <Slider
                      value={[shadow.x]}
                      min={-50}
                      max={50}
                      step={1}
                      onValueChange={([val]) => handleUpdateShadow(shadow.id, { x: val })}
                    />
                  </div>

                  {/* Y Offset */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Y Offset</Label>
                      <span className="text-xs text-muted-foreground">{shadow.y}px</span>
                    </div>
                    <Slider
                      value={[shadow.y]}
                      min={-50}
                      max={50}
                      step={1}
                      onValueChange={([val]) => handleUpdateShadow(shadow.id, { y: val })}
                    />
                  </div>

                  {/* Blur */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Blur</Label>
                      <span className="text-xs text-muted-foreground">{shadow.blur}px</span>
                    </div>
                    <Slider
                      value={[shadow.blur]}
                      min={0}
                      max={100}
                      step={1}
                      onValueChange={([val]) => handleUpdateShadow(shadow.id, { blur: val })}
                    />
                  </div>

                  {/* Spread */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Spread</Label>
                      <span className="text-xs text-muted-foreground">{shadow.spread}px</span>
                    </div>
                    <Slider
                      value={[shadow.spread]}
                      min={-50}
                      max={50}
                      step={1}
                      onValueChange={([val]) => handleUpdateShadow(shadow.id, { spread: val })}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </div>
  );
}
