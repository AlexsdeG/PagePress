// PagePress v0.0.7 - 2025-12-04
// Gradient Input Component

import { useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { HexColorPicker } from 'react-colorful';
import { Plus, X, GripVertical } from 'lucide-react';
import type { GradientSettings, GradientStop } from '../styles/types';
import { gradientToCSS } from '../styles/styleToCSS';

interface GradientInputProps {
  value: GradientSettings;
  onChange: (value: GradientSettings) => void;
  className?: string;
}

/**
 * Generate a unique ID for gradient stops
 */
function generateStopId(): string {
  return `stop-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Gradient Input - Linear/Radial gradient picker with angle and color stops
 */
export function GradientInput({ value, onChange, className }: GradientInputProps) {
  const [activeStopId, setActiveStopId] = useState<string | null>(null);
  const [draggedStopId, setDraggedStopId] = useState<string | null>(null);

  // Ensure stops have unique IDs
  const stops = useMemo(() => {
    return value.stops.map((stop, index) => ({
      ...stop,
      id: (stop as GradientStop & { id?: string }).id || `stop-${index}`,
    }));
  }, [value.stops]);

  // Get CSS gradient string for preview
  const gradientCSS = useMemo(() => gradientToCSS(value), [value]);

  // Update gradient type
  const handleTypeChange = useCallback(
    (type: 'linear' | 'radial') => {
      onChange({ ...value, type });
    },
    [value, onChange]
  );

  // Update angle (for linear gradients)
  const handleAngleChange = useCallback(
    (angle: number) => {
      onChange({ ...value, angle });
    },
    [value, onChange]
  );

  // Update shape (for radial gradients)
  const handleShapeChange = useCallback(
    (shape: 'circle' | 'ellipse') => {
      onChange({ ...value, shape });
    },
    [value, onChange]
  );

  // Add a new color stop
  const handleAddStop = useCallback(() => {
    const newStop: GradientStop & { id: string } = {
      id: generateStopId(),
      color: '#888888',
      position: 50,
    };
    const newStops = [...stops, newStop].sort((a, b) => a.position - b.position);
    onChange({ ...value, stops: newStops });
  }, [stops, value, onChange]);

  // Remove a color stop
  const handleRemoveStop = useCallback(
    (id: string) => {
      if (stops.length <= 2) return; // Minimum 2 stops required
      const newStops = stops.filter((stop) => stop.id !== id);
      onChange({ ...value, stops: newStops });
      if (activeStopId === id) {
        setActiveStopId(null);
      }
    },
    [stops, value, onChange, activeStopId]
  );

  // Update stop color
  const handleStopColorChange = useCallback(
    (id: string, color: string) => {
      const newStops = stops.map((stop) =>
        stop.id === id ? { ...stop, color } : stop
      );
      onChange({ ...value, stops: newStops });
    },
    [stops, value, onChange]
  );

  // Update stop position
  const handleStopPositionChange = useCallback(
    (id: string, position: number) => {
      const newStops = stops
        .map((stop) => (stop.id === id ? { ...stop, position } : stop))
        .sort((a, b) => a.position - b.position);
      onChange({ ...value, stops: newStops });
    },
    [stops, value, onChange]
  );

  // Handle click on gradient bar to add stop
  const handleGradientBarClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const position = Math.round(((e.clientX - rect.left) / rect.width) * 100);
      const newStop: GradientStop & { id: string } = {
        id: generateStopId(),
        color: '#888888',
        position,
      };
      const newStops = [...stops, newStop].sort((a, b) => a.position - b.position);
      onChange({ ...value, stops: newStops });
    },
    [stops, value, onChange]
  );

  // Handle drag on gradient bar
  const handleGradientBarDrag = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!draggedStopId) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const position = Math.max(0, Math.min(100, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
      handleStopPositionChange(draggedStopId, position);
    },
    [draggedStopId, handleStopPositionChange]
  );

  return (
    <div className={cn('space-y-3', className)}>
      {/* Gradient preview */}
      <div
        className="h-8 rounded-md border cursor-crosshair relative"
        style={{ background: gradientCSS }}
        onClick={handleGradientBarClick}
        onMouseMove={handleGradientBarDrag}
        onMouseUp={() => setDraggedStopId(null)}
        onMouseLeave={() => setDraggedStopId(null)}
      >
        {/* Color stop handles */}
        {stops.map((stop) => (
          <div
            key={stop.id}
            className={cn(
              'absolute top-1/2 -translate-y-1/2 w-3 h-5 rounded-sm border-2 border-white shadow-md cursor-move',
              activeStopId === stop.id && 'ring-2 ring-blue-500'
            )}
            style={{
              left: `${stop.position}%`,
              transform: 'translate(-50%, -50%)',
              backgroundColor: stop.color,
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              setActiveStopId(stop.id);
              setDraggedStopId(stop.id);
            }}
            onClick={(e) => {
              e.stopPropagation();
              setActiveStopId(stop.id);
            }}
          />
        ))}
      </div>

      {/* Type and angle/shape controls */}
      <div className="flex gap-2">
        <div className="flex-1">
          <Label className="text-xs text-muted-foreground mb-1 block">Type</Label>
          <Select value={value.type} onValueChange={handleTypeChange as (val: string) => void}>
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="linear">Linear</SelectItem>
              <SelectItem value="radial">Radial</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {value.type === 'linear' ? (
          <div className="flex-1">
            <Label className="text-xs text-muted-foreground mb-1 block">Angle</Label>
            <div className="flex items-center gap-2">
              <Slider
                value={[value.angle ?? 180]}
                min={0}
                max={360}
                step={1}
                onValueChange={([val]) => handleAngleChange(val)}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground w-8 text-right">
                {value.angle ?? 180}°
              </span>
            </div>
          </div>
        ) : (
          <div className="flex-1">
            <Label className="text-xs text-muted-foreground mb-1 block">Shape</Label>
            <Select
              value={value.shape ?? 'circle'}
              onValueChange={handleShapeChange as (val: string) => void}
            >
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="circle">Circle</SelectItem>
                <SelectItem value="ellipse">Ellipse</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Color stops list */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Color Stops</Label>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAddStop}
            className="h-6 px-2 text-xs"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add
          </Button>
        </div>

        {stops.map((stop) => (
          <div
            key={stop.id}
            className={cn(
              'flex items-center gap-2 p-2 rounded border',
              activeStopId === stop.id && 'border-blue-500 bg-blue-50 dark:bg-blue-950'
            )}
            onClick={() => setActiveStopId(stop.id)}
          >
            <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />

            {/* Color picker */}
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className="w-6 h-6 rounded border shadow-sm"
                  style={{ backgroundColor: stop.color }}
                />
              </PopoverTrigger>
              <PopoverContent className="w-auto p-3" align="start">
                <HexColorPicker
                  color={stop.color}
                  onChange={(color) => handleStopColorChange(stop.id, color)}
                />
                <Input
                  value={stop.color}
                  onChange={(e) => handleStopColorChange(stop.id, e.target.value)}
                  className="mt-2 h-8 text-xs"
                />
              </PopoverContent>
            </Popover>

            {/* Position slider */}
            <div className="flex-1 flex items-center gap-2">
              <Slider
                value={[stop.position]}
                min={0}
                max={100}
                step={1}
                onValueChange={([val]) => handleStopPositionChange(stop.id, val)}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground w-8 text-right">
                {stop.position}%
              </span>
            </div>

            {/* Remove button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveStop(stop.id);
              }}
              disabled={stops.length <= 2}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Default gradient settings
 */
export const defaultGradient: GradientSettings = {
  type: 'linear',
  angle: 180,
  stops: [
    { color: '#000000', position: 0 },
    { color: '#ffffff', position: 100 },
  ],
};
