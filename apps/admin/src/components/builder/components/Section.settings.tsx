// PagePress v0.0.9 - 2025-12-04
// Section component settings panel with ElementSettingsSidebar

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
import type { SectionProps } from './Section';

/**
 * Content-specific settings for Section
 */
function SectionContentSettings({
  props,
  setProp,
}: {
  props: SectionProps;
  setProp: (cb: (props: SectionProps) => void) => void;
}) {
  return (
    <div className="space-y-4">
      {/* Content Width */}
      <div className="space-y-2">
        <Label className="text-xs">Content Width</Label>
        <Select
          value={props.contentWidth || 'boxed'}
          onValueChange={(value) => setProp((p: SectionProps) => (p.contentWidth = value as SectionProps['contentWidth']))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="full">Full Width</SelectItem>
            <SelectItem value="boxed">Boxed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Max Width (only for boxed) */}
      {props.contentWidth === 'boxed' && (
        <WidthInput
          label="Max Width"
          value={props.maxWidth || '1200px'}
          onChange={(value) => setProp((p: SectionProps) => (p.maxWidth = value))}
          allowedUnits={['px', '%', 'vw', 'rem']}
        />
      )}

      {/* Min Height */}
      <WidthInput
        label="Min Height"
        value={props.minHeight || '100px'}
        onChange={(value) => setProp((p: SectionProps) => (p.minHeight = value))}
        allowedUnits={['px', 'vh', '%', 'auto']}
      />

      {/* Vertical Alignment */}
      <div className="space-y-2">
        <Label className="text-xs">Vertical Alignment</Label>
        <Select
          value={props.verticalAlign || 'start'}
          onValueChange={(value) => setProp((p: SectionProps) => (p.verticalAlign = value as SectionProps['verticalAlign']))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="start">Top</SelectItem>
            <SelectItem value="center">Center</SelectItem>
            <SelectItem value="end">Bottom</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Custom Classes */}
      <div className="space-y-2">
        <Label className="text-xs">Custom Classes</Label>
        <Input
          value={props.className || ''}
          onChange={(e) => setProp((p: SectionProps) => (p.className = e.target.value))}
          placeholder="Enter Tailwind classes..."
        />
      </div>
    </div>
  );
}

/**
 * Settings panel for Section component
 * All style tabs are available by default
 */
export function SectionSettings() {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as SectionProps,
  }));

  return (
    <ElementSettingsSidebar
      contentSettings={
        <SectionContentSettings
          props={props}
          setProp={setProp}
        />
      }
    />
  );
}
