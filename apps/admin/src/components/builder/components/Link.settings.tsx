// PagePress v0.0.6 - 2025-12-03
// Link component settings panel

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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ColorInput } from '../inspector/inputs/ColorInput';
import { WidthInput } from '../inspector/inputs/WidthInput';
import type { LinkProps } from './Link';

/**
 * Settings panel for Link component
 */
export function LinkSettings() {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as LinkProps,
  }));

  return (
    <Accordion type="multiple" defaultValue={['content', 'link', 'style']} className="w-full">
      {/* Content Section */}
      <AccordionItem value="content">
        <AccordionTrigger className="text-sm">Content</AccordionTrigger>
        <AccordionContent className="space-y-4">
          {/* Text */}
          <div className="space-y-2">
            <Label className="text-xs">Link Text</Label>
            <Input
              value={props.text || ''}
              onChange={(e) => setProp((p: LinkProps) => (p.text = e.target.value))}
              placeholder="Click here"
            />
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Link Section */}
      <AccordionItem value="link">
        <AccordionTrigger className="text-sm">Link</AccordionTrigger>
        <AccordionContent className="space-y-4">
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
        </AccordionContent>
      </AccordionItem>

      {/* Style Section */}
      <AccordionItem value="style">
        <AccordionTrigger className="text-sm">Style</AccordionTrigger>
        <AccordionContent className="space-y-4">
          {/* Color */}
          <div className="space-y-2">
            <Label className="text-xs">Color</Label>
            <ColorInput
              value={props.color || '#3b82f6'}
              onChange={(value) => setProp((p: LinkProps) => (p.color = value))}
            />
          </div>

          {/* Hover Color */}
          <div className="space-y-2">
            <Label className="text-xs">Hover Color</Label>
            <ColorInput
              value={props.hoverColor || '#2563eb'}
              onChange={(value) => setProp((p: LinkProps) => (p.hoverColor = value))}
            />
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

          {/* Font Size */}
          <WidthInput
            label="Font Size"
            value={props.fontSize || '16px'}
            onChange={(value) => setProp((p: LinkProps) => (p.fontSize = value))}
            allowedUnits={['px', 'rem']}
          />

          {/* Font Weight */}
          <div className="space-y-2">
            <Label className="text-xs">Font Weight</Label>
            <Select
              value={props.fontWeight || 'normal'}
              onValueChange={(value) => setProp((p: LinkProps) => (p.fontWeight = value as LinkProps['fontWeight']))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="semibold">Semibold</SelectItem>
                <SelectItem value="bold">Bold</SelectItem>
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
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
