// PagePress v0.0.10 - 2025-12-04
// Global colors management tab

import { useState, useCallback } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useGlobalSettingsStore } from '../globalSettingsStore';
import type { GlobalColor } from '../types';

const CATEGORIES = [
  { id: 'primary' as const, label: 'Primary Colors' },
  { id: 'secondary' as const, label: 'Secondary Colors' },
  { id: 'accent' as const, label: 'Accent Colors' },
  { id: 'neutral' as const, label: 'Neutral Colors' },
  { id: 'custom' as const, label: 'Custom Colors' },
];

/**
 * Colors tab for global settings
 * Allows managing global color palette
 */
export function ColorsTab() {
  const { themeSettings, addColor, updateColor, removeColor } =
    useGlobalSettingsStore();
  const colors = themeSettings?.colors || [];

  const handleAddColor = useCallback((category: GlobalColor['category']) => {
    const newColor: GlobalColor = {
      id: `color-${crypto.randomUUID()}`,
      name: 'New Color',
      value: '#3b82f6',
      category,
    };
    addColor(newColor);
  }, [addColor]);

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Define your global color palette. Use these colors throughout your site
        for consistent branding.
      </p>

      <Accordion type="multiple" defaultValue={['primary', 'secondary']}>
        {CATEGORIES.map((category) => {
          const categoryColors = colors.filter(
            (c) => c.category === category.id
          );

          return (
            <AccordionItem key={category.id} value={category.id}>
              <AccordionTrigger className="text-sm py-2">
                {category.label} ({categoryColors.length})
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pt-2">
                  {categoryColors.map((color) => (
                    <ColorRow
                      key={color.id}
                      color={color}
                      onUpdate={(updates) => updateColor(color.id, updates)}
                      onRemove={() => removeColor(color.id)}
                    />
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full h-8"
                    onClick={() => handleAddColor(category.id)}
                  >
                    <Plus className="h-3 w-3 mr-1" /> Add Color
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}

/**
 * Individual color row component
 */
interface ColorRowProps {
  color: GlobalColor;
  onUpdate: (updates: Partial<GlobalColor>) => void;
  onRemove: () => void;
}

function ColorRow({ color, onUpdate, onRemove }: ColorRowProps) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 group">
      <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Color swatch with picker */}
      <Popover>
        <PopoverTrigger asChild>
          <button
            className="w-8 h-8 rounded-md border shadow-sm hover:ring-2 hover:ring-primary/50 transition-all"
            style={{ backgroundColor: color.value }}
          />
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3" align="start">
          <HexColorPicker
            color={color.value}
            onChange={(value) => onUpdate({ value })}
          />
          <div className="mt-2 flex gap-2">
            <Input
              className="h-8 text-xs font-mono"
              value={color.value}
              onChange={(e) => onUpdate({ value: e.target.value })}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-2"
            onClick={() => onUpdate({ value: 'transparent' })}
          >
            Transparent
          </Button>
        </PopoverContent>
      </Popover>

      {/* Editable name */}
      {isEditing ? (
        <Input
          className="flex-1 h-7 text-sm"
          value={color.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          onBlur={() => setIsEditing(false)}
          onKeyDown={(e) => e.key === 'Enter' && setIsEditing(false)}
          autoFocus
        />
      ) : (
        <span
          className="flex-1 text-sm cursor-pointer truncate"
          onDoubleClick={() => setIsEditing(true)}
        >
          {color.name}
        </span>
      )}

      {/* Hex value display */}
      <code className="text-xs text-muted-foreground font-mono hidden sm:block">
        {color.value}
      </code>

      {/* Delete button */}
      <Button
        variant="ghost"
        size="sm"
        className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={onRemove}
      >
        <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
      </Button>
    </div>
  );
}
