// PagePress v0.0.6 - 2025-12-03
// Width input with unit selector

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type WidthUnit = 'auto' | 'px' | '%' | 'vw' | 'vh' | 'rem' | 'fr';

interface WidthInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  allowedUnits?: WidthUnit[];
  min?: number;
  max?: number;
  placeholder?: string;
}

/**
 * Parse a width value into number and unit
 */
function parseWidth(value: string): { num: number; unit: WidthUnit } {
  if (value === 'auto' || !value) {
    return { num: 0, unit: 'auto' };
  }
  
  const match = value.match(/^(-?\d*\.?\d+)(px|%|vw|vh|rem|fr)?$/);
  if (match) {
    return {
      num: parseFloat(match[1]) || 0,
      unit: (match[2] as WidthUnit) || 'px',
    };
  }
  
  return { num: 0, unit: 'px' };
}

/**
 * Width input with combined number and unit selector
 */
export function WidthInput({
  value,
  onChange,
  label,
  allowedUnits = ['auto', 'px', '%', 'vw', 'vh', 'rem'],
  min = 0,
  max = 2000,
  placeholder = '0',
}: WidthInputProps) {
  const { num, unit } = parseWidth(value);

  const handleNumChange = (newNum: number) => {
    if (unit === 'auto') {
      onChange(`${newNum}px`);
    } else {
      onChange(`${newNum}${unit}`);
    }
  };

  const handleUnitChange = (newUnit: WidthUnit) => {
    if (newUnit === 'auto') {
      onChange('auto');
    } else {
      onChange(`${num}${newUnit}`);
    }
  };

  return (
    <div className="space-y-2">
      {label && <Label className="text-xs">{label}</Label>}
      <div className="flex gap-2">
        <Input
          type="number"
          value={unit === 'auto' ? '' : num}
          onChange={(e) => handleNumChange(parseFloat(e.target.value) || 0)}
          placeholder={placeholder}
          className="flex-1 h-8"
          min={min}
          max={max}
          disabled={unit === 'auto'}
        />
        <Select value={unit} onValueChange={(v) => handleUnitChange(v as WidthUnit)}>
          <SelectTrigger className="w-20 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {allowedUnits.map((u) => (
              <SelectItem key={u} value={u}>
                {u}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
