// PagePress v0.0.5 - 2025-11-30
// Button component settings panel

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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ColorInput } from '../inspector/inputs/ColorInput';
import { IconPicker } from '../inspector/inputs/IconPicker';
import type { ButtonProps } from '../types';

/**
 * Settings panel for Button component
 */
export function ButtonSettings() {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as ButtonProps,
  }));

  return (
    <Accordion type="multiple" defaultValue={['content', 'appearance', 'icons', 'link', 'style']} className="w-full">
      {/* Content Section */}
      <AccordionItem value="content">
        <AccordionTrigger className="text-sm">Content</AccordionTrigger>
        <AccordionContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs">Button Text</Label>
            <Input
              value={props.text || ''}
              onChange={(e) => setProp((p: ButtonProps) => (p.text = e.target.value))}
              placeholder="Enter button text..."
            />
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Appearance Section */}
      <AccordionItem value="appearance">
        <AccordionTrigger className="text-sm">Appearance</AccordionTrigger>
        <AccordionContent className="space-y-4">
          {/* Variant */}
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

          {/* Size */}
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

          {/* Full Width */}
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
        </AccordionContent>
      </AccordionItem>

      {/* Icons Section */}
      <AccordionItem value="icons">
        <AccordionTrigger className="text-sm">Icons</AccordionTrigger>
        <AccordionContent className="space-y-4">
          {/* Icon Before */}
          <div className="space-y-2">
            <Label className="text-xs">Icon Before Text</Label>
            <IconPicker
              value={props.iconBefore || ''}
              onChange={(value) => setProp((p: ButtonProps) => (p.iconBefore = value))}
            />
          </div>

          {/* Icon After */}
          <div className="space-y-2">
            <Label className="text-xs">Icon After Text</Label>
            <IconPicker
              value={props.iconAfter || ''}
              onChange={(value) => setProp((p: ButtonProps) => (p.iconAfter = value))}
            />
          </div>

          {/* Icon Size */}
          {(props.iconBefore || props.iconAfter) && (
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
          )}
        </AccordionContent>
      </AccordionItem>

      {/* Link Section */}
      <AccordionItem value="link">
        <AccordionTrigger className="text-sm">Link</AccordionTrigger>
        <AccordionContent className="space-y-4">
          {/* URL */}
          <div className="space-y-2">
            <Label className="text-xs">URL (optional)</Label>
            <Input
              value={props.href || ''}
              onChange={(e) => setProp((p: ButtonProps) => (p.href = e.target.value))}
              placeholder="https://example.com"
            />
          </div>

          {/* Target */}
          {props.href && (
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
          )}
        </AccordionContent>
      </AccordionItem>

      {/* Style Section */}
      <AccordionItem value="style">
        <AccordionTrigger className="text-sm">Custom Style</AccordionTrigger>
        <AccordionContent className="space-y-4">
          {/* Background Color */}
          <div className="space-y-2">
            <Label className="text-xs">Background Color (overrides variant)</Label>
            <ColorInput
              value={props.backgroundColor || ''}
              onChange={(value) => setProp((p: ButtonProps) => (p.backgroundColor = value))}
            />
          </div>

          {/* Text Color */}
          <div className="space-y-2">
            <Label className="text-xs">Text Color (overrides variant)</Label>
            <ColorInput
              value={props.textColor || ''}
              onChange={(value) => setProp((p: ButtonProps) => (p.textColor = value))}
            />
          </div>

          {/* Border Radius */}
          <div className="space-y-2">
            <Label className="text-xs">Border Radius ({props.borderRadius || 0}px)</Label>
            <Slider
              value={[props.borderRadius || 0]}
              onValueChange={([value]) => setProp((p: ButtonProps) => (p.borderRadius = value))}
              min={0}
              max={24}
              step={2}
            />
          </div>

          {/* Custom Classes */}
          <div className="space-y-2">
            <Label className="text-xs">Custom Classes</Label>
            <Input
              value={props.className || ''}
              onChange={(e) => setProp((p: ButtonProps) => (p.className = e.target.value))}
              placeholder="Enter Tailwind classes..."
            />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
