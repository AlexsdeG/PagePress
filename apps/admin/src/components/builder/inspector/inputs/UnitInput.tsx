// PagePress v0.0.8 - 2025-12-04
// Unit Input Component - Number with unit selector

import { useState, useCallback, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

/**
 * Available CSS units
 */
export type CSSUnit = 'px' | '%' | 'em' | 'rem' | 'vh' | 'vw' | 'vmin' | 'vmax' | 'ch' | 'auto' | 'none' | '';

/**
 * Unit groups for different property types
 */
export const UNIT_GROUPS = {
  dimension: ['px', '%', 'em', 'rem', 'vh', 'vw', 'auto'] as CSSUnit[],
  spacing: ['px', '%', 'em', 'rem'] as CSSUnit[],
  fontSize: ['px', 'em', 'rem', '%', 'vw'] as CSSUnit[],
  lineHeight: ['', 'px', 'em', '%'] as CSSUnit[],
  borderRadius: ['px', '%', 'em', 'rem'] as CSSUnit[],
  all: ['px', '%', 'em', 'rem', 'vh', 'vw', 'vmin', 'vmax', 'ch', 'auto', 'none', ''] as CSSUnit[],
};

interface UnitInputProps {
  /** Current value (e.g., "16px", "100%", "auto") */
  value: string;
  /** Called when value changes */
  onChange: (value: string) => void;
  /** Available units */
  units?: CSSUnit[];
  /** Default unit when parsing fails */
  defaultUnit?: CSSUnit;
  /** Placeholder text */
  placeholder?: string;
  /** Minimum value (for number input) */
  min?: number;
  /** Maximum value (for number input) */
  max?: number;
  /** Step value */
  step?: number;
  /** Allow negative values */
  allowNegative?: boolean;
  /** Additional class name */
  className?: string;
  /** Label for the input */
  label?: string;
  /** Disabled state */
  disabled?: boolean;
}

/**
 * Parse a CSS value string into number and unit
 */
export function parseUnitValue(value: string): { number: number | null; unit: CSSUnit } {
  if (!value || value === 'auto' || value === 'none') {
    return { number: null, unit: value as CSSUnit };
  }
  
  const match = value.match(/^(-?[\d.]+)\s*(.*)$/);
  if (match) {
    const num = parseFloat(match[1]);
    const unit = (match[2] || 'px') as CSSUnit;
    return { number: isNaN(num) ? null : num, unit };
  }
  
  return { number: null, unit: 'px' };
}

/**
 * Format number and unit into CSS value string
 */
export function formatUnitValue(number: number | null, unit: CSSUnit): string {
  if (unit === 'auto' || unit === 'none') {
    return unit;
  }
  if (number === null || isNaN(number)) {
    return '';
  }
  return `${number}${unit}`;
}

/**
 * UnitInput - Number input with unit selector
 */
export function UnitInput({
  value,
  onChange,
  units = UNIT_GROUPS.dimension,
  defaultUnit = 'px',
  placeholder = '0',
  min,
  max,
  step = 1,
  allowNegative = true,
  className,
  label,
  disabled = false,
}: UnitInputProps) {
  const parsed = parseUnitValue(value);
  const [localNumber, setLocalNumber] = useState<string>(
    parsed.number !== null ? String(parsed.number) : ''
  );
  const [localUnit, setLocalUnit] = useState<CSSUnit>(
    parsed.unit || defaultUnit
  );

  // Sync with external value changes
  useEffect(() => {
    const parsed = parseUnitValue(value);
    setLocalNumber(parsed.number !== null ? String(parsed.number) : '');
    setLocalUnit(parsed.unit || defaultUnit);
  }, [value, defaultUnit]);

  const handleNumberChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      setLocalNumber(inputValue);

      if (inputValue === '' || inputValue === '-') {
        onChange('');
        return;
      }

      const num = parseFloat(inputValue);
      if (!isNaN(num)) {
        const clampedNum = Math.max(
          min ?? (allowNegative ? -Infinity : 0),
          Math.min(max ?? Infinity, num)
        );
        onChange(formatUnitValue(clampedNum, localUnit));
      }
    },
    [localUnit, onChange, min, max, allowNegative]
  );

  const handleUnitChange = useCallback(
    (newUnit: CSSUnit) => {
      setLocalUnit(newUnit);
      if (newUnit === 'auto' || newUnit === 'none') {
        onChange(newUnit);
      } else if (localNumber !== '' && localNumber !== '-') {
        const num = parseFloat(localNumber);
        if (!isNaN(num)) {
          onChange(formatUnitValue(num, newUnit));
        }
      }
    },
    [localNumber, onChange]
  );

  const isAutoOrNone = localUnit === 'auto' || localUnit === 'none';

  return (
    <div className={cn('space-y-1', className)}>
      {label && (
        <label className="text-xs text-muted-foreground">{label}</label>
      )}
      <div className="flex gap-1">
        <Input
          type="text"
          inputMode="decimal"
          value={isAutoOrNone ? '' : localNumber}
          onChange={handleNumberChange}
          placeholder={isAutoOrNone ? localUnit : placeholder}
          disabled={disabled || isAutoOrNone}
          className={cn(
            'h-8 text-sm flex-1',
            isAutoOrNone && 'bg-muted'
          )}
          min={allowNegative ? undefined : 0}
          step={step}
        />
        <Select
          value={localUnit}
          onValueChange={(v) => handleUnitChange(v as CSSUnit)}
          disabled={disabled}
        >
          <SelectTrigger className="h-8 w-16 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {units.map((unit) => (
              <SelectItem key={unit || 'unitless'} value={unit} className="text-xs">
                {unit || '—'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

/**
 * Compact unit input for inline use
 */
export function CompactUnitInput({
  value,
  onChange,
  units = UNIT_GROUPS.dimension,
  defaultUnit = 'px',
  placeholder = '0',
  min,
  max,
  step = 1,
  allowNegative = true,
  className,
  disabled = false,
}: Omit<UnitInputProps, 'label'>) {
  const parsed = parseUnitValue(value);
  const [localNumber, setLocalNumber] = useState<string>(
    parsed.number !== null ? String(parsed.number) : ''
  );
  const [localUnit, setLocalUnit] = useState<CSSUnit>(
    parsed.unit || defaultUnit
  );

  useEffect(() => {
    const parsed = parseUnitValue(value);
    setLocalNumber(parsed.number !== null ? String(parsed.number) : '');
    setLocalUnit(parsed.unit || defaultUnit);
  }, [value, defaultUnit]);

  const handleNumberChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      setLocalNumber(inputValue);

      if (inputValue === '' || inputValue === '-') {
        onChange('');
        return;
      }

      const num = parseFloat(inputValue);
      if (!isNaN(num)) {
        const clampedNum = Math.max(
          min ?? (allowNegative ? -Infinity : 0),
          Math.min(max ?? Infinity, num)
        );
        onChange(formatUnitValue(clampedNum, localUnit));
      }
    },
    [localUnit, onChange, min, max, allowNegative]
  );

  const handleUnitChange = useCallback(
    (newUnit: CSSUnit) => {
      setLocalUnit(newUnit);
      if (newUnit === 'auto' || newUnit === 'none') {
        onChange(newUnit);
      } else if (localNumber !== '' && localNumber !== '-') {
        const num = parseFloat(localNumber);
        if (!isNaN(num)) {
          onChange(formatUnitValue(num, newUnit));
        }
      }
    },
    [localNumber, onChange]
  );

  const isAutoOrNone = localUnit === 'auto' || localUnit === 'none';

  return (
    <div className={cn('flex gap-0.5', className)}>
      <Input
        type="text"
        inputMode="decimal"
        value={isAutoOrNone ? '' : localNumber}
        onChange={handleNumberChange}
        placeholder={isAutoOrNone ? localUnit : placeholder}
        disabled={disabled || isAutoOrNone}
        className={cn(
          'h-7 text-xs w-14 px-2',
          isAutoOrNone && 'bg-muted'
        )}
        step={step}
      />
      <Select
        value={localUnit}
        onValueChange={(v) => handleUnitChange(v as CSSUnit)}
        disabled={disabled}
      >
        <SelectTrigger className="h-7 w-12 text-xs px-1.5">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {units.map((unit) => (
            <SelectItem key={unit || 'unitless'} value={unit} className="text-xs">
              {unit || '—'}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
