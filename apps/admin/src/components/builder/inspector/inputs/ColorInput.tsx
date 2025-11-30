// PagePress v0.0.5 - 2025-11-30
// Color input component with color picker

import { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

interface ColorInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

/**
 * Color input with picker popover
 */
export function ColorInput({ value, onChange, label }: ColorInputProps) {
  const [open, setOpen] = useState(false);

  // Handle transparent/empty values
  const displayValue = value || 'transparent';
  const isTransparent = !value || value === 'transparent';

  return (
    <div className="flex gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-10 h-10 p-0 border-2"
            style={{
              backgroundColor: isTransparent ? 'transparent' : value,
              backgroundImage: isTransparent
                ? 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)'
                : 'none',
              backgroundSize: '8px 8px',
              backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
            }}
            aria-label={label || 'Pick color'}
          />
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3" align="start">
          <div className="space-y-3">
            <HexColorPicker
              color={isTransparent ? '#ffffff' : value}
              onChange={onChange}
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onChange('transparent');
                  setOpen(false);
                }}
              >
                Transparent
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      <Input
        value={displayValue}
        onChange={(e) => onChange(e.target.value)}
        placeholder="#000000"
        className="flex-1 font-mono text-sm"
      />
    </div>
  );
}
