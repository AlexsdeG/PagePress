// PagePress v0.0.13 - 2025-12-05
// Tracked Input - Input with built-in modification tracking and context menu

import React, { useCallback, useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { HexColorPicker } from 'react-colorful';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { RotateCcw, Copy, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

/**
 * Props for tracked input components
 */
interface TrackedInputBaseProps {
  /** Field name for tracking */
  fieldName: string;
  /** Label text */
  label: string;
  /** Default value */
  defaultValue: unknown;
  /** Whether the value has been modified */
  isModified?: boolean;
  /** Called when value changes */
  onChange: (value: unknown, fieldName: string) => void;
  /** Called when reset is triggered */
  onReset?: (fieldName: string, defaultValue: unknown) => void;
  /** Additional class name */
  className?: string;
  /** Disable the input */
  disabled?: boolean;
  /** Show the label */
  showLabel?: boolean;
}

interface TrackedTextInputProps extends TrackedInputBaseProps {
  type?: 'text' | 'number' | 'email' | 'url';
  value: string | number;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
}

interface TrackedSelectInputProps extends TrackedInputBaseProps {
  value: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

interface TrackedSliderInputProps extends TrackedInputBaseProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
}

interface TrackedSwitchInputProps extends TrackedInputBaseProps {
  value: boolean;
  description?: string;
}

interface TrackedColorInputProps extends TrackedInputBaseProps {
  value: string;
  showInput?: boolean;
}

/**
 * Wrapper component that provides modification indicator and context menu
 */
function TrackedWrapper({
  isModified = false,
  onReset,
  fieldName,
  defaultValue,
  currentValue,
  label,
  children,
  className,
}: {
  isModified?: boolean;
  onReset?: (fieldName: string, defaultValue: unknown) => void;
  fieldName: string;
  defaultValue: unknown;
  currentValue: unknown;
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  const handleReset = useCallback(() => {
    onReset?.(fieldName, defaultValue);
    toast.success(`Reset ${label} to default`);
  }, [onReset, fieldName, defaultValue, label]);

  const handleCopy = useCallback(async () => {
    try {
      const value = typeof currentValue === 'object' 
        ? JSON.stringify(currentValue) 
        : String(currentValue ?? '');
      await navigator.clipboard.writeText(value);
      toast.success('Copied to clipboard');
    } catch {
      toast.error('Failed to copy');
    }
  }, [currentValue]);

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div className={cn('relative group', className)}>
          {/* Blue dot indicator for modified fields */}
          {isModified && (
            <div 
              className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-500 z-10"
              title="Modified from default"
            />
          )}
          {children}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem 
          onClick={handleReset}
          disabled={!isModified || !onReset}
          className={!isModified ? 'text-muted-foreground' : ''}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset to Default
        </ContextMenuItem>
        <ContextMenuItem onClick={handleCopy}>
          <Copy className="mr-2 h-4 w-4" />
          Copy Value
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

/**
 * Tracked Text Input
 */
export function TrackedTextInput({
  fieldName,
  label,
  value,
  defaultValue,
  isModified,
  onChange,
  onReset,
  className,
  disabled,
  showLabel = true,
  type = 'text',
  placeholder,
  min,
  max,
  step,
}: TrackedTextInputProps) {
  return (
    <TrackedWrapper
      isModified={isModified}
      onReset={onReset}
      fieldName={fieldName}
      defaultValue={defaultValue}
      currentValue={value}
      label={label}
      className={className}
    >
      <div className="space-y-1.5">
        {showLabel && <Label className="text-xs text-muted-foreground">{label}</Label>}
        <Input
          type={type}
          value={value}
          onChange={(e) => {
            const newValue = type === 'number' ? Number(e.target.value) : e.target.value;
            onChange(newValue, fieldName);
          }}
          placeholder={placeholder}
          disabled={disabled}
          min={min}
          max={max}
          step={step}
          className={cn('h-8 text-xs', isModified && 'border-blue-400')}
        />
      </div>
    </TrackedWrapper>
  );
}

/**
 * Tracked Select Input
 */
export function TrackedSelectInput({
  fieldName,
  label,
  value,
  defaultValue,
  isModified,
  onChange,
  onReset,
  options,
  placeholder,
  className,
  disabled,
  showLabel = true,
}: TrackedSelectInputProps) {
  return (
    <TrackedWrapper
      isModified={isModified}
      onReset={onReset}
      fieldName={fieldName}
      defaultValue={defaultValue}
      currentValue={value}
      label={label}
      className={className}
    >
      <div className="space-y-1.5">
        {showLabel && <Label className="text-xs text-muted-foreground">{label}</Label>}
        <Select
          value={value}
          onValueChange={(val) => onChange(val, fieldName)}
          disabled={disabled}
        >
          <SelectTrigger className={cn('h-8 text-xs', isModified && 'border-blue-400')}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="text-xs">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </TrackedWrapper>
  );
}

/**
 * Tracked Slider Input
 */
export function TrackedSliderInput({
  fieldName,
  label,
  value,
  defaultValue,
  isModified,
  onChange,
  onReset,
  min,
  max,
  step = 1,
  unit = '',
  className,
  disabled,
  showLabel = true,
}: TrackedSliderInputProps) {
  return (
    <TrackedWrapper
      isModified={isModified}
      onReset={onReset}
      fieldName={fieldName}
      defaultValue={defaultValue}
      currentValue={value}
      label={label}
      className={className}
    >
      <div className="space-y-1.5">
        {showLabel && (
          <div className="flex justify-between items-center">
            <Label className="text-xs text-muted-foreground">{label}</Label>
            <span className="text-xs text-muted-foreground">{value}{unit}</span>
          </div>
        )}
        <Slider
          value={[value]}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          onValueChange={([val]) => onChange(val, fieldName)}
          className={cn(isModified && '[&_[role=slider]]:border-blue-400')}
        />
      </div>
    </TrackedWrapper>
  );
}

/**
 * Tracked Switch Input
 */
export function TrackedSwitchInput({
  fieldName,
  label,
  value,
  defaultValue,
  isModified,
  onChange,
  onReset,
  description,
  className,
  disabled,
}: TrackedSwitchInputProps) {
  return (
    <TrackedWrapper
      isModified={isModified}
      onReset={onReset}
      fieldName={fieldName}
      defaultValue={defaultValue}
      currentValue={value}
      label={label}
      className={className}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label className="text-xs">{label}</Label>
          {description && (
            <p className="text-[10px] text-muted-foreground">{description}</p>
          )}
        </div>
        <Switch
          checked={value}
          onCheckedChange={(val) => onChange(val, fieldName)}
          disabled={disabled}
          className={cn(isModified && 'data-[state=checked]:bg-blue-500')}
        />
      </div>
    </TrackedWrapper>
  );
}

/**
 * Tracked Color Input
 */
export function TrackedColorInput({
  fieldName,
  label,
  value,
  defaultValue,
  isModified,
  onChange,
  onReset,
  showInput = true,
  className,
  disabled,
  showLabel = true,
}: TrackedColorInputProps) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  return (
    <TrackedWrapper
      isModified={isModified}
      onReset={onReset}
      fieldName={fieldName}
      defaultValue={defaultValue}
      currentValue={value}
      label={label}
      className={className}
    >
      <div className="space-y-1.5">
        {showLabel && <Label className="text-xs text-muted-foreground">{label}</Label>}
        <Popover>
          <PopoverTrigger asChild disabled={disabled}>
            <button 
              className={cn(
                'w-full h-8 rounded-md border flex items-center gap-2 px-2 text-xs',
                isModified && 'border-blue-400',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              <div
                className="w-5 h-5 rounded border shadow-sm shrink-0"
                style={{ backgroundColor: value || 'transparent' }}
              />
              <span className="flex-1 text-left truncate">{value || 'Select color...'}</span>
              <Palette className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3" align="start">
            <HexColorPicker
              color={localValue || '#000000'}
              onChange={(color) => {
                setLocalValue(color);
                onChange(color, fieldName);
              }}
            />
            {showInput && (
              <Input
                value={localValue || ''}
                onChange={(e) => {
                  setLocalValue(e.target.value);
                  onChange(e.target.value, fieldName);
                }}
                placeholder="#000000"
                className="mt-2 h-8 text-xs"
              />
            )}
          </PopoverContent>
        </Popover>
      </div>
    </TrackedWrapper>
  );
}

/**
 * Unit input with unit selector
 */
interface TrackedUnitInputProps extends TrackedInputBaseProps {
  value: string;
  units?: string[];
  placeholder?: string;
}

export function TrackedUnitInput({
  fieldName,
  label,
  value,
  defaultValue,
  isModified,
  onChange,
  onReset,
  units = ['px', '%', 'em', 'rem', 'vh', 'vw', 'auto'],
  placeholder = '0',
  className,
  disabled,
  showLabel = true,
}: TrackedUnitInputProps) {
  // Parse value into number and unit
  const parseValue = (val: string): { num: string; unit: string } => {
    if (val === 'auto' || val === 'inherit' || val === 'initial') {
      return { num: '', unit: val };
    }
    const match = val.match(/^(-?[\d.]+)(\D*)$/);
    if (match) {
      return { num: match[1], unit: match[2] || 'px' };
    }
    return { num: '', unit: 'px' };
  };

  const { num, unit } = parseValue(value || '');

  const handleNumberChange = (numVal: string) => {
    if (unit === 'auto' || unit === 'inherit' || unit === 'initial') {
      onChange(`${numVal}px`, fieldName);
    } else {
      onChange(`${numVal}${unit}`, fieldName);
    }
  };

  const handleUnitChange = (newUnit: string) => {
    if (newUnit === 'auto' || newUnit === 'inherit' || newUnit === 'initial') {
      onChange(newUnit, fieldName);
    } else {
      onChange(`${num || 0}${newUnit}`, fieldName);
    }
  };

  return (
    <TrackedWrapper
      isModified={isModified}
      onReset={onReset}
      fieldName={fieldName}
      defaultValue={defaultValue}
      currentValue={value}
      label={label}
      className={className}
    >
      <div className="space-y-1.5">
        {showLabel && <Label className="text-xs text-muted-foreground">{label}</Label>}
        <div className="flex gap-1">
          <Input
            type="text"
            value={num}
            onChange={(e) => handleNumberChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled || unit === 'auto' || unit === 'inherit'}
            className={cn('h-8 text-xs flex-1', isModified && 'border-blue-400')}
          />
          <Select value={unit} onValueChange={handleUnitChange} disabled={disabled}>
            <SelectTrigger className={cn('h-8 w-16 text-xs', isModified && 'border-blue-400')}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {units.map((u) => (
                <SelectItem key={u} value={u} className="text-xs">
                  {u}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </TrackedWrapper>
  );
}

export default {
  TrackedTextInput,
  TrackedSelectInput,
  TrackedSliderInput,
  TrackedSwitchInput,
  TrackedColorInput,
  TrackedUnitInput,
};
