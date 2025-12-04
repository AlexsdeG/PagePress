// PagePress v0.0.9 - 2025-12-04
// Column component settings panel with ElementSettingsSidebar

import { useNode } from '@craftjs/core';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { WidthInput } from '../inspector/inputs/WidthInput';
import { ElementSettingsSidebar } from '../inspector/sidebar';
import type { ColumnProps } from './Column';

/**
 * Width preset configurations
 */
const WIDTH_PRESETS = [
  { label: 'Auto', value: 'auto' },
  { label: '1/4', value: '25%' },
  { label: '1/3', value: '33.33%' },
  { label: '1/2', value: '50%' },
  { label: '2/3', value: '66.66%' },
  { label: '3/4', value: '75%' },
  { label: 'Full', value: '100%' },
];

/**
 * Content-specific settings for Column
 */
function ColumnContentSettings({
  props,
  setProp,
}: {
  props: ColumnProps;
  setProp: (cb: (props: ColumnProps) => void) => void;
}) {
  return (
    <div className="space-y-4">
      {/* Width Presets */}
      <div className="space-y-2">
        <Label className="text-xs font-medium">Width Presets</Label>
        <div className="flex flex-wrap gap-1">
          {WIDTH_PRESETS.map((preset) => (
            <Button
              key={preset.value}
              variant={props.width === preset.value ? 'secondary' : 'outline'}
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => setProp((p: ColumnProps) => (p.width = preset.value))}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Custom Width */}
      <WidthInput
        label="Width"
        value={props.width || 'auto'}
        onChange={(value) => setProp((p: ColumnProps) => (p.width = value))}
        allowedUnits={['auto', 'px', '%', 'fr']}
      />

      {/* Min Width */}
      <WidthInput
        label="Min Width"
        value={props.minWidth || '0px'}
        onChange={(value) => setProp((p: ColumnProps) => (p.minWidth = value))}
        allowedUnits={['px', '%', 'rem']}
      />

      {/* Max Width */}
      <WidthInput
        label="Max Width"
        value={props.maxWidth || 'none'}
        onChange={(value) => setProp((p: ColumnProps) => (p.maxWidth = value))}
        allowedUnits={['auto', 'px', '%', 'rem']}
        placeholder="none"
      />

      {/* Order */}
      <div className="space-y-2">
        <Label className="text-xs">Order ({props.order || 0})</Label>
        <Slider
          value={[props.order || 0]}
          onValueChange={([value]) => setProp((p: ColumnProps) => (p.order = value))}
          min={-10}
          max={10}
          step={1}
        />
      </div>

      {/* Align Self */}
      <div className="space-y-2">
        <Label className="text-xs">Align Self</Label>
        <Select
          value={props.alignSelf || 'auto'}
          onValueChange={(value) => setProp((p: ColumnProps) => (p.alignSelf = value as ColumnProps['alignSelf']))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="auto">Auto</SelectItem>
            <SelectItem value="start">Start</SelectItem>
            <SelectItem value="center">Center</SelectItem>
            <SelectItem value="end">End</SelectItem>
            <SelectItem value="stretch">Stretch</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Custom Classes */}
      <div className="space-y-2">
        <Label className="text-xs">Custom Classes</Label>
        <Input
          value={props.className || ''}
          onChange={(e) => setProp((p: ColumnProps) => (p.className = e.target.value))}
          placeholder="Enter Tailwind classes..."
        />
      </div>
    </div>
  );
}

/**
 * Settings panel for Column component
 * All style tabs are available by default
 */
export function ColumnSettings() {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as ColumnProps,
  }));

  return (
    <ElementSettingsSidebar
      contentSettings={
        <ColumnContentSettings
          props={props}
          setProp={setProp}
        />
      }
    />
  );
}
