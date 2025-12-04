// PagePress v0.0.9 - 2025-12-04
// Heading component settings panel with ElementSettingsSidebar

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
import type { HeadingProps } from '../types';

/**
 * Content-specific settings for Heading
 */
function HeadingContentSettings({
  props,
  setProp,
}: {
  props: HeadingProps;
  setProp: (cb: (props: HeadingProps) => void) => void;
}) {
  return (
    <div className="space-y-4">
      {/* Text */}
      <div className="space-y-2">
        <Label className="text-xs">Text</Label>
        <Input
          value={props.text || ''}
          onChange={(e) => setProp((p: HeadingProps) => (p.text = e.target.value))}
          placeholder="Enter heading text..."
        />
      </div>

      {/* Heading Level */}
      <div className="space-y-2">
        <Label className="text-xs">Heading Level</Label>
        <Select
          value={String(props.level || 2)}
          onValueChange={(value) => setProp((p: HeadingProps) => (p.level = Number(value) as HeadingProps['level']))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">H1</SelectItem>
            <SelectItem value="2">H2</SelectItem>
            <SelectItem value="3">H3</SelectItem>
            <SelectItem value="4">H4</SelectItem>
            <SelectItem value="5">H5</SelectItem>
            <SelectItem value="6">H6</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Link URL */}
      <div className="space-y-2">
        <Label className="text-xs">Link URL (optional)</Label>
        <Input
          value={props.linkUrl || ''}
          onChange={(e) => setProp((p: HeadingProps) => (p.linkUrl = e.target.value))}
          placeholder="https://example.com"
        />
      </div>

      {/* Link Target */}
      {props.linkUrl && (
        <div className="space-y-2">
          <Label className="text-xs">Open In</Label>
          <Select
            value={props.linkTarget || '_self'}
            onValueChange={(value) => setProp((p: HeadingProps) => (p.linkTarget = value as HeadingProps['linkTarget']))}
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
      )}

      {/* Custom Classes */}
      <div className="space-y-2">
        <Label className="text-xs">Custom Classes</Label>
        <Input
          value={props.className || ''}
          onChange={(e) => setProp((p: HeadingProps) => (p.className = e.target.value))}
          placeholder="Enter Tailwind classes..."
        />
      </div>
    </div>
  );
}

/**
 * Settings panel for Heading component
 * All style tabs are available by default
 */
export function HeadingSettings() {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as HeadingProps,
  }));

  return (
    <ElementSettingsSidebar
      contentSettings={
        <HeadingContentSettings
          props={props}
          setProp={setProp}
        />
      }
    />
  );
}
