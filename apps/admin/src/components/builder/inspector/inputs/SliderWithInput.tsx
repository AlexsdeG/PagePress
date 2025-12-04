// PagePress v0.0.9 - 2025-12-04
// Slider with clickable value input component

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface SliderWithInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  className?: string;
  showLabel?: boolean;
}

/**
 * Slider with clickable value display that becomes an input
 */
export function SliderWithInput({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit = '',
  className,
  showLabel = true,
}: SliderWithInputProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Handle value click to start editing
  const handleValueClick = useCallback(() => {
    setIsEditing(true);
    setInputValue(String(value));
  }, [value]);

  // Handle input blur to finish editing
  const handleInputBlur = useCallback(() => {
    setIsEditing(false);
    const parsed = parseFloat(inputValue);
    if (!isNaN(parsed)) {
      // Clamp to min/max
      const clamped = Math.min(Math.max(parsed, min), max);
      onChange(clamped);
      setInputValue(String(clamped));
    } else {
      // If invalid, revert to current value
      setInputValue(String(value));
    }
  }, [inputValue, min, max, onChange, value]);

  // Handle input key events
  const handleInputKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleInputBlur();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setInputValue(String(value));
    }
  }, [handleInputBlur, value]);

  // Format display value (show current value with unit when not editing)
  const displayValue = useMemo(() => {
    return `${value}${unit}`;
  }, [value, unit]);

  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex items-center justify-between">
        {showLabel && (
          <Label className="text-xs text-muted-foreground">{label}</Label>
        )}
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
            className="h-6 w-16 px-1.5 text-xs text-right"
          />
        ) : (
          <button
            onClick={handleValueClick}
            className="text-xs text-muted-foreground hover:text-foreground hover:bg-muted px-1.5 py-0.5 rounded transition-colors cursor-text"
            title="Click to edit value"
          >
            {displayValue}
          </button>
        )}
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={min}
        max={max}
        step={step}
        className="w-full"
      />
    </div>
  );
}

/**
 * Compact inline slider with clickable value (for use in rows)
 */
export function InlineSliderWithInput({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit = '',
  className,
}: SliderWithInputProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleValueClick = useCallback(() => {
    setIsEditing(true);
    setInputValue(String(value));
  }, [value]);

  const handleInputBlur = useCallback(() => {
    setIsEditing(false);
    const parsed = parseFloat(inputValue);
    if (!isNaN(parsed)) {
      const clamped = Math.min(Math.max(parsed, min), max);
      onChange(clamped);
      setInputValue(String(clamped));
    } else {
      setInputValue(String(value));
    }
  }, [inputValue, min, max, onChange, value]);

  const handleInputKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleInputBlur();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setInputValue(String(value));
    }
  }, [handleInputBlur, value]);

  const displayValue = useMemo(() => `${value}${unit}`, [value, unit]);

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Label className="text-xs text-muted-foreground shrink-0 w-20">{label}</Label>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={min}
        max={max}
        step={step}
        className="flex-1"
      />
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
          className="h-6 w-14 px-1.5 text-xs text-right shrink-0"
        />
      ) : (
        <button
          onClick={handleValueClick}
          className="text-xs text-muted-foreground hover:text-foreground hover:bg-muted px-1.5 py-0.5 rounded transition-colors cursor-text shrink-0 w-14 text-right"
          title="Click to edit"
        >
          {displayValue}
        </button>
      )}
    </div>
  );
}

export default SliderWithInput;
