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
import type { LayoutSettings, SpacingValue, PositionSettings, DimensionsSettings, FlexSettings } from '../styles/types';

interface LayoutSettingsTabProps {
  value: Partial<LayoutSettings>;
  onChange: (value: Partial<LayoutSettings>) => void;
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
function SpacingControl({
  label,
  value,
  onChange,
}: {
  label: string;
  value: SpacingValue;
  onChange: (value: SpacingValue) => void;
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

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs text-muted-foreground">{label}</Label>
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
        <Input
          value={value.top}
          onChange={(e) => handleValueChange('top', e.target.value)}
          placeholder="0px"
          className="h-8 text-xs"
        />
      ) : (
        <div className="grid grid-cols-4 gap-1">
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">T</Label>
            <Input
              value={value.top}
              onChange={(e) => handleValueChange('top', e.target.value)}
              placeholder="0"
              className="h-7 text-xs px-2"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">R</Label>
            <Input
              value={value.right}
              onChange={(e) => handleValueChange('right', e.target.value)}
              placeholder="0"
              className="h-7 text-xs px-2"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">B</Label>
            <Input
              value={value.bottom}
              onChange={(e) => handleValueChange('bottom', e.target.value)}
              placeholder="0"
              className="h-7 text-xs px-2"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">L</Label>
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
export function LayoutSettingsTab({ value, onChange, className }: LayoutSettingsTabProps) {
  // Helper to update nested values
  const handleChange = useCallback(
    <K extends keyof LayoutSettings>(key: K, newValue: LayoutSettings[K]) => {
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

            {/* Flex options */}
            {isFlex && (
              <div className="space-y-3 pt-2 border-t">
                <div className="grid grid-cols-2 gap-2">
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
                </div>

                <div className="grid grid-cols-2 gap-2">
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
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Gap</Label>
                  <Input
                    value={value.flex?.gap || ''}
                    onChange={(e) => handleFlexChange({ gap: e.target.value })}
                    placeholder="0px"
                    className="h-8 text-xs"
                  />
                </div>
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

            {needsPositionControls && (
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Top</Label>
                  <Input
                    value={value.position?.top || ''}
                    onChange={(e) => handlePositionChange({ top: e.target.value })}
                    placeholder="auto"
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Right</Label>
                  <Input
                    value={value.position?.right || ''}
                    onChange={(e) => handlePositionChange({ right: e.target.value })}
                    placeholder="auto"
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Bottom</Label>
                  <Input
                    value={value.position?.bottom || ''}
                    onChange={(e) => handlePositionChange({ bottom: e.target.value })}
                    placeholder="auto"
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Left</Label>
                  <Input
                    value={value.position?.left || ''}
                    onChange={(e) => handlePositionChange({ left: e.target.value })}
                    placeholder="auto"
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            )}

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
          </AccordionContent>
        </AccordionItem>

        {/* Dimensions */}
        <AccordionItem value="dimensions" className="border rounded-md px-3">
          <AccordionTrigger className="py-2 text-sm font-medium hover:no-underline">
            Dimensions
          </AccordionTrigger>
          <AccordionContent className="pb-3 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Width</Label>
                <Input
                  value={value.dimensions?.width || ''}
                  onChange={(e) => handleDimensionsChange({ width: e.target.value })}
                  placeholder="auto"
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Height</Label>
                <Input
                  value={value.dimensions?.height || ''}
                  onChange={(e) => handleDimensionsChange({ height: e.target.value })}
                  placeholder="auto"
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Min Width</Label>
                <Input
                  value={value.dimensions?.minWidth || ''}
                  onChange={(e) => handleDimensionsChange({ minWidth: e.target.value })}
                  placeholder="none"
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Max Width</Label>
                <Input
                  value={value.dimensions?.maxWidth || ''}
                  onChange={(e) => handleDimensionsChange({ maxWidth: e.target.value })}
                  placeholder="none"
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Min Height</Label>
                <Input
                  value={value.dimensions?.minHeight || ''}
                  onChange={(e) => handleDimensionsChange({ minHeight: e.target.value })}
                  placeholder="none"
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Max Height</Label>
                <Input
                  value={value.dimensions?.maxHeight || ''}
                  onChange={(e) => handleDimensionsChange({ maxHeight: e.target.value })}
                  placeholder="none"
                  className="h-8 text-xs"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Spacing */}
        <AccordionItem value="spacing" className="border rounded-md px-3">
          <AccordionTrigger className="py-2 text-sm font-medium hover:no-underline">
            Spacing
          </AccordionTrigger>
          <AccordionContent className="pb-3 space-y-3">
            <SpacingControl
              label="Margin"
              value={value.margin || defaultLayoutSettings.margin}
              onChange={(val) => handleChange('margin', val)}
            />
            <SpacingControl
              label="Padding"
              value={value.padding || defaultLayoutSettings.padding}
              onChange={(val) => handleChange('padding', val)}
            />
          </AccordionContent>
        </AccordionItem>

        {/* Overflow */}
        <AccordionItem value="overflow" className="border rounded-md px-3">
          <AccordionTrigger className="py-2 text-sm font-medium hover:no-underline">
            Overflow
          </AccordionTrigger>
          <AccordionContent className="pb-3 space-y-3">
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

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Overflow X</Label>
                <Select
                  value={value.overflowX || value.overflow || 'visible'}
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
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Overflow Y</Label>
                <Select
                  value={value.overflowY || value.overflow || 'visible'}
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
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
