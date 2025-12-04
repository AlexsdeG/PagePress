// PagePress v0.0.9 - 2025-12-04
// Code Block component settings panel (HTML, CSS, JavaScript) with ElementSettingsSidebar

import { useNode } from '@craftjs/core';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { ElementSettingsSidebar } from '../inspector/sidebar';
import type { HTMLBlockProps } from '../types';

/**
 * Content-specific settings for HTMLBlock (CodeBlock)
 */
function HTMLBlockContentSettings({
  props,
  setProp,
}: {
  props: HTMLBlockProps;
  setProp: (cb: (props: HTMLBlockProps) => void) => void;
}) {
  return (
    <div className="space-y-4">
      {/* HTML Code */}
      <div className="space-y-2">
        <Label className="text-xs">HTML Code</Label>
        <Textarea
          value={props.html || ''}
          onChange={(e) => setProp((p: HTMLBlockProps) => (p.html = e.target.value))}
          placeholder="<div>Your custom HTML here...</div>"
          rows={8}
          className="font-mono text-sm"
        />
      </div>

      {/* CSS Styles */}
      <div className="space-y-2">
        <Label className="text-xs">CSS Styles</Label>
        <Textarea
          value={props.css || ''}
          onChange={(e) => setProp((p: HTMLBlockProps) => (p.css = e.target.value))}
          placeholder=".my-class { color: red; }"
          rows={6}
          className="font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground">
          Styles are scoped to this code block
        </p>
      </div>

      {/* JavaScript Code */}
      <div className="space-y-2">
        <Label className="text-xs">JavaScript Code</Label>
        <Textarea
          value={props.javascript || ''}
          onChange={(e) => setProp((p: HTMLBlockProps) => (p.javascript = e.target.value))}
          placeholder="console.log('Hello World');"
          rows={6}
          className="font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground">
          ⚠️ JavaScript only runs in preview mode for security
        </p>
      </div>

      {/* Min Height */}
      <div className="space-y-2">
        <Label className="text-xs">Min Height ({props.minHeight || 60}px)</Label>
        <Slider
          value={[props.minHeight || 60]}
          onValueChange={([value]) => setProp((p: HTMLBlockProps) => (p.minHeight = value))}
          min={0}
          max={500}
          step={10}
        />
      </div>

      {/* Custom Classes */}
      <div className="space-y-2">
        <Label className="text-xs">Custom Classes</Label>
        <Input
          value={props.className || ''}
          onChange={(e) => setProp((p: HTMLBlockProps) => (p.className = e.target.value))}
          placeholder="Enter Tailwind classes..."
        />
      </div>
    </div>
  );
}

/**
 * Settings panel for CodeBlock (formerly HTMLBlock) component
 * All style tabs are available by default
 */
export function HTMLBlockSettings() {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as HTMLBlockProps,
  }));

  return (
    <ElementSettingsSidebar
      contentSettings={
        <HTMLBlockContentSettings
          props={props}
          setProp={setProp}
        />
      }
    />
  );
}
