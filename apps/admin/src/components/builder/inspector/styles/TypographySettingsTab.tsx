// PagePress v0.0.13 - 2025-12-05
// Typography Settings Tab Component with tracked inputs and external API

import { useCallback, useState, useImperativeHandle, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { HexColorPicker } from 'react-colorful';
import { Plus, X, AlignLeft, AlignCenter, AlignRight, AlignJustify, RotateCcw, Copy } from 'lucide-react';
import { toast } from 'sonner';
import type { TypographySettings, TextShadow } from '../styles/types';

interface TypographySettingsTabProps {
  value: Partial<TypographySettings>;
  onChange: (value: Partial<TypographySettings>) => void;
  className?: string;
  /** Optional: track which fields have been modified from defaults */
  modifiedFields?: Set<string>;
  /** Optional: reset callback for individual fields */
  onResetField?: (fieldName: string, defaultValue: unknown) => void;
}

/**
 * External API for controlling typography settings from outside
 */
export interface TypographySettingsRef {
  /** Get current typography values */
  getValue: () => Partial<TypographySettings>;
  /** Set typography values programmatically */
  setValue: (value: Partial<TypographySettings>) => void;
  /** Update a single property */
  setProperty: <K extends keyof TypographySettings>(key: K, value: TypographySettings[K]) => void;
  /** Reset all to defaults */
  reset: () => void;
  /** Get default settings */
  getDefaults: () => TypographySettings;
}

/**
 * Default typography settings
 */
export const defaultTypographySettings: TypographySettings = {
  fontFamily: 'inherit',
  fontSize: '',
  fontWeight: 'normal',
  fontStyle: 'normal',
  lineHeight: '',
  letterSpacing: '',
  wordSpacing: '',
  textAlign: 'left',
  textTransform: 'none',
  textDecoration: 'none',
  color: '',
};

/**
 * Font weight options
 */
const fontWeightOptions: { value: TypographySettings['fontWeight']; label: string }[] = [
  { value: 100, label: 'Thin (100)' },
  { value: 200, label: 'Extra Light (200)' },
  { value: 300, label: 'Light (300)' },
  { value: 400, label: 'Regular (400)' },
  { value: 500, label: 'Medium (500)' },
  { value: 600, label: 'Semi Bold (600)' },
  { value: 700, label: 'Bold (700)' },
  { value: 800, label: 'Extra Bold (800)' },
  { value: 900, label: 'Black (900)' },
];

/**
 * Font style options
 */
const fontStyleOptions: { value: TypographySettings['fontStyle']; label: string }[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'italic', label: 'Italic' },
  { value: 'oblique', label: 'Oblique' },
];

/**
 * Text transform options
 */
const textTransformOptions: { value: TypographySettings['textTransform']; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'uppercase', label: 'UPPERCASE' },
  { value: 'lowercase', label: 'lowercase' },
  { value: 'capitalize', label: 'Capitalize' },
];

/**
 * Text decoration options
 */
const textDecorationOptions: { value: TypographySettings['textDecoration']; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'underline', label: 'Underline' },
  { value: 'overline', label: 'Overline' },
  { value: 'line-through', label: 'Strikethrough' },
];

/**
 * Text decoration style options
 */
const textDecorationStyleOptions: { value: NonNullable<TypographySettings['textDecorationStyle']>; label: string }[] = [
  { value: 'solid', label: 'Solid' },
  { value: 'double', label: 'Double' },
  { value: 'dotted', label: 'Dotted' },
  { value: 'dashed', label: 'Dashed' },
  { value: 'wavy', label: 'Wavy' },
];

/**
 * Common font families
 */
const commonFontFamilies = [
  { value: 'inherit', label: 'Inherit' },
  { value: 'system-ui, sans-serif', label: 'System UI' },
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: 'Helvetica, sans-serif', label: 'Helvetica' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: '"Times New Roman", serif', label: 'Times New Roman' },
  { value: 'Verdana, sans-serif', label: 'Verdana' },
  { value: 'monospace', label: 'Monospace' },
  { value: '"Courier New", monospace', label: 'Courier New' },
];

/**
 * Generate unique ID for text shadow
 */
function generateShadowId(): string {
  return `shadow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Field wrapper with modification indicator and context menu
 */
function TrackedField({
  fieldName,
  defaultValue,
  currentValue,
  isModified,
  onReset,
  children,
}: {
  fieldName: string;
  defaultValue: unknown;
  currentValue: unknown;
  isModified?: boolean;
  onReset?: (fieldName: string, defaultValue: unknown) => void;
  children: React.ReactNode;
}) {
  const handleReset = useCallback(() => {
    onReset?.(fieldName, defaultValue);
    toast.success(`Reset ${fieldName} to default`);
  }, [onReset, fieldName, defaultValue]);

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
        <div className="relative">
          {/* Blue dot indicator for modified fields */}
          {isModified && (
            <div 
              className="absolute -left-2.5 top-3 w-2 h-2 rounded-full bg-blue-500 z-10"
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
 * Typography Settings Tab - Font, spacing, alignment, text shadow
 * Supports external API via ref for programmatic control
 * Supports modification tracking with blue dot indicators
 */
export const TypographySettingsTab = forwardRef<TypographySettingsRef, TypographySettingsTabProps>(
  function TypographySettingsTab({ value, onChange, className, modifiedFields, onResetField }, ref) {
  const [customFontFamily, setCustomFontFamily] = useState('');

  // Check if a field is modified
  const isModified = useCallback((fieldName: string): boolean => {
    if (modifiedFields) {
      return modifiedFields.has(fieldName);
    }
    // Fallback: compare with default
    const key = fieldName as keyof TypographySettings;
    return value[key] !== defaultTypographySettings[key] && value[key] !== undefined && value[key] !== '';
  }, [modifiedFields, value]);

  // Handle field reset
  const handleResetField = useCallback((fieldName: string, defaultValue: unknown) => {
    if (onResetField) {
      onResetField(fieldName, defaultValue);
    } else {
      // Default behavior: reset to default value
      const key = fieldName as keyof TypographySettings;
      onChange({ ...value, [key]: defaultValue });
    }
  }, [onResetField, onChange, value]);

  // Update a single property
  const handleChange = useCallback(
    <K extends keyof TypographySettings>(key: K, newValue: TypographySettings[K]) => {
      onChange({ ...value, [key]: newValue });
    },
    [value, onChange]
  );

  // Expose API via ref
  useImperativeHandle(ref, () => ({
    getValue: () => value,
    setValue: (newValue: Partial<TypographySettings>) => onChange(newValue),
    setProperty: <K extends keyof TypographySettings>(key: K, val: TypographySettings[K]) => {
      onChange({ ...value, [key]: val });
    },
    reset: () => onChange({ ...defaultTypographySettings }),
    getDefaults: () => defaultTypographySettings,
  }), [value, onChange]);

  // Add text shadow
  const handleAddShadow = useCallback(() => {
    const newShadow: TextShadow = {
      id: generateShadowId(),
      x: 0,
      y: 2,
      blur: 4,
      color: 'rgba(0, 0, 0, 0.25)',
    };
    onChange({
      ...value,
      textShadow: [...(value.textShadow || []), newShadow],
    });
  }, [value, onChange]);

  // Remove text shadow
  const handleRemoveShadow = useCallback(
    (id: string) => {
      onChange({
        ...value,
        textShadow: (value.textShadow || []).filter((s) => s.id !== id),
      });
    },
    [value, onChange]
  );

  // Update text shadow
  const handleUpdateShadow = useCallback(
    (id: string, updates: Partial<TextShadow>) => {
      onChange({
        ...value,
        textShadow: (value.textShadow || []).map((s) =>
          s.id === id ? { ...s, ...updates } : s
        ),
      });
    },
    [value, onChange]
  );

  return (
    <div className={cn('space-y-4', className)}>
      <Accordion type="multiple" defaultValue={['font', 'spacing', 'alignment']} className="space-y-1">
        {/* Font */}
        <AccordionItem value="font" className="border rounded-md px-3">
          <AccordionTrigger className="py-2 text-sm font-medium hover:no-underline">
            Font
          </AccordionTrigger>
          <AccordionContent className="pb-3 space-y-3">
            {/* Font Family */}
            <TrackedField
              fieldName="fontFamily"
              defaultValue={defaultTypographySettings.fontFamily}
              currentValue={value.fontFamily}
              isModified={isModified('fontFamily')}
              onReset={handleResetField}
            >
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Font Family</Label>
                <Select
                  value={value.fontFamily || 'inherit'}
                  onValueChange={(val) => handleChange('fontFamily', val)}
                >
                  <SelectTrigger className={cn('h-8', isModified('fontFamily') && 'border-blue-400')}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {commonFontFamilies.map((font) => (
                      <SelectItem key={font.value} value={font.value}>
                        <span style={{ fontFamily: font.value }}>{font.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Input
                    value={customFontFamily}
                    onChange={(e) => setCustomFontFamily(e.target.value)}
                    placeholder="Custom font family..."
                    className="h-8 text-xs flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => {
                      if (customFontFamily) {
                        handleChange('fontFamily', customFontFamily);
                        setCustomFontFamily('');
                      }
                    }}
                  >
                    Apply
                  </Button>
                </div>
              </div>
            </TrackedField>

            {/* Font Size */}
            <TrackedField
              fieldName="fontSize"
              defaultValue={defaultTypographySettings.fontSize}
              currentValue={value.fontSize}
              isModified={isModified('fontSize')}
              onReset={handleResetField}
            >
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Font Size</Label>
                <Input
                  value={value.fontSize || ''}
                  onChange={(e) => handleChange('fontSize', e.target.value)}
                  placeholder="16px, 1rem, etc."
                  className={cn('h-8 text-xs', isModified('fontSize') && 'border-blue-400')}
                />
              </div>
            </TrackedField>

            {/* Font Weight */}
            <TrackedField
              fieldName="fontWeight"
              defaultValue={defaultTypographySettings.fontWeight}
              currentValue={value.fontWeight}
              isModified={isModified('fontWeight')}
              onReset={handleResetField}
            >
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Font Weight</Label>
                <Select
                  value={String(value.fontWeight || 'normal')}
                  onValueChange={(val) => {
                    const numVal = parseInt(val);
                    handleChange('fontWeight', isNaN(numVal) ? (val as 'normal' | 'bold') : numVal as TypographySettings['fontWeight']);
                  }}
                >
                  <SelectTrigger className={cn('h-8', isModified('fontWeight') && 'border-blue-400')}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fontWeightOptions.map((weight) => (
                      <SelectItem key={weight.value} value={String(weight.value)}>
                        {weight.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TrackedField>

            {/* Font Style */}
            <TrackedField
              fieldName="fontStyle"
              defaultValue={defaultTypographySettings.fontStyle}
              currentValue={value.fontStyle}
              isModified={isModified('fontStyle')}
              onReset={handleResetField}
            >
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Font Style</Label>
                <Select
                  value={value.fontStyle || 'normal'}
                  onValueChange={(val) => handleChange('fontStyle', val as TypographySettings['fontStyle'])}
                >
                  <SelectTrigger className={cn('h-8', isModified('fontStyle') && 'border-blue-400')}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fontStyleOptions.map((style) => (
                      <SelectItem key={style.value} value={style.value}>
                        {style.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TrackedField>

            {/* Color */}
            <TrackedField
              fieldName="color"
              defaultValue={defaultTypographySettings.color}
              currentValue={value.color}
              isModified={isModified('color')}
              onReset={handleResetField}
            >
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Color</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button className={cn(
                      'w-full h-8 rounded border flex items-center gap-2 px-2',
                      isModified('color') && 'border-blue-400'
                    )}>
                      <div
                        className="w-5 h-5 rounded border"
                        style={{ backgroundColor: value.color || 'inherit' }}
                      />
                      <span className="text-xs flex-1 text-left">{value.color || 'Inherit'}</span>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-3" align="start">
                    <HexColorPicker
                      color={value.color || '#000000'}
                      onChange={(color) => handleChange('color', color)}
                    />
                    <Input
                      value={value.color || ''}
                      onChange={(e) => handleChange('color', e.target.value)}
                      placeholder="inherit"
                      className="mt-2 h-8 text-xs"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </TrackedField>
          </AccordionContent>
        </AccordionItem>

        {/* Spacing */}
        <AccordionItem value="spacing" className="border rounded-md px-3">
          <AccordionTrigger className="py-2 text-sm font-medium hover:no-underline">
            Spacing
          </AccordionTrigger>
          <AccordionContent className="pb-3 space-y-3">
            {/* Line Height */}
            <TrackedField
              fieldName="lineHeight"
              defaultValue={defaultTypographySettings.lineHeight}
              currentValue={value.lineHeight}
              isModified={isModified('lineHeight')}
              onReset={handleResetField}
            >
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Line Height</Label>
                <Input
                  value={value.lineHeight || ''}
                  onChange={(e) => handleChange('lineHeight', e.target.value)}
                  placeholder="1.5, 24px, etc."
                  className={cn('h-8 text-xs', isModified('lineHeight') && 'border-blue-400')}
                />
              </div>
            </TrackedField>

            {/* Letter Spacing */}
            <TrackedField
              fieldName="letterSpacing"
              defaultValue={defaultTypographySettings.letterSpacing}
              currentValue={value.letterSpacing}
              isModified={isModified('letterSpacing')}
              onReset={handleResetField}
            >
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Letter Spacing</Label>
                <Input
                  value={value.letterSpacing || ''}
                  onChange={(e) => handleChange('letterSpacing', e.target.value)}
                  placeholder="0px, 0.1em, etc."
                  className={cn('h-8 text-xs', isModified('letterSpacing') && 'border-blue-400')}
                />
              </div>
            </TrackedField>

            {/* Word Spacing */}
            <TrackedField
              fieldName="wordSpacing"
              defaultValue={defaultTypographySettings.wordSpacing}
              currentValue={value.wordSpacing}
              isModified={isModified('wordSpacing')}
              onReset={handleResetField}
            >
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Word Spacing</Label>
                <Input
                  value={value.wordSpacing || ''}
                  onChange={(e) => handleChange('wordSpacing', e.target.value)}
                  placeholder="normal, 2px, etc."
                  className={cn('h-8 text-xs', isModified('wordSpacing') && 'border-blue-400')}
                />
              </div>
            </TrackedField>
          </AccordionContent>
        </AccordionItem>

        {/* Alignment & Transform */}
        <AccordionItem value="alignment" className="border rounded-md px-3">
          <AccordionTrigger className="py-2 text-sm font-medium hover:no-underline">
            Alignment & Transform
          </AccordionTrigger>
          <AccordionContent className="pb-3 space-y-3">
            {/* Text Align */}
            <TrackedField
              fieldName="textAlign"
              defaultValue={defaultTypographySettings.textAlign}
              currentValue={value.textAlign}
              isModified={isModified('textAlign')}
              onReset={handleResetField}
            >
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Text Align</Label>
                <div className="flex gap-1">
                  {[
                    { value: 'left', icon: AlignLeft },
                    { value: 'center', icon: AlignCenter },
                    { value: 'right', icon: AlignRight },
                    { value: 'justify', icon: AlignJustify },
                  ].map((align) => (
                    <Button
                      key={align.value}
                      variant={value.textAlign === align.value ? 'default' : 'outline'}
                      size="sm"
                      className={cn(
                        'h-8 flex-1',
                        value.textAlign === align.value && isModified('textAlign') && 'ring-1 ring-blue-400'
                      )}
                      onClick={() => handleChange('textAlign', align.value as TypographySettings['textAlign'])}
                    >
                      <align.icon className="h-4 w-4" />
                    </Button>
                  ))}
                </div>
              </div>
            </TrackedField>

            {/* Text Transform */}
            <TrackedField
              fieldName="textTransform"
              defaultValue={defaultTypographySettings.textTransform}
              currentValue={value.textTransform}
              isModified={isModified('textTransform')}
              onReset={handleResetField}
            >
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Text Transform</Label>
                <Select
                  value={value.textTransform || 'none'}
                  onValueChange={(val) => handleChange('textTransform', val as TypographySettings['textTransform'])}
                >
                  <SelectTrigger className={cn('h-8', isModified('textTransform') && 'border-blue-400')}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {textTransformOptions.map((transform) => (
                      <SelectItem key={transform.value} value={transform.value}>
                        {transform.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TrackedField>
          </AccordionContent>
        </AccordionItem>

        {/* Decoration */}
        <AccordionItem value="decoration" className="border rounded-md px-3">
          <AccordionTrigger className="py-2 text-sm font-medium hover:no-underline">
            Decoration
          </AccordionTrigger>
          <AccordionContent className="pb-3 space-y-3">
            {/* Text Decoration */}
            <TrackedField
              fieldName="textDecoration"
              defaultValue={defaultTypographySettings.textDecoration}
              currentValue={value.textDecoration}
              isModified={isModified('textDecoration')}
              onReset={handleResetField}
            >
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Text Decoration</Label>
                <Select
                  value={value.textDecoration || 'none'}
                  onValueChange={(val) => handleChange('textDecoration', val as TypographySettings['textDecoration'])}
                >
                  <SelectTrigger className={cn('h-8', isModified('textDecoration') && 'border-blue-400')}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {textDecorationOptions.map((decoration) => (
                      <SelectItem key={decoration.value} value={decoration.value}>
                        {decoration.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TrackedField>

            {value.textDecoration && value.textDecoration !== 'none' && (
              <>
                {/* Decoration Style */}
                <TrackedField
                  fieldName="textDecorationStyle"
                  defaultValue="solid"
                  currentValue={value.textDecorationStyle}
                  isModified={isModified('textDecorationStyle')}
                  onReset={handleResetField}
                >
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Decoration Style</Label>
                    <Select
                      value={value.textDecorationStyle || 'solid'}
                      onValueChange={(val) => handleChange('textDecorationStyle', val as TypographySettings['textDecorationStyle'])}
                    >
                      <SelectTrigger className={cn('h-8', isModified('textDecorationStyle') && 'border-blue-400')}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {textDecorationStyleOptions.map((style) => (
                          <SelectItem key={style.value} value={style.value}>
                            {style.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </TrackedField>

                {/* Decoration Color */}
                <TrackedField
                  fieldName="textDecorationColor"
                  defaultValue=""
                  currentValue={value.textDecorationColor}
                  isModified={isModified('textDecorationColor')}
                  onReset={handleResetField}
                >
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Decoration Color</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className={cn(
                          'w-full h-8 rounded border flex items-center gap-2 px-2',
                          isModified('textDecorationColor') && 'border-blue-400'
                        )}>
                          <div
                            className="w-5 h-5 rounded border"
                            style={{ backgroundColor: value.textDecorationColor || 'currentColor' }}
                          />
                          <span className="text-xs flex-1 text-left">
                            {value.textDecorationColor || 'Inherit'}
                          </span>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-3" align="start">
                        <HexColorPicker
                          color={value.textDecorationColor || '#000000'}
                          onChange={(color) => handleChange('textDecorationColor', color)}
                        />
                        <Input
                          value={value.textDecorationColor || ''}
                          onChange={(e) => handleChange('textDecorationColor', e.target.value)}
                          placeholder="inherit"
                          className="mt-2 h-8 text-xs"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </TrackedField>
              </>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Text Shadow */}
        <AccordionItem value="shadow" className="border rounded-md px-3">
          <AccordionTrigger className="py-2 text-sm font-medium hover:no-underline">
            Text Shadow
          </AccordionTrigger>
          <AccordionContent className="pb-3 space-y-3">
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

            {(!value.textShadow || value.textShadow.length === 0) ? (
              <div className="text-xs text-muted-foreground text-center py-4 border rounded-md border-dashed">
                No text shadows
              </div>
            ) : (
              <div className="space-y-2">
                {value.textShadow.map((shadow, index) => (
                  <div key={shadow.id} className="border rounded-md p-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">Shadow {index + 1}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveShadow(shadow.id)}
                        className="h-6 w-6 p-0 text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Color */}
                    <div className="flex items-center gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            className="w-6 h-6 rounded border shadow-sm"
                            style={{ backgroundColor: shadow.color }}
                          />
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-3" align="start">
                          <HexColorPicker
                            color={shadow.color}
                            onChange={(color) => handleUpdateShadow(shadow.id, { color })}
                          />
                          <Input
                            value={shadow.color}
                            onChange={(e) => handleUpdateShadow(shadow.id, { color: e.target.value })}
                            placeholder="rgba(0,0,0,0.25)"
                            className="mt-2 h-8 text-xs"
                          />
                        </PopoverContent>
                      </Popover>
                      <span className="text-xs text-muted-foreground flex-1">{shadow.color}</span>
                    </div>

                    {/* X, Y, Blur */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground">X</Label>
                        <div className="flex items-center gap-1">
                          <Slider
                            value={[shadow.x]}
                            min={-20}
                            max={20}
                            step={1}
                            onValueChange={([val]) => handleUpdateShadow(shadow.id, { x: val })}
                            className="flex-1"
                          />
                          <span className="text-[10px] w-6 text-right">{shadow.x}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground">Y</Label>
                        <div className="flex items-center gap-1">
                          <Slider
                            value={[shadow.y]}
                            min={-20}
                            max={20}
                            step={1}
                            onValueChange={([val]) => handleUpdateShadow(shadow.id, { y: val })}
                            className="flex-1"
                          />
                          <span className="text-[10px] w-6 text-right">{shadow.y}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground">Blur</Label>
                        <div className="flex items-center gap-1">
                          <Slider
                            value={[shadow.blur]}
                            min={0}
                            max={30}
                            step={1}
                            onValueChange={([val]) => handleUpdateShadow(shadow.id, { blur: val })}
                            className="flex-1"
                          />
                          <span className="text-[10px] w-6 text-right">{shadow.blur}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
});
