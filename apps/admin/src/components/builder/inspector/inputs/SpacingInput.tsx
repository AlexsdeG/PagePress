// PagePress v0.0.5 - 2025-11-30
// Spacing input component for padding/margin

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { SpacingValue } from '../../types';

interface SpacingInputProps {
  value: SpacingValue;
  onChange: (value: SpacingValue) => void;
}

/**
 * Spacing input with linked/unlinked mode
 */
export function SpacingInput({ value, onChange }: SpacingInputProps) {
  const [linked, setLinked] = useState(
    value.top === value.right && value.right === value.bottom && value.bottom === value.left
  );

  const handleChange = (side: keyof SpacingValue, newValue: number) => {
    if (linked) {
      // Update all sides when linked
      onChange({
        top: newValue,
        right: newValue,
        bottom: newValue,
        left: newValue,
      });
    } else {
      // Update only the specified side
      onChange({
        ...value,
        [side]: newValue,
      });
    }
  };

  const toggleLinked = () => {
    if (!linked) {
      // When linking, set all to the top value
      onChange({
        top: value.top,
        right: value.top,
        bottom: value.top,
        left: value.top,
      });
    }
    setLinked(!linked);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Button
          variant={linked ? 'secondary' : 'outline'}
          size="sm"
          onClick={toggleLinked}
          className="h-7 text-xs"
        >
          {linked ? '🔗 Linked' : '🔓 Unlinked'}
        </Button>
      </div>

      {linked ? (
        // Linked mode: single input
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground w-12">All</span>
          <Input
            type="number"
            value={value.top}
            onChange={(e) => handleChange('top', Number(e.target.value))}
            className="h-8"
            min={0}
            max={200}
          />
          <span className="text-xs text-muted-foreground">px</span>
        </div>
      ) : (
        // Unlinked mode: four inputs
        <div className="grid grid-cols-2 gap-2">
          {/* Top */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground w-8">T</span>
            <Input
              type="number"
              value={value.top}
              onChange={(e) => handleChange('top', Number(e.target.value))}
              className="h-7 text-sm"
              min={0}
              max={200}
            />
          </div>
          {/* Right */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground w-8">R</span>
            <Input
              type="number"
              value={value.right}
              onChange={(e) => handleChange('right', Number(e.target.value))}
              className="h-7 text-sm"
              min={0}
              max={200}
            />
          </div>
          {/* Bottom */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground w-8">B</span>
            <Input
              type="number"
              value={value.bottom}
              onChange={(e) => handleChange('bottom', Number(e.target.value))}
              className="h-7 text-sm"
              min={0}
              max={200}
            />
          </div>
          {/* Left */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground w-8">L</span>
            <Input
              type="number"
              value={value.left}
              onChange={(e) => handleChange('left', Number(e.target.value))}
              className="h-7 text-sm"
              min={0}
              max={200}
            />
          </div>
        </div>
      )}
    </div>
  );
}
