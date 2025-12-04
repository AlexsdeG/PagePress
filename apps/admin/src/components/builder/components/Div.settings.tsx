// PagePress v0.0.9 - 2025-12-04
// Div component settings panel with new ElementSettingsSidebar

import { useNode } from '@craftjs/core';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { WidthInput } from '../inspector/inputs/WidthInput';
import { TagSelector } from '../inspector/inputs/TagSelector';
import { ElementSettingsSidebar } from '../inspector/sidebar';
import type { DivProps } from './Div';
import type { HtmlTag } from '../inspector/inputs/TagSelector';

/**
 * Content-specific settings for Div
 */
function DivContentSettings({
  props,
  setProp,
}: {
  props: DivProps;
  setProp: (cb: (props: DivProps) => void) => void;
}) {
  return (
    <div className="space-y-4">
      {/* HTML Tag */}
      <TagSelector
        value={props.htmlTag || 'div'}
        onChange={(value: HtmlTag) => setProp((p) => (p.htmlTag = value))}
        label="HTML Tag"
      />

      {/* Legacy padding controls (now also in Layout tab) */}
      <div className="pt-2 border-t space-y-3">
        <Label className="text-xs text-muted-foreground">Quick Padding</Label>
        <WidthInput
          label="All Sides"
          value={props.padding || '16px'}
          onChange={(value) => setProp((p) => {
            p.padding = value;
            p.paddingTop = undefined;
            p.paddingRight = undefined;
            p.paddingBottom = undefined;
            p.paddingLeft = undefined;
          })}
          allowedUnits={['px', 'rem', '%']}
        />
      </div>

      {/* Custom Classes (Tailwind) */}
      <div className="space-y-2">
        <Label className="text-xs">Custom Classes (Tailwind)</Label>
        <Input
          value={props.className || ''}
          onChange={(e) => setProp((p) => (p.className = e.target.value))}
          placeholder="Enter Tailwind classes..."
          className="h-8 text-sm"
        />
      </div>
    </div>
  );
}

/**
 * Settings panel for Div component
 * All style tabs are available by default
 */
export function DivSettings() {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as DivProps,
  }));

  return (
    <ElementSettingsSidebar
      contentSettings={
        <DivContentSettings
          props={props}
          setProp={setProp}
        />
      }
    />
  );
}
