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
import { HexColorPicker } from 'react-colorful';
import { Plus, X, AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react';
import { SettingsFieldWrapper } from '../SettingsFieldWrapper';
import type { TypographySettings, TextShadow } from '../styles/types';
import type { StyleSourceResult } from '../sidebar/types';

interface TypographySettingsTabProps {
  value: Partial<TypographySettings>;
  onChange: (value: Partial<TypographySettings>) => void;
  getStyleSource?: (path: string) => StyleSourceResult;
  className?: string;
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
 * Typography Settings Tab - Font, spacing, alignment, text shadow
 * Supports external API via ref for programmatic control
 * Supports modification tracking with blue dot indicators
 */
export const TypographySettingsTab = forwardRef<TypographySettingsRef, TypographySettingsTabProps>(
  function TypographySettingsTab({ value, onChange, getStyleSource, className, onResetField }, ref) {
    const [customFontFamily, setCustomFontFamily] = useState('');

    // Helper to get source flags
    const getSourceFlags = useCallback((path: string) => {
      if (!getStyleSource) return {};
      const { source, isResponsive } = getStyleSource(path);
      return {
        isModified: source === 'user',
        isClassInherited: source === 'class',
        isGlobalInherited: source === 'global',
        isResponsiveOverride: isResponsive,
      };
    }, [getStyleSource]);

    // Handle field reset
    const handleResetField = useCallback((fieldName: string, defaultValue: unknown) => {
      if (onResetField) {
        onResetField(fieldName, defaultValue);
      } else {
        // Default behavior: reset to undefined to remove the override
        const key = fieldName as keyof TypographySettings;
        // We explicitly set to undefined to remove the key from the object
        // This allows fallback to global settings or defaults
        onChange({ ...value, [key]: undefined });
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
              <SettingsFieldWrapper
                fieldName="fontFamily"
                {...getSourceFlags('typography.fontFamily')}
                defaultValue={defaultTypographySettings.fontFamily}
                currentValue={value.fontFamily}
                onReset={handleResetField}
                label="Font Family"
                orientation="vertical"
              >
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Font Family</Label>
                  <Select
                    value={value.fontFamily || 'inherit'}
                    onValueChange={(val) => handleChange('fontFamily', val)}
                  >
                    <SelectTrigger className="h-8">
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
              </SettingsFieldWrapper>

              {/* Font Size */}
              <SettingsFieldWrapper
                fieldName="fontSize"
                {...getSourceFlags('typography.fontSize')}
                defaultValue={defaultTypographySettings.fontSize}
                currentValue={value.fontSize}
                onReset={handleResetField}
                label="Font Size"
                orientation="vertical"
              >
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Font Size</Label>
                  <Input
                    value={value.fontSize || ''}
                    onChange={(e) => handleChange('fontSize', e.target.value)}
                    placeholder="16px, 1rem, etc."
                    className="h-8 text-xs"
                  />
                </div>
              </SettingsFieldWrapper>

              {/* Font Weight */}
              <SettingsFieldWrapper
                fieldName="fontWeight"
                {...getSourceFlags('typography.fontWeight')}
                defaultValue={defaultTypographySettings.fontWeight}
                currentValue={value.fontWeight}
                onReset={handleResetField}
                label="Font Weight"
                orientation="vertical"
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
                    <SelectTrigger className="h-8">
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
              </SettingsFieldWrapper>

              {/* Font Style */}
              <SettingsFieldWrapper
                fieldName="fontStyle"
                {...getSourceFlags('typography.fontStyle')}
                defaultValue={defaultTypographySettings.fontStyle}
                currentValue={value.fontStyle}
                onReset={handleResetField}
                label="Font Style"
                orientation="vertical"
              >
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Font Style</Label>
                  <Select
                    value={value.fontStyle || 'normal'}
                    onValueChange={(val) => handleChange('fontStyle', val as TypographySettings['fontStyle'])}
                  >
                    <SelectTrigger className="h-8">
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
              </SettingsFieldWrapper>

              {/* Color */}
              <SettingsFieldWrapper
                fieldName="color"
                {...getSourceFlags('typography.color')}
                defaultValue={defaultTypographySettings.color}
                currentValue={value.color}
                onReset={handleResetField}
                label="Color"
                orientation="vertical"
              >
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Color</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="w-full h-8 rounded border flex items-center gap-2 px-2">
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
              </SettingsFieldWrapper>
            </AccordionContent>
          </AccordionItem>

          {/* Spacing */}
          <AccordionItem value="spacing" className="border rounded-md px-3">
            <AccordionTrigger className="py-2 text-sm font-medium hover:no-underline">
              Spacing
            </AccordionTrigger>
            <AccordionContent className="pb-3 space-y-3">
              {/* Line Height */}
              <SettingsFieldWrapper
                fieldName="lineHeight"
                {...getSourceFlags('typography.lineHeight')}
                defaultValue={defaultTypographySettings.lineHeight}
                currentValue={value.lineHeight}
                onReset={handleResetField}
                label="Line Height"
                orientation="vertical"
              >
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Line Height</Label>
                  <Input
                    value={value.lineHeight || ''}
                    onChange={(e) => handleChange('lineHeight', e.target.value)}
                    placeholder="1.5, 24px, etc."
                    className="h-8 text-xs"
                  />
                </div>
              </SettingsFieldWrapper>

              {/* Letter Spacing */}
              <SettingsFieldWrapper
                fieldName="letterSpacing"
                {...getSourceFlags('typography.letterSpacing')}
                defaultValue={defaultTypographySettings.letterSpacing}
                currentValue={value.letterSpacing}
                onReset={handleResetField}
                label="Letter Spacing"
                orientation="vertical"
              >
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Letter Spacing</Label>
                  <Input
                    value={value.letterSpacing || ''}
                    onChange={(e) => handleChange('letterSpacing', e.target.value)}
                    placeholder="0px, 0.1em, etc."
                    className="h-8 text-xs"
                  />
                </div>
              </SettingsFieldWrapper>

              {/* Word Spacing */}
              <SettingsFieldWrapper
                fieldName="wordSpacing"
                {...getSourceFlags('typography.wordSpacing')}
                defaultValue={defaultTypographySettings.wordSpacing}
                currentValue={value.wordSpacing}
                onReset={handleResetField}
                label="Word Spacing"
                orientation="vertical"
              >
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Word Spacing</Label>
                  <Input
                    value={value.wordSpacing || ''}
                    onChange={(e) => handleChange('wordSpacing', e.target.value)}
                    placeholder="normal, 2px, etc."
                    className="h-8 text-xs"
                  />
                </div>
              </SettingsFieldWrapper>
            </AccordionContent>
          </AccordionItem>

          {/* Alignment & Transform */}
          <AccordionItem value="alignment" className="border rounded-md px-3">
            <AccordionTrigger className="py-2 text-sm font-medium hover:no-underline">
              Alignment & Transform
            </AccordionTrigger>
            <AccordionContent className="pb-3 space-y-3">
              {/* Text Align */}
              <SettingsFieldWrapper
                fieldName="textAlign"
                {...getSourceFlags('typography.textAlign')}
                defaultValue={defaultTypographySettings.textAlign}
                currentValue={value.textAlign}
                onReset={handleResetField}
                label="Text Align"
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
                        className="h-8 flex-1"
                        onClick={() => handleChange('textAlign', align.value as TypographySettings['textAlign'])}
                      >
                        <align.icon className="h-4 w-4" />
                      </Button>
                    ))}
                  </div>
                </div>
              </SettingsFieldWrapper>

              {/* Text Transform */}
              <SettingsFieldWrapper
                fieldName="textTransform"
                {...getSourceFlags('typography.textTransform')}
                defaultValue={defaultTypographySettings.textTransform}
                currentValue={value.textTransform}
                onReset={handleResetField}
                label="Text Transform"
              >
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Text Transform</Label>
                  <Select
                    value={value.textTransform || 'none'}
                    onValueChange={(val) => handleChange('textTransform', val as TypographySettings['textTransform'])}
                  >
                    <SelectTrigger className="h-8">
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
              </SettingsFieldWrapper>
            </AccordionContent>
          </AccordionItem>

          {/* Decoration */}
          <AccordionItem value="decoration" className="border rounded-md px-3">
            <AccordionTrigger className="py-2 text-sm font-medium hover:no-underline">
              Decoration
            </AccordionTrigger>
            <AccordionContent className="pb-3 space-y-3">
              {/* Text Decoration */}
              <SettingsFieldWrapper
                fieldName="textDecoration"
                {...getSourceFlags('typography.textDecoration')}
                defaultValue={defaultTypographySettings.textDecoration}
                currentValue={value.textDecoration}
                onReset={handleResetField}
                label="Text Decoration"
              >
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Text Decoration</Label>
                  <Select
                    value={value.textDecoration || 'none'}
                    onValueChange={(val) => handleChange('textDecoration', val as TypographySettings['textDecoration'])}
                  >
                    <SelectTrigger className="h-8">
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
              </SettingsFieldWrapper>

              {value.textDecoration && value.textDecoration !== 'none' && (
                <>
                  {/* Decoration Style */}
                  <SettingsFieldWrapper
                    fieldName="textDecorationStyle"
                    {...getSourceFlags('typography.textDecorationStyle')}
                    defaultValue="solid"
                    currentValue={value.textDecorationStyle}
                    onReset={handleResetField}
                    label="Decoration Style"
                  >
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Decoration Style</Label>
                      <Select
                        value={value.textDecorationStyle || 'solid'}
                        onValueChange={(val) => handleChange('textDecorationStyle', val as TypographySettings['textDecorationStyle'])}
                      >
                        <SelectTrigger className="h-8">
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
                  </SettingsFieldWrapper>

                  {/* Decoration Color */}
                  <SettingsFieldWrapper
                    fieldName="textDecorationColor"
                    {...getSourceFlags('typography.textDecorationColor')}
                    defaultValue=""
                    currentValue={value.textDecorationColor}
                    onReset={handleResetField}
                    label="Decoration Color"
                  >
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Decoration Color</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <button className="w-full h-8 rounded border flex items-center gap-2 px-2">
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
                  </SettingsFieldWrapper>
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
