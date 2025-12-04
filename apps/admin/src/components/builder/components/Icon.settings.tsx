// PagePress v0.0.9 - 2025-12-04
// Icon component settings panel with ElementSettingsSidebar

import { useNode } from '@craftjs/core';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { IconPicker } from '../inspector/inputs/IconPicker';
import { WidthInput } from '../inspector/inputs/WidthInput';
import { ElementSettingsSidebar } from '../inspector/sidebar';
import type { IconProps } from './Icon';

/**
 * Content-specific settings for Icon
 */
function IconContentSettings({
  props,
  setProp,
}: {
  props: IconProps;
  setProp: (cb: (props: IconProps) => void) => void;
}) {
  return (
    <div className="space-y-4">
      {/* Icon Picker */}
      <IconPicker
        value={props.iconName || 'Star'}
        onChange={(value) => setProp((p: IconProps) => (p.iconName = value))}
        label="Select Icon"
      />

      {/* Size */}
      <WidthInput
        label="Size"
        value={props.size || '24px'}
        onChange={(value) => setProp((p: IconProps) => (p.size = value))}
        allowedUnits={['px', 'rem']}
        min={12}
        max={128}
      />

      {/* Stroke Width */}
      <div className="space-y-2">
        <Label className="text-xs">Stroke Width ({props.strokeWidth || 2})</Label>
        <Slider
          value={[props.strokeWidth || 2]}
          onValueChange={([value]) => setProp((p: IconProps) => (p.strokeWidth = value))}
          min={0.5}
          max={4}
          step={0.5}
        />
      </div>

      {/* Custom Classes */}
      <div className="space-y-2">
        <Label className="text-xs">Custom Classes</Label>
        <Input
          value={props.className || ''}
          onChange={(e) => setProp((p: IconProps) => (p.className = e.target.value))}
          placeholder="Enter Tailwind classes..."
        />
      </div>
    </div>
  );
}

/**
 * Settings panel for Icon component
 * All style tabs are available by default
 */
export function IconSettings() {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as IconProps,
  }));

  return (
    <ElementSettingsSidebar
      contentSettings={
        <IconContentSettings
          props={props}
          setProp={setProp}
        />
      }
    />
  );
}
