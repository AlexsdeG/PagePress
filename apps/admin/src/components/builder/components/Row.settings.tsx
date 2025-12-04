// PagePress v0.0.9 - 2025-12-04
// Row component settings panel with ElementSettingsSidebar

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
import { WidthInput } from '../inspector/inputs/WidthInput';
import { ElementSettingsSidebar } from '../inspector/sidebar';
import type { RowProps } from './Row';

/**
 * Content-specific settings for Row
 */
function RowContentSettings({
  props,
  setProp,
}: {
  props: RowProps;
  setProp: (cb: (props: RowProps) => void) => void;
}) {
  return (
    <div className="space-y-4">
      {/* Gap */}
      <WidthInput
        label="Gap"
        value={props.gap || '16px'}
        onChange={(value) => setProp((p: RowProps) => (p.gap = value))}
        allowedUnits={['px', 'rem', '%']}
      />

      {/* Justify Content */}
      <div className="space-y-2">
        <Label className="text-xs">Justify Content</Label>
        <Select
          value={props.justifyContent || 'start'}
          onValueChange={(value) => setProp((p: RowProps) => (p.justifyContent = value as RowProps['justifyContent']))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="start">Start</SelectItem>
            <SelectItem value="center">Center</SelectItem>
            <SelectItem value="end">End</SelectItem>
            <SelectItem value="between">Space Between</SelectItem>
            <SelectItem value="around">Space Around</SelectItem>
            <SelectItem value="evenly">Space Evenly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Align Items */}
      <div className="space-y-2">
        <Label className="text-xs">Align Items</Label>
        <Select
          value={props.alignItems || 'stretch'}
          onValueChange={(value) => setProp((p: RowProps) => (p.alignItems = value as RowProps['alignItems']))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="start">Start</SelectItem>
            <SelectItem value="center">Center</SelectItem>
            <SelectItem value="end">End</SelectItem>
            <SelectItem value="stretch">Stretch</SelectItem>
            <SelectItem value="baseline">Baseline</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Wrap */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="wrap"
          checked={props.wrap ?? true}
          onChange={(e) => setProp((p: RowProps) => (p.wrap = e.target.checked))}
          className="rounded border-gray-300"
        />
        <Label htmlFor="wrap" className="text-xs">Wrap Items</Label>
      </div>

      {/* Custom Classes */}
      <div className="space-y-2">
        <Label className="text-xs">Custom Classes</Label>
        <Input
          value={props.className || ''}
          onChange={(e) => setProp((p: RowProps) => (p.className = e.target.value))}
          placeholder="Enter Tailwind classes..."
        />
      </div>
    </div>
  );
}

/**
 * Settings panel for Row component
 * All style tabs are available by default
 */
export function RowSettings() {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as RowProps,
  }));

  return (
    <ElementSettingsSidebar
      contentSettings={
        <RowContentSettings
          props={props}
          setProp={setProp}
        />
      }
    />
  );
}
