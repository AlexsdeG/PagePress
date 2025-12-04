// PagePress v0.0.9 - 2025-12-04
// Link component settings panel with ElementSettingsSidebar

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
import { ElementSettingsSidebar } from '../inspector/sidebar';
import type { LinkProps } from './Link';

/**
 * Content-specific settings for Link
 */
function LinkContentSettings({
  props,
  setProp,
}: {
  props: LinkProps;
  setProp: (cb: (props: LinkProps) => void) => void;
}) {
  return (
    <div className="space-y-4">
      {/* Text */}
      <div className="space-y-2">
        <Label className="text-xs">Link Text</Label>
        <Input
          value={props.text || ''}
          onChange={(e) => setProp((p: LinkProps) => (p.text = e.target.value))}
          placeholder="Click here"
        />
      </div>

      {/* URL */}
      <div className="space-y-2">
        <Label className="text-xs">URL</Label>
        <Input
          value={props.href || ''}
          onChange={(e) => setProp((p: LinkProps) => (p.href = e.target.value))}
          placeholder="https://example.com"
        />
      </div>

      {/* Target */}
      <div className="space-y-2">
        <Label className="text-xs">Open In</Label>
        <Select
          value={props.target || '_self'}
          onValueChange={(value) => setProp((p: LinkProps) => (p.target = value as LinkProps['target']))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_self">Same Window</SelectItem>
            <SelectItem value="_blank">New Window</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Underline */}
      <div className="space-y-2">
        <Label className="text-xs">Underline</Label>
        <Select
          value={props.underline || 'hover'}
          onValueChange={(value) => setProp((p: LinkProps) => (p.underline = value as LinkProps['underline']))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="always">Always</SelectItem>
            <SelectItem value="hover">On Hover</SelectItem>
            <SelectItem value="none">Never</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Custom Classes */}
      <div className="space-y-2">
        <Label className="text-xs">Custom Classes</Label>
        <Input
          value={props.className || ''}
          onChange={(e) => setProp((p: LinkProps) => (p.className = e.target.value))}
          placeholder="Enter Tailwind classes..."
        />
      </div>
    </div>
  );
}

/**
 * Settings panel for Link component
 * All style tabs are available by default
 */
export function LinkSettings() {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as LinkProps,
  }));

  return (
    <ElementSettingsSidebar
      contentSettings={
        <LinkContentSettings
          props={props}
          setProp={setProp}
        />
      }
    />
  );
}
