// PagePress v0.0.7 - 2025-12-04
// Border Input Component

import { useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { HexColorPicker } from 'react-colorful';
import { Link2, Link2Off } from 'lucide-react';
import type { BorderSettings, BorderSide, BorderRadius } from '../styles/types';
import { StyleIndicator } from './StyleIndicator';
import type { StyleSourceResult } from '../sidebar/types';

interface BorderInputProps {
  value: BorderSettings;
  onChange: (value: BorderSettings) => void;
  getStyleSource?: (path: string) => StyleSourceResult;
  className?: string;
}

/**
 * Border style options
 */
const borderStyles: BorderSide['style'][] = [
  'none',
  'solid',
  'dashed',
  'dotted',
  'double',
  'groove',
  'ridge',
  'inset',
  'outset',
];

/**
 * Default border side
 */
const defaultBorderSide: BorderSide = {
  width: 0,
  style: 'none',
  color: '#000000',
};

/**
 * Default border settings
 */
export const defaultBorderSettings: BorderSettings = {
  top: { ...defaultBorderSide },
  right: { ...defaultBorderSide },
  bottom: { ...defaultBorderSide },
  left: { ...defaultBorderSide },
  linked: true,
  radius: {
    topLeft: '0px',
    topRight: '0px',
    bottomRight: '0px',
    bottomLeft: '0px',
    linked: true,
  },
};

/**
 * Single border side control
 */
function BorderSideControl({
  label,
  value,
  onChange,
  getStyleSource,
  path,
}: {
  label: string;
  value: BorderSide;
  onChange: (value: BorderSide) => void;
  getStyleSource?: (path: string) => StyleSourceResult;
  path: string;
}) {
  const widthSource = getStyleSource?.(`${path}.width`) || { source: undefined, isResponsive: false };
  const styleSource = getStyleSource?.(`${path}.style`) || { source: undefined, isResponsive: false };
  const colorSource = getStyleSource?.(`${path}.color`) || { source: undefined, isResponsive: false };

  // Aggregate source for the label indicator (if any property is modified)
  const isModified = widthSource.source === 'user' || styleSource.source === 'user' || colorSource.source === 'user';
  const isClassInherited = widthSource.source === 'class' || styleSource.source === 'class' || colorSource.source === 'class';
  const isGlobalInherited = widthSource.source === 'global' || styleSource.source === 'global' || colorSource.source === 'global';
  const isResponsiveOverride = widthSource.isResponsive || styleSource.isResponsive || colorSource.isResponsive;

  return (
    <div className="space-y-2 relative pl-3">
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
      <div className="flex gap-2">
        {/* Width */}
        <div className="w-16 relative">
          <Input
            type="number"
            min={0}
            value={value.width}
            onChange={(e) => onChange({ ...value, width: parseInt(e.target.value) || 0 })}
            className="h-8 text-xs"
          />
        </div>

        {/* Style */}
        <div className="flex-1 relative">
          <Select
            value={value.style}
            onValueChange={(style) => onChange({ ...value, style: style as BorderSide['style'] })}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {borderStyles.map((style) => (
                <SelectItem key={style} value={style}>
                  {style.charAt(0).toUpperCase() + style.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Color */}
        <Popover>
          <PopoverTrigger asChild>
            <button
              className="w-8 h-8 rounded border shadow-sm relative"
              style={{ backgroundColor: value.color }}
            />
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3" align="end">
            <HexColorPicker
              color={value.color}
              onChange={(color) => onChange({ ...value, color })}
            />
            <Input
              value={value.color}
              onChange={(e) => onChange({ ...value, color: e.target.value })}
              className="mt-2 h-8 text-xs"
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

/**
 * Border radius corner control
 */
function RadiusCornerControl({
  label,
  value,
  onChange,
  getStyleSource,
  path,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  getStyleSource?: (path: string) => StyleSourceResult;
  path: string;
}) {
  const { source, isResponsive } = getStyleSource?.(path) || { source: undefined, isResponsive: false };

  return (
    <div className="space-y-1 relative pl-3">
      <div className="flex items-center gap-2">
        <StyleIndicator
          isModified={source === 'user'}
          isClassInherited={source === 'class'}
          isGlobalInherited={source === 'global'}
          isResponsiveOverride={isResponsive}
          orientation="vertical"
        />
        <Label className="text-xs text-muted-foreground">{label}</Label>
      </div>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0px"
        className="h-8 text-xs"
      />
    </div>
  );
}

/**
 * Border Input - Per-side border control with radius
 */
export function BorderInput({ value, onChange, getStyleSource, className }: BorderInputProps) {
  // Update a single side
  const handleSideChange = useCallback(
    (side: 'top' | 'right' | 'bottom' | 'left', sideValue: BorderSide) => {
      if (value.linked) {
        // Update all sides
        onChange({
          ...value,
          top: sideValue,
          right: sideValue,
          bottom: sideValue,
          left: sideValue,
        });
      } else {
        // Update single side
        onChange({
          ...value,
          [side]: sideValue,
        });
      }
    },
    [value, onChange]
  );

  // Toggle linked borders
  const handleToggleLinked = useCallback(() => {
    if (!value.linked) {
      // When linking, copy top to all sides
      onChange({
        ...value,
        linked: true,
        right: { ...value.top },
        bottom: { ...value.top },
        left: { ...value.top },
      });
    } else {
      onChange({
        ...value,
        linked: false,
      });
    }
  }, [value, onChange]);

  // Update a single radius corner
  const handleRadiusChange = useCallback(
    (corner: keyof BorderRadius, cornerValue: string) => {
      if (typeof cornerValue !== 'string') return;

      if (value.radius.linked) {
        // Update all corners
        onChange({
          ...value,
          radius: {
            ...value.radius,
            topLeft: cornerValue,
            topRight: cornerValue,
            bottomRight: cornerValue,
            bottomLeft: cornerValue,
          },
        });
      } else {
        // Update single corner
        onChange({
          ...value,
          radius: {
            ...value.radius,
            [corner]: cornerValue,
          },
        });
      }
    },
    [value, onChange]
  );

  // Toggle linked radius
  const handleToggleRadiusLinked = useCallback(() => {
    if (!value.radius.linked) {
      // When linking, copy topLeft to all corners
      onChange({
        ...value,
        radius: {
          linked: true,
          topLeft: value.radius.topLeft,
          topRight: value.radius.topLeft,
          bottomRight: value.radius.topLeft,
          bottomLeft: value.radius.topLeft,
        },
      });
    } else {
      onChange({
        ...value,
        radius: {
          ...value.radius,
          linked: false,
        },
      });
    }
  }, [value, onChange]);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Border preview */}
      <div
        className="h-20 rounded-md bg-muted flex items-center justify-center text-xs text-muted-foreground"
        style={{
          borderTop: `${value.top.width}px ${value.top.style} ${value.top.color}`,
          borderRight: `${value.right.width}px ${value.right.style} ${value.right.color}`,
          borderBottom: `${value.bottom.width}px ${value.bottom.style} ${value.bottom.color}`,
          borderLeft: `${value.left.width}px ${value.left.style} ${value.left.color}`,
          borderRadius: value.radius.linked
            ? value.radius.topLeft
            : `${value.radius.topLeft} ${value.radius.topRight} ${value.radius.bottomRight} ${value.radius.bottomLeft}`,
        }}
      >
        Preview
      </div>

      {/* Border controls */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Border</Label>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleLinked}
            className="h-6 px-2"
            title={value.linked ? 'Unlink sides' : 'Link all sides'}
          >
            {value.linked ? (
              <Link2 className="h-4 w-4" />
            ) : (
              <Link2Off className="h-4 w-4" />
            )}
          </Button>
        </div>

        {value.linked ? (
          // Linked mode - single control
          <BorderSideControl
            label="All Sides"
            value={value.top}
            onChange={(v) => handleSideChange('top', v)}
            getStyleSource={getStyleSource}
            path="top"
          />
        ) : (
          // Unlinked mode - individual controls
          <div className="grid grid-cols-2 gap-3">
            <BorderSideControl
              label="Top"
              value={value.top}
              onChange={(v) => handleSideChange('top', v)}
              getStyleSource={getStyleSource}
              path="top"
            />
            <BorderSideControl
              label="Right"
              value={value.right}
              onChange={(v) => handleSideChange('right', v)}
              getStyleSource={getStyleSource}
              path="right"
            />
            <BorderSideControl
              label="Bottom"
              value={value.bottom}
              onChange={(v) => handleSideChange('bottom', v)}
              getStyleSource={getStyleSource}
              path="bottom"
            />
            <BorderSideControl
              label="Left"
              value={value.left}
              onChange={(v) => handleSideChange('left', v)}
              getStyleSource={getStyleSource}
              path="left"
            />
          </div>
        )}
      </div>

      {/* Border radius controls */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Border Radius</Label>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleRadiusLinked}
            className="h-6 px-2"
            title={value.radius.linked ? 'Unlink corners' : 'Link all corners'}
          >
            {value.radius.linked ? (
              <Link2 className="h-4 w-4" />
            ) : (
              <Link2Off className="h-4 w-4" />
            )}
          </Button>
        </div>

        {value.radius.linked ? (
          // Linked mode - single control
          <RadiusCornerControl
            label="All Corners"
            value={value.radius.topLeft}
            onChange={(v) => handleRadiusChange('topLeft', v)}
            getStyleSource={getStyleSource}
            path="radius.topLeft"
          />
        ) : (
          // Unlinked mode - individual controls
          <div className="grid grid-cols-2 gap-3">
            <RadiusCornerControl
              label="Top Left"
              value={value.radius.topLeft}
              onChange={(v) => handleRadiusChange('topLeft', v)}
              getStyleSource={getStyleSource}
              path="radius.topLeft"
            />
            <RadiusCornerControl
              label="Top Right"
              value={value.radius.topRight}
              onChange={(v) => handleRadiusChange('topRight', v)}
              getStyleSource={getStyleSource}
              path="radius.topRight"
            />
            <RadiusCornerControl
              label="Bottom Left"
              value={value.radius.bottomLeft}
              onChange={(v) => handleRadiusChange('bottomLeft', v)}
              getStyleSource={getStyleSource}
              path="radius.bottomLeft"
            />
            <RadiusCornerControl
              label="Bottom Right"
              value={value.radius.bottomRight}
              onChange={(v) => handleRadiusChange('bottomRight', v)}
              getStyleSource={getStyleSource}
              path="radius.bottomRight"
            />
          </div>
        )}
      </div>
    </div>
  );
}
