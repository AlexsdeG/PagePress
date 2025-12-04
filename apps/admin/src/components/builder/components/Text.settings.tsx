// PagePress v0.0.9 - 2025-12-04
// Text component settings panel with ElementSettingsSidebar

import { useNode } from '@craftjs/core';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ElementSettingsSidebar } from '../inspector/sidebar';
import type { TextProps } from '../types';

/**
 * Content-specific settings for Text
 */
function TextContentSettings({
  props,
  setProp,
}: {
  props: TextProps;
  setProp: (cb: (props: TextProps) => void) => void;
}) {
  return (
    <div className="space-y-4">
      {/* Text Content */}
      <div className="space-y-2">
        <Label className="text-xs">Text Content</Label>
        <Textarea
          value={props.text || ''}
          onChange={(e) => setProp((p: TextProps) => (p.text = e.target.value))}
          placeholder="Enter text..."
          rows={4}
          className="text-sm"
        />
      </div>

      {/* Custom Classes (Tailwind) */}
      <div className="space-y-2">
        <Label className="text-xs">Custom Classes</Label>
        <Input
          value={props.className || ''}
          onChange={(e) => setProp((p: TextProps) => (p.className = e.target.value))}
          placeholder="Enter Tailwind classes..."
          className="h-8 text-sm"
        />
      </div>
    </div>
  );
}

/**
 * Settings panel for Text component
 * All style tabs are available by default
 */
export function TextSettings() {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as TextProps,
  }));

  return (
    <ElementSettingsSidebar
      contentSettings={
        <TextContentSettings
          props={props}
          setProp={setProp}
        />
      }
    />
  );
}
