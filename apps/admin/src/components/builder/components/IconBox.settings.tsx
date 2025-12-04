// PagePress v0.0.9 - 2025-12-04
// IconBox component settings panel with ElementSettingsSidebar

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
import { IconPicker } from '../inspector/inputs/IconPicker';
import { WidthInput } from '../inspector/inputs/WidthInput';
import { ElementSettingsSidebar } from '../inspector/sidebar';
import type { IconBoxProps } from './IconBox';

/**
 * Content-specific settings for IconBox
 */
function IconBoxContentSettings({
  props,
  setProp,
}: {
  props: IconBoxProps;
  setProp: (cb: (props: IconBoxProps) => void) => void;
}) {
  return (
    <div className="space-y-4">
      {/* Icon Picker */}
      <IconPicker
        value={props.iconName || 'Star'}
        onChange={(value) => setProp((p: IconBoxProps) => (p.iconName = value))}
        label="Select Icon"
      />

      {/* Icon Size */}
      <WidthInput
        label="Icon Size"
        value={props.iconSize || '48px'}
        onChange={(value) => setProp((p: IconBoxProps) => (p.iconSize = value))}
        allowedUnits={['px', 'rem']}
        min={16}
        max={128}
      />

      {/* Heading */}
      <div className="space-y-2">
        <Label className="text-xs">Heading</Label>
        <Input
          value={props.heading || ''}
          onChange={(e) => setProp((p: IconBoxProps) => (p.heading = e.target.value))}
          placeholder="Feature Title"
        />
      </div>

      {/* Heading Tag */}
      <div className="space-y-2">
        <Label className="text-xs">Heading Tag</Label>
        <Select
          value={props.headingTag || 'h3'}
          onValueChange={(value) => setProp((p: IconBoxProps) => (p.headingTag = value as IconBoxProps['headingTag']))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="h2">H2</SelectItem>
            <SelectItem value="h3">H3</SelectItem>
            <SelectItem value="h4">H4</SelectItem>
            <SelectItem value="h5">H5</SelectItem>
            <SelectItem value="h6">H6</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Text */}
      <div className="space-y-2">
        <Label className="text-xs">Description</Label>
        <Input
          value={props.text || ''}
          onChange={(e) => setProp((p: IconBoxProps) => (p.text = e.target.value))}
          placeholder="Add description..."
        />
      </div>

      {/* Layout */}
      <div className="space-y-2">
        <Label className="text-xs">Layout</Label>
        <Select
          value={props.layout || 'top'}
          onValueChange={(value) => setProp((p: IconBoxProps) => (p.layout = value as IconBoxProps['layout']))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="top">Icon on Top</SelectItem>
            <SelectItem value="left">Icon on Left</SelectItem>
            <SelectItem value="right">Icon on Right</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Gap */}
      <WidthInput
        label="Gap"
        value={props.gap || '16px'}
        onChange={(value) => setProp((p: IconBoxProps) => (p.gap = value))}
        allowedUnits={['px', 'rem']}
      />

      {/* Custom Classes */}
      <div className="space-y-2">
        <Label className="text-xs">Custom Classes</Label>
        <Input
          value={props.className || ''}
          onChange={(e) => setProp((p: IconBoxProps) => (p.className = e.target.value))}
          placeholder="Enter Tailwind classes..."
        />
      </div>
    </div>
  );
}

/**
 * Settings panel for IconBox component
 * All style tabs are available by default
 */
export function IconBoxSettings() {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as IconBoxProps,
  }));

  return (
    <ElementSettingsSidebar
      contentSettings={
        <IconBoxContentSettings
          props={props}
          setProp={setProp}
        />
      }
    />
  );
}
