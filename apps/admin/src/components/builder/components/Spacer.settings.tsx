// PagePress v0.0.9 - 2025-12-04
// Spacer component settings panel with ElementSettingsSidebar

import { useNode } from '@craftjs/core';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { WidthInput } from '../inspector/inputs/WidthInput';
import { ElementSettingsSidebar } from '../inspector/sidebar';
import type { SpacerProps } from './Spacer';

/**
 * Content-specific settings for Spacer
 */
function SpacerContentSettings({
  props,
  setProp,
}: {
  props: SpacerProps;
  setProp: (cb: (props: SpacerProps) => void) => void;
}) {
  return (
    <div className="space-y-4">
      {/* Height */}
      <WidthInput
        label="Height"
        value={props.height || '40px'}
        onChange={(value) => setProp((p: SpacerProps) => (p.height = value))}
        allowedUnits={['px', 'vh', 'rem']}
      />

      {/* Custom Classes */}
      <div className="space-y-2">
        <Label className="text-xs">Custom Classes</Label>
        <Input
          value={props.className || ''}
          onChange={(e) => setProp((p: SpacerProps) => (p.className = e.target.value))}
          placeholder="Enter Tailwind classes..."
        />
      </div>
    </div>
  );
}

/**
 * Settings panel for Spacer component
 * All style tabs are available by default
 */
export function SpacerSettings() {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as SpacerProps,
  }));

  return (
    <ElementSettingsSidebar
      contentSettings={
        <SpacerContentSettings
          props={props}
          setProp={setProp}
        />
      }
    />
  );
}
