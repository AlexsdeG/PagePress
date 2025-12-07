// PagePress v0.0.7 - 2025-12-04
// Layout Settings Tab Component

import { useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
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
import { Link2, Link2Off } from 'lucide-react';
import { SettingsFieldWrapper } from '../SettingsFieldWrapper';
import { StyleIndicator } from '../inputs/StyleIndicator';
import type { LayoutSettings, SpacingValue, PositionSettings, DimensionsSettings, FlexSettings } from '../styles/types';
import type { StyleSourceResult } from '../sidebar/types';

interface LayoutSettingsTabProps {
  value: Partial<LayoutSettings>;
  onChange: (value: Partial<LayoutSettings>) => void;
  getStyleSource?: (path: string) => StyleSourceResult;
  className?: string;
}

/**
 * Default layout settings
 */
export const defaultLayoutSettings: LayoutSettings = {
  display: 'block',
  position: {
    position: 'static',
  },
  dimensions: {
    width: 'auto',
    height: 'auto',
    minWidth: '',
    maxWidth: '',
    minHeight: '',
    maxHeight: '',
  },
  margin: {
    top: '0',
    right: '0',
    bottom: '0',
    left: '0',
    linked: true,
  },
  padding: {
    top: '0',
    right: '0',
    bottom: '0',
    left: '0',
    linked: true,
  },
  overflow: 'visible',
};

/**
 * Display options
 */
const displayOptions: { value: LayoutSettings['display']; label: string }[] = [
  { value: 'block', label: 'Block' },
  { value: 'flex', label: 'Flex' },
  { value: 'grid', label: 'Grid' },
  { value: 'inline', label: 'Inline' },
  { value: 'inline-block', label: 'Inline Block' },
  { value: 'inline-flex', label: 'Inline Flex' },
  { value: 'inline-grid', label: 'Inline Grid' },
  { value: 'none', label: 'None' },
];

/**
 * Position options
 */
const positionOptions: { value: PositionSettings['position']; label: string }[] = [
  { value: 'static', label: 'Static' },
  { value: 'relative', label: 'Relative' },
  { value: 'absolute', label: 'Absolute' },
  { value: 'fixed', label: 'Fixed' },
  { value: 'sticky', label: 'Sticky' },
];

/**
 * Overflow options
 */
const overflowOptions = ['visible', 'hidden', 'scroll', 'auto'] as const;

/**
 * Flex direction options
 */
const flexDirectionOptions: { value: FlexSettings['direction']; label: string }[] = [
  { value: 'row', label: 'Row' },
  { value: 'row-reverse', label: 'Row Reverse' },
  { value: 'column', label: 'Column' },
  { value: 'column-reverse', label: 'Column Reverse' },
];

/**
 * Flex wrap options
 */
const flexWrapOptions: { value: FlexSettings['wrap']; label: string }[] = [
  { value: 'nowrap', label: 'No Wrap' },
  { value: 'wrap', label: 'Wrap' },
  { value: 'wrap-reverse', label: 'Wrap Reverse' },
];

/**
 * Justify content options
 */
const justifyContentOptions: { value: FlexSettings['justifyContent']; label: string }[] = [
  { value: 'flex-start', label: 'Start' },
  { value: 'flex-end', label: 'End' },
  { value: 'center', label: 'Center' },
  { value: 'space-between', label: 'Space Between' },
  { value: 'space-around', label: 'Space Around' },
  { value: 'space-evenly', label: 'Space Evenly' },
];

/**
 * Align items options
 */
const alignItemsOptions: { value: FlexSettings['alignItems']; label: string }[] = [
  { value: 'stretch', label: 'Stretch' },
  { value: 'flex-start', label: 'Start' },
  { value: 'flex-end', label: 'End' },
  { value: 'center', label: 'Center' },
  { value: 'baseline', label: 'Baseline' },
];

/**
 * Spacing Control Component
 */
/**
 * Spacing Control Component
 */
function SpacingControl({
  label,
  value,
  onChange,
  getStyleSource,
  path,
}: {
  label: string;
  value: SpacingValue;
  onChange: (value: SpacingValue) => void;
  getStyleSource?: (path: string) => StyleSourceResult;
  path: string;
}) {
  const handleValueChange = useCallback(
    (side: keyof Omit<SpacingValue, 'linked'>, newValue: string) => {
      if (value.linked) {
        onChange({
          ...value,
          top: newValue,
          right: newValue,
          bottom: newValue,
          left: newValue,
        });
      } else {
        onChange({
          ...value,
          [side]: newValue,
        });
      }
    },
    [value, onChange]
  );

  const handleToggleLinked = useCallback(() => {
    if (!value.linked) {
      // When linking, copy top to all sides
      onChange({
        ...value,
        linked: true,
        right: value.top,
        bottom: value.top,
        left: value.top,
      });
    } else {
      onChange({
        ...value,
        linked: false,
      });
    }
  }, [value, onChange]);

  // Helper to get source for a specific side
  const getSideSource = (side: string) => {
    if (!getStyleSource) return { source: undefined, isResponsive: false };
    return getStyleSource(`${path}.${side}`);
  };

  // For the main label, we check if ANY side is modified
  const isModified =
    getSideSource('top').source === 'user' ||
    getSideSource('right').source === 'user' ||
    getSideSource('bottom').source === 'user' ||
    getSideSource('left').source === 'user';

  const isClassInherited =
    getSideSource('top').source === 'class' ||
    getSideSource('right').source === 'class' ||
    getSideSource('bottom').source === 'class' ||
    getSideSource('left').source === 'class';

  const isGlobalInherited =
    getSideSource('top').source === 'global' ||
    getSideSource('right').source === 'global' ||
    getSideSource('bottom').source === 'global' ||
    getSideSource('left').source === 'global';

  const isResponsiveOverride =
    getSideSource('top').isResponsive ||
    getSideSource('right').isResponsive ||
    getSideSource('bottom').isResponsive ||
    getSideSource('left').isResponsive;

  return (
    <div className="space-y-2 relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StyleIndicator
            isModified={isModified}
            isClassInherited={isClassInherited}
            isGlobalInherited={isGlobalInherited}
            isResponsiveOverride={isResponsiveOverride}
            orientation="vertical"
          />
          <Label className="text-xs text-muted-foreground">{label}</Label>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggleLinked}
          className="h-6 px-2"
          title={value.linked ? 'Unlink sides' : 'Link all sides'}
        >
          {value.linked ? (
            <Link2 className="h-3 w-3" />
          ) : (
            <Link2Off className="h-3 w-3" />
          )}
        </Button>
      </div>

      {value.linked ? (
        <div className="relative">
          <Input
            value={value.top}
            onChange={(e) => handleValueChange('top', e.target.value)}
            placeholder="0px"
            className="h-8 text-xs"
          />
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-1">
          <div className="space-y-1 relative">
            <div className="flex items-center gap-1">
              <StyleIndicator
                isModified={getSideSource('top').source === 'user'}
                isClassInherited={getSideSource('top').source === 'class'}
                isGlobalInherited={getSideSource('top').source === 'global'}
                isResponsiveOverride={getSideSource('top').isResponsive}
                className="w-1 h-1 -left-1.5"
              />
              <Label className="text-[10px] text-muted-foreground">T</Label>
            </div>
            <Input
              value={value.top}
              onChange={(e) => handleValueChange('top', e.target.value)}
              placeholder="0"
              className="h-7 text-xs px-2"
            />
          </div>
          <div className="space-y-1 relative">
            <div className="flex items-center gap-1">
              <StyleIndicator
                isModified={getSideSource('right').source === 'user'}
                isClassInherited={getSideSource('right').source === 'class'}
                isGlobalInherited={getSideSource('right').source === 'global'}
                isResponsiveOverride={getSideSource('right').isResponsive}
                className="w-1 h-1 -left-1.5"
              />
              <Label className="text-[10px] text-muted-foreground">R</Label>
            </div>
            <Input
              value={value.right}
              onChange={(e) => handleValueChange('right', e.target.value)}
              placeholder="0"
              className="h-7 text-xs px-2"
            />
          </div>
          <div className="space-y-1 relative">
            <div className="flex items-center gap-1">
              <StyleIndicator
                isModified={getSideSource('bottom').source === 'user'}
                isClassInherited={getSideSource('bottom').source === 'class'}
                isGlobalInherited={getSideSource('bottom').source === 'global'}
                isResponsiveOverride={getSideSource('bottom').isResponsive}
                className="w-1 h-1 -left-1.5"
              />
              <Label className="text-[10px] text-muted-foreground">B</Label>
            </div>
            <Input
              value={value.bottom}
              onChange={(e) => handleValueChange('bottom', e.target.value)}
              placeholder="0"
              className="h-7 text-xs px-2"
            />
          </div>
          <div className="space-y-1 relative">
            <div className="flex items-center gap-1">
              <StyleIndicator
                isModified={getSideSource('left').source === 'user'}
                isClassInherited={getSideSource('left').source === 'class'}
                isGlobalInherited={getSideSource('left').source === 'global'}
                isResponsiveOverride={getSideSource('left').isResponsive}
                className="w-1 h-1 -left-1.5"
              />
              <Label className="text-[10px] text-muted-foreground">L</Label>
            </div>
            <Input
              value={value.left}
              onChange={(e) => handleValueChange('left', e.target.value)}
              placeholder="0"
              className="h-7 text-xs px-2"
            />
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Layout Settings Tab - Position, display, dimensions, spacing
 */
export function LayoutSettingsTab({ value, onChange, getStyleSource, className }: LayoutSettingsTabProps) {
  // Helper to update nested values
  const handleChange = useCallback(
    <K extends keyof LayoutSettings>(key: K, newValue: LayoutSettings[K] | undefined) => {
      onChange({ ...value, [key]: newValue });
    },
    [value, onChange]
  );

  const handlePositionChange = useCallback(
    (updates: Partial<PositionSettings>) => {
      onChange({
        ...value,
        position: { ...(value.position || {}), ...updates } as PositionSettings,
      });
    },
    [value, onChange]
  );

  const handleDimensionsChange = useCallback(
    (updates: Partial<DimensionsSettings>) => {
      onChange({
        ...value,
        dimensions: { ...(value.dimensions || {}), ...updates } as DimensionsSettings,
      });
    },
    [value, onChange]
  );

  const handleFlexChange = useCallback(
    (updates: Partial<FlexSettings>) => {
      onChange({
        ...value,
        flex: { ...(value.flex || {}), ...updates } as FlexSettings,
      });
    },
    [value, onChange]
  );

  // Helper to get source flags
  const getSourceFlags = useCallback((path: string) => {
    const result = getStyleSource?.(path);
    return {
      isModified: result?.source === 'user',
      isClassInherited: result?.source === 'class',
      isGlobalInherited: result?.source === 'global',
      isResponsiveOverride: result?.isResponsive,
    };
  }, [getStyleSource]);

  // Handle reset
  const handleReset = useCallback((field: string, _defaultValue: unknown) => {
    // We handle nested resets manually based on the field path or just set undefined
    // For simplicity, we'll map field names to state updates
    if (field === 'display') handleChange('display', undefined);
    else if (field.startsWith('position.')) {
      const key = field.split('.')[1] as keyof PositionSettings;
      handlePositionChange({ [key]: undefined });
    }
    else if (field.startsWith('dimensions.')) {
      const key = field.split('.')[1] as keyof DimensionsSettings;
      handleDimensionsChange({ [key]: undefined });
    }
    else if (field.startsWith('flex.')) {
      const key = field.split('.')[1] as keyof FlexSettings;
      handleFlexChange({ [key]: undefined });
    }
    else if (field === 'margin') handleChange('margin', undefined);
    else if (field === 'padding') handleChange('padding', undefined);
    else if (field === 'overflow') handleChange('overflow', undefined);
    else if (field === 'overflowX') handleChange('overflowX', undefined);
    else if (field === 'overflowY') handleChange('overflowY', undefined);
  }, [handleChange, handlePositionChange, handleDimensionsChange, handleFlexChange]);

  const isFlex = value.display === 'flex' || value.display === 'inline-flex';
  const needsPositionControls = value.position?.position !== 'static';

  return (
    <div className={cn('space-y-4', className)}>
      <Accordion type="multiple" defaultValue={['display', 'dimensions', 'spacing']} className="space-y-1">
        {/* Display */}
        <AccordionItem value="display" className="border rounded-md px-3">
          <AccordionTrigger className="py-2 text-sm font-medium hover:no-underline">
            Display
          </AccordionTrigger>
          <AccordionContent className="pb-3 space-y-3">
            <SettingsFieldWrapper
              fieldName="display"
              {...getSourceFlags('layout.display')}
              defaultValue="block"
              currentValue={value.display}
              onReset={handleReset}
              label="Display"
              orientation="vertical"
            >
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Display</Label>
                <Select
                  value={value.display || 'block'}
                  onValueChange={(val) => handleChange('display', val as LayoutSettings['display'])}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {displayOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </SettingsFieldWrapper>

            {/* Flex options */}
            {isFlex && (
              <div className="space-y-3 pt-2 border-t">
                <div className="grid grid-cols-2 gap-2">
                  <SettingsFieldWrapper
                    fieldName="flex.direction"
                    {...getSourceFlags('layout.flex.direction')}
                    defaultValue="row"
                    currentValue={value.flex?.direction}
                    onReset={handleReset}
                    label="Direction"
                    orientation="vertical"
                  >
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Direction</Label>
                      <Select
                        value={value.flex?.direction || 'row'}
                        onValueChange={(val) => handleFlexChange({ direction: val as FlexSettings['direction'] })}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {flexDirectionOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </SettingsFieldWrapper>

                  <SettingsFieldWrapper
                    fieldName="flex.wrap"
                    {...getSourceFlags('layout.flex.wrap')}
                    defaultValue="nowrap"
                    currentValue={value.flex?.wrap}
                    onReset={handleReset}
                    label="Wrap"
                    orientation="vertical"
                  >
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Wrap</Label>
                      <Select
                        value={value.flex?.wrap || 'nowrap'}
                        onValueChange={(val) => handleFlexChange({ wrap: val as FlexSettings['wrap'] })}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {flexWrapOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </SettingsFieldWrapper>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <SettingsFieldWrapper
                    fieldName="flex.justifyContent"
                    {...getSourceFlags('layout.flex.justifyContent')}
                    defaultValue="flex-start"
                    currentValue={value.flex?.justifyContent}
                    onReset={handleReset}
                    label="Justify"
                    orientation="vertical"
                  >
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Justify</Label>
                      <Select
                        value={value.flex?.justifyContent || 'flex-start'}
                        onValueChange={(val) => handleFlexChange({ justifyContent: val as FlexSettings['justifyContent'] })}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {justifyContentOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </SettingsFieldWrapper>

                  <SettingsFieldWrapper
                    fieldName="flex.alignItems"
                    {...getSourceFlags('layout.flex.alignItems')}
                    defaultValue="stretch"
                    currentValue={value.flex?.alignItems}
                    onReset={handleReset}
                    label="Align"
                    orientation="vertical"
                  >
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Align</Label>
                      <Select
                        value={value.flex?.alignItems || 'stretch'}
                        onValueChange={(val) => handleFlexChange({ alignItems: val as FlexSettings['alignItems'] })}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {alignItemsOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </SettingsFieldWrapper>
                </div>

                <SettingsFieldWrapper
                  fieldName="flex.gap"
                  {...getSourceFlags('layout.flex.gap')}
                  defaultValue=""
                  currentValue={value.flex?.gap}
                  onReset={handleReset}
                  label="Gap"
                  orientation="vertical"
                >
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Gap</Label>
                    <Input
                      value={value.flex?.gap || ''}
                      onChange={(e) => handleFlexChange({ gap: e.target.value })}
                      placeholder="0px"
                      className="h-8 text-xs"
                    />
                  </div>
                </SettingsFieldWrapper>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Position */}
        <AccordionItem value="position" className="border rounded-md px-3">
          <AccordionTrigger className="py-2 text-sm font-medium hover:no-underline">
            Position
          </AccordionTrigger>
          <AccordionContent className="pb-3 space-y-3">
            <SettingsFieldWrapper
              fieldName="position.position"
              {...getSourceFlags('layout.position.position')}
              defaultValue="static"
              currentValue={value.position?.position}
              onReset={handleReset}
              label="Position"
              orientation="vertical"
            >
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Position</Label>
                <Select
                  value={value.position?.position || 'static'}
                  onValueChange={(val) => handlePositionChange({ position: val as PositionSettings['position'] })}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {positionOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </SettingsFieldWrapper>

            {needsPositionControls && (
              <div className="grid grid-cols-2 gap-2">
                <SettingsFieldWrapper
                  fieldName="position.top"
                  {...getSourceFlags('layout.position.top')}
                  defaultValue=""
                  currentValue={value.position?.top}
                  onReset={handleReset}
                  label="Top"
                  orientation="vertical"
                >
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Top</Label>
                    <Input
                      value={value.position?.top || ''}
                      onChange={(e) => handlePositionChange({ top: e.target.value })}
                      placeholder="auto"
                      className="h-8 text-xs"
                    />
                  </div>
                </SettingsFieldWrapper>
                <SettingsFieldWrapper
                  fieldName="position.right"
                  {...getSourceFlags('layout.position.right')}
                  defaultValue=""
                  currentValue={value.position?.right}
                  onReset={handleReset}
                  label="Right"
                  orientation="vertical"
                >
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Right</Label>
                    <Input
                      value={value.position?.right || ''}
                      onChange={(e) => handlePositionChange({ right: e.target.value })}
                      placeholder="auto"
                      className="h-8 text-xs"
                    />
                  </div>
                </SettingsFieldWrapper>
                <SettingsFieldWrapper
                  fieldName="position.bottom"
                  {...getSourceFlags('layout.position.bottom')}
                  defaultValue=""
                  currentValue={value.position?.bottom}
                  onReset={handleReset}
                  label="Bottom"
                  orientation="vertical"
                >
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Bottom</Label>
                    <Input
                      value={value.position?.bottom || ''}
                      onChange={(e) => handlePositionChange({ bottom: e.target.value })}
                      placeholder="auto"
                      className="h-8 text-xs"
                    />
                  </div>
                </SettingsFieldWrapper>
                <SettingsFieldWrapper
                  fieldName="position.left"
                  {...getSourceFlags('layout.position.left')}
                  defaultValue=""
                  currentValue={value.position?.left}
                  onReset={handleReset}
                  label="Left"
                  orientation="vertical"
                >
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Left</Label>
                    <Input
                      value={value.position?.left || ''}
                      onChange={(e) => handlePositionChange({ left: e.target.value })}
                      placeholder="auto"
                      className="h-8 text-xs"
                    />
                  </div>
                </SettingsFieldWrapper>
              </div>
            )}

            <SettingsFieldWrapper
              fieldName="position.zIndex"
              {...getSourceFlags('layout.position.zIndex')}
              defaultValue=""
              currentValue={value.position?.zIndex}
              onReset={handleReset}
              label="Z-Index"
              orientation="vertical"
            >
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Z-Index</Label>
                <Input
                  type="number"
                  value={value.position?.zIndex ?? ''}
                  onChange={(e) => handlePositionChange({ zIndex: parseInt(e.target.value) || undefined })}
                  placeholder="auto"
                  className="h-8 text-xs"
                />
              </div>
            </SettingsFieldWrapper>
          </AccordionContent>
        </AccordionItem>

        {/* Dimensions */}
        <AccordionItem value="dimensions" className="border rounded-md px-3">
          <AccordionTrigger className="py-2 text-sm font-medium hover:no-underline">
            Dimensions
          </AccordionTrigger>
          <AccordionContent className="pb-3 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <SettingsFieldWrapper
                fieldName="dimensions.width"
                {...getSourceFlags('layout.dimensions.width')}
                defaultValue=""
                currentValue={value.dimensions?.width}
                onReset={handleReset}
                label="Width"
                orientation="vertical"
              >
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Width</Label>
                  <Input
                    value={value.dimensions?.width || ''}
                    onChange={(e) => handleDimensionsChange({ width: e.target.value })}
                    placeholder="auto"
                    className="h-8 text-xs"
                  />
                </div>
              </SettingsFieldWrapper>
              <SettingsFieldWrapper
                fieldName="dimensions.height"
                {...getSourceFlags('layout.dimensions.height')}
                defaultValue=""
                currentValue={value.dimensions?.height}
                onReset={handleReset}
                label="Height"
                orientation="vertical"
              >
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Height</Label>
                  <Input
                    value={value.dimensions?.height || ''}
                    onChange={(e) => handleDimensionsChange({ height: e.target.value })}
                    placeholder="auto"
                    className="h-8 text-xs"
                  />
                </div>
              </SettingsFieldWrapper>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <SettingsFieldWrapper
                fieldName="dimensions.minWidth"
                {...getSourceFlags('layout.dimensions.minWidth')}
                defaultValue=""
                currentValue={value.dimensions?.minWidth}
                onReset={handleReset}
                label="Min Width"
                orientation="vertical"
              >
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Min Width</Label>
                  <Input
                    value={value.dimensions?.minWidth || ''}
                    onChange={(e) => handleDimensionsChange({ minWidth: e.target.value })}
                    placeholder="none"
                    className="h-8 text-xs"
                  />
                </div>
              </SettingsFieldWrapper>
              <SettingsFieldWrapper
                fieldName="dimensions.maxWidth"
                {...getSourceFlags('layout.dimensions.maxWidth')}
                defaultValue=""
                currentValue={value.dimensions?.maxWidth}
                onReset={handleReset}
                label="Max Width"
              >
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Max Width</Label>
                  <Input
                    value={value.dimensions?.maxWidth || ''}
                    onChange={(e) => handleDimensionsChange({ maxWidth: e.target.value })}
                    placeholder="none"
                    className="h-8 text-xs"
                  />
                </div>
              </SettingsFieldWrapper>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <SettingsFieldWrapper
                fieldName="dimensions.minHeight"
                {...getSourceFlags('layout.dimensions.minHeight')}
                defaultValue=""
                currentValue={value.dimensions?.minHeight}
                onReset={handleReset}
                label="Min Height"
              >
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Min Height</Label>
                  <Input
                    value={value.dimensions?.minHeight || ''}
                    onChange={(e) => handleDimensionsChange({ minHeight: e.target.value })}
                    placeholder="none"
                    className="h-8 text-xs"
                  />
                </div>
              </SettingsFieldWrapper>
              <SettingsFieldWrapper
                fieldName="dimensions.maxHeight"
                {...getSourceFlags('layout.dimensions.maxHeight')}
                defaultValue=""
                currentValue={value.dimensions?.maxHeight}
                onReset={handleReset}
                label="Max Height"
              >
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Max Height</Label>
                  <Input
                    value={value.dimensions?.maxHeight || ''}
                    onChange={(e) => handleDimensionsChange({ maxHeight: e.target.value })}
                    placeholder="none"
                    className="h-8 text-xs"
                  />
                </div>
              </SettingsFieldWrapper>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Spacing */}
        <AccordionItem value="spacing" className="border rounded-md px-3">
          <AccordionTrigger className="py-2 text-sm font-medium hover:no-underline">
            Spacing
          </AccordionTrigger>
          <AccordionContent className="pb-3 space-y-3">
            <SettingsFieldWrapper
              fieldName="margin"
              {...getSourceFlags('layout.margin')}
              defaultValue={defaultLayoutSettings.margin}
              currentValue={value.margin}
              onReset={handleReset}
              label="Margin"
            >
              <SpacingControl
                label="Margin"
                value={value.margin || defaultLayoutSettings.margin}
                onChange={(val) => handleChange('margin', val)}
                getStyleSource={getStyleSource}
                path="layout.margin"
              />
            </SettingsFieldWrapper>
            <SettingsFieldWrapper
              fieldName="padding"
              {...getSourceFlags('layout.padding')}
              defaultValue={defaultLayoutSettings.padding}
              currentValue={value.padding}
              onReset={handleReset}
              label="Padding"
            >
              <SpacingControl
                label="Padding"
                value={value.padding || defaultLayoutSettings.padding}
                onChange={(val) => handleChange('padding', val)}
                getStyleSource={getStyleSource}
                path="layout.padding"
              />
            </SettingsFieldWrapper>
          </AccordionContent>
        </AccordionItem>

        {/* Overflow */}
        <AccordionItem value="overflow" className="border rounded-md px-3">
          <AccordionTrigger className="py-2 text-sm font-medium hover:no-underline">
            Overflow
          </AccordionTrigger>
          <AccordionContent className="pb-3 space-y-3">
            <SettingsFieldWrapper
              fieldName="overflow"
              {...getSourceFlags('layout.overflow')}
              defaultValue="visible"
              currentValue={value.overflow}
              onReset={handleReset}
              label="Overflow"
            >
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Overflow</Label>
                <Select
                  value={value.overflow || 'visible'}
                  onValueChange={(val) => handleChange('overflow', val as LayoutSettings['overflow'])}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {overflowOptions.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt.charAt(0).toUpperCase() + opt.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </SettingsFieldWrapper>

            <div className="grid grid-cols-2 gap-2">
              <SettingsFieldWrapper
                fieldName="overflowX"
                {...getSourceFlags('layout.overflowX')}
                defaultValue="visible"
                currentValue={value.overflowX}
                onReset={handleReset}
                label="Overflow X"
              >
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Overflow X</Label>
                  <Select
                    value={value.overflowX || 'visible'}
                    onValueChange={(val) => handleChange('overflowX', val as LayoutSettings['overflowX'])}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {overflowOptions.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt.charAt(0).toUpperCase() + opt.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </SettingsFieldWrapper>
              <SettingsFieldWrapper
                fieldName="overflowY"
                {...getSourceFlags('layout.overflowY')}
                defaultValue="visible"
                currentValue={value.overflowY}
                onReset={handleReset}
                label="Overflow Y"
              >
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Overflow Y</Label>
                  <Select
                    value={value.overflowY || 'visible'}
                    onValueChange={(val) => handleChange('overflowY', val as LayoutSettings['overflowY'])}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {overflowOptions.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt.charAt(0).toUpperCase() + opt.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </SettingsFieldWrapper>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
