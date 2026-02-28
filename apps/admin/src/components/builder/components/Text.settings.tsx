// PagePress v0.0.16 - 2026-02-28
// Text component settings panel with ElementSettingsSidebar

import { useNode } from '@craftjs/core';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RichTextEditor } from '../editor';
import { ElementSettingsSidebar } from '../inspector/sidebar';
import { DynamicTagButton } from '../dynamic/DynamicTagButton';
import type { DynamicBinding, DynamicBindings } from '../dynamic/types';
import type { TextProps } from '../types';

/**
 * Content-specific settings for Text
 */
function TextContentSettings({
  props,
  setProp,
}: {
  props: TextProps & { dynamicBindings?: DynamicBindings };
  setProp: (cb: (props: TextProps & { dynamicBindings?: DynamicBindings }) => void) => void;
}) {
  const textBinding = props.dynamicBindings?.text;
  const hasDynamicText = !!textBinding;

  const handleTextBindingChange = (binding: DynamicBinding | undefined) => {
    setProp((p) => {
      if (!p.dynamicBindings) p.dynamicBindings = {};
      if (binding) {
        p.dynamicBindings.text = binding;
      } else {
        delete p.dynamicBindings.text;
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Text Content */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Text Content</Label>
          <DynamicTagButton
            binding={textBinding}
            onBindingChange={handleTextBindingChange}
            valueTypeFilter={['text']}
          />
        </div>
        {hasDynamicText ? (
          <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3">
            <p className="text-xs text-amber-600 dark:text-amber-400">
              Bound to <span className="font-mono font-medium">{textBinding.field}</span>
            </p>
            {textBinding.fallback && (
              <p className="text-[10px] text-muted-foreground mt-1">
                Fallback: {textBinding.fallback}
              </p>
            )}
          </div>
        ) : (
          <RichTextEditor
            content={props.htmlContent || props.text || ''}
            onChange={(html) =>
              setProp((p) => {
                p.htmlContent = html;
                // Update plain text for fallback
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = html;
                p.text = tempDiv.textContent || '';
              })
            }
            placeholder="Enter text..."
            className="min-h-[100px] border rounded-md p-2 text-sm"
          />
        )}
      </div>

      {/* Custom Classes (Tailwind) */}
      <div className="space-y-2">
        <Label className="text-xs">Custom Classes</Label>
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
