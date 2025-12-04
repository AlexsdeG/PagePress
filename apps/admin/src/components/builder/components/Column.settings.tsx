// PagePress v0.0.9 - 2025-12-04
// Column component settings panel with ElementSettingsSidebar

import { useNode } from '@craftjs/core';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
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
      {/* Width */}
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
