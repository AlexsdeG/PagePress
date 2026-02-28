// PagePress v0.0.16 - 2026-02-28
// Button component settings panel with ElementSettingsSidebar

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
import { Slider } from '@/components/ui/slider';
import { IconPicker } from '../inspector/inputs/IconPicker';
import { ElementSettingsSidebar } from '../inspector/sidebar';
import { DynamicTagButton } from '../dynamic/DynamicTagButton';
import type { DynamicBinding, DynamicBindings } from '../dynamic/types';
import type { ButtonProps } from '../types';

import { SettingsFieldWrapper } from '../inspector/SettingsFieldWrapper';

const defaultButtonProps: Partial<ButtonProps> = {
  text: 'Click me',
  variant: 'primary',
  size: 'md',
  href: '',
  target: '_self',
  fullWidth: false,
  iconBefore: '',
  iconAfter: '',
  iconSize: 16,
  className: '',
};

/**
 * Content-specific settings for Button
 */
function ButtonContentSettings({
  props,
  setProp,
}: {
  props: ButtonProps & { dynamicBindings?: DynamicBindings };
  setProp: (cb: (props: ButtonProps & { dynamicBindings?: DynamicBindings }) => void) => void;
}) {
  const handleReset = (fieldName: string, defaultValue: unknown) => {
    setProp((p: Record<string, unknown>) => {
      p[fieldName] = defaultValue;
    });
  };

  const textBinding = props.dynamicBindings?.text;

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
      {/* Button Text */}
      <SettingsFieldWrapper
        fieldName="text"
        defaultValue={defaultButtonProps.text}
        currentValue={props.text}
        isModified={props.text !== defaultButtonProps.text}
        onReset={handleReset}
        label="Button Text"
      >
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Button Text</Label>
            <DynamicTagButton
              binding={textBinding}
              onBindingChange={handleTextBindingChange}
              valueTypeFilter={['text']}
            />
          </div>
          {textBinding ? (
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
            <Input
              value={props.text || ''}
              onChange={(e) => setProp((p) => (p.text = e.target.value))}
              placeholder="Enter button text..."
            />
          )}
        </div>
      </SettingsFieldWrapper>

      {/* Variant */}
      <SettingsFieldWrapper
        fieldName="variant"
        defaultValue={defaultButtonProps.variant}
        currentValue={props.variant}
        isModified={props.variant !== defaultButtonProps.variant}
        onReset={handleReset}
        label="Variant"
      >
        <div className="space-y-2">
          <Label className="text-xs">Variant</Label>
          <Select
            value={props.variant || 'primary'}
            onValueChange={(value) => setProp((p: ButtonProps) => (p.variant = value as ButtonProps['variant']))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="primary">Primary</SelectItem>
              <SelectItem value="secondary">Secondary</SelectItem>
              <SelectItem value="outline">Outline</SelectItem>
              <SelectItem value="ghost">Ghost</SelectItem>
              <SelectItem value="destructive">Destructive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </SettingsFieldWrapper>

      {/* Size */}
      <SettingsFieldWrapper
        fieldName="size"
        defaultValue={defaultButtonProps.size}
        currentValue={props.size}
        isModified={props.size !== defaultButtonProps.size}
        onReset={handleReset}
        label="Size"
      >
        <div className="space-y-2">
          <Label className="text-xs">Size</Label>
          <Select
            value={props.size || 'md'}
            onValueChange={(value) => setProp((p: ButtonProps) => (p.size = value as ButtonProps['size']))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sm">Small</SelectItem>
              <SelectItem value="md">Medium</SelectItem>
              <SelectItem value="lg">Large</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </SettingsFieldWrapper>

      {/* Full Width */}
      <SettingsFieldWrapper
        fieldName="fullWidth"
        defaultValue={defaultButtonProps.fullWidth}
        currentValue={props.fullWidth}
        isModified={props.fullWidth !== defaultButtonProps.fullWidth}
        onReset={handleReset}
        label="Full Width"
      >
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="fullWidth"
            checked={props.fullWidth || false}
            onChange={(e) => setProp((p: ButtonProps) => (p.fullWidth = e.target.checked))}
            className="rounded border-gray-300"
          />
          <Label htmlFor="fullWidth" className="text-xs">Full Width</Label>
        </div>
      </SettingsFieldWrapper>

      {/* Icon Before */}
      <SettingsFieldWrapper
        fieldName="iconBefore"
        defaultValue={defaultButtonProps.iconBefore}
        currentValue={props.iconBefore}
        isModified={props.iconBefore !== defaultButtonProps.iconBefore}
        onReset={handleReset}
        label="Icon Before"
      >
        <div className="space-y-2">
          <Label className="text-xs">Icon Before Text</Label>
          <IconPicker
            value={props.iconBefore || ''}
            onChange={(value) => setProp((p: ButtonProps) => (p.iconBefore = value))}
          />
        </div>
      </SettingsFieldWrapper>

      {/* Icon After */}
      <SettingsFieldWrapper
        fieldName="iconAfter"
        defaultValue={defaultButtonProps.iconAfter}
        currentValue={props.iconAfter}
        isModified={props.iconAfter !== defaultButtonProps.iconAfter}
        onReset={handleReset}
        label="Icon After"
      >
        <div className="space-y-2">
          <Label className="text-xs">Icon After Text</Label>
          <IconPicker
            value={props.iconAfter || ''}
            onChange={(value) => setProp((p: ButtonProps) => (p.iconAfter = value))}
          />
        </div>
      </SettingsFieldWrapper>

      {/* Icon Size */}
      {(props.iconBefore || props.iconAfter) && (
        <SettingsFieldWrapper
          fieldName="iconSize"
          defaultValue={defaultButtonProps.iconSize}
          currentValue={props.iconSize}
          isModified={props.iconSize !== defaultButtonProps.iconSize}
          onReset={handleReset}
          label="Icon Size"
        >
          <div className="space-y-2">
            <Label className="text-xs">Icon Size ({props.iconSize ?? 16}px)</Label>
            <Slider
              value={[props.iconSize ?? 16]}
              onValueChange={([value]) => setProp((p: ButtonProps) => (p.iconSize = value))}
              min={12}
              max={32}
              step={2}
            />
          </div>
        </SettingsFieldWrapper>
      )}

      {/* URL */}
      <SettingsFieldWrapper
        fieldName="href"
        defaultValue={defaultButtonProps.href}
        currentValue={props.href}
        isModified={props.href !== defaultButtonProps.href}
        onReset={handleReset}
        label="URL"
      >
        <div className="space-y-2">
          <Label className="text-xs">URL (optional)</Label>
          <Input
            value={props.href || ''}
            onChange={(e) => setProp((p: ButtonProps) => (p.href = e.target.value))}
            placeholder="https://example.com"
          />
        </div>
      </SettingsFieldWrapper>

      {/* Target */}
      {props.href && (
        <SettingsFieldWrapper
          fieldName="target"
          defaultValue={defaultButtonProps.target}
          currentValue={props.target}
          isModified={props.target !== defaultButtonProps.target}
          onReset={handleReset}
          label="Target"
        >
          <div className="space-y-2">
            <Label className="text-xs">Target</Label>
            <Select
              value={props.target || '_self'}
              onValueChange={(value) => setProp((p: ButtonProps) => (p.target = value as ButtonProps['target']))}
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
        </SettingsFieldWrapper>
      )}

      {/* Custom Classes */}
      <SettingsFieldWrapper
        fieldName="className"
        defaultValue={defaultButtonProps.className}
        currentValue={props.className}
        isModified={props.className !== defaultButtonProps.className}
        onReset={handleReset}
        label="Custom Classes"
      >
        <div className="space-y-2">
          <Label className="text-xs">Custom Classes</Label>
          <Input
            value={props.className || ''}
            onChange={(e) => setProp((p: ButtonProps) => (p.className = e.target.value))}
            placeholder="Enter Tailwind classes..."
          />
        </div>
      </SettingsFieldWrapper>
    </div>
  );
}

/**
 * Settings panel for Button component
 * All style tabs are available by default
 */
export function ButtonSettings() {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as ButtonProps,
  }));

  return (
    <ElementSettingsSidebar
      contentSettings={
        <ButtonContentSettings
          props={props}
          setProp={setProp}
        />
      }
    />
  );
}
