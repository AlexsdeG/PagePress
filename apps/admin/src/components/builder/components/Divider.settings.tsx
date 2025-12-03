// PagePress v0.0.6 - 2025-12-03
// Divider component settings panel

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
import type { DividerProps } from './Divider';

/**
 * Settings panel for Divider component
 */
export function DividerSettings() {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as DividerProps,
  }));

  return (
    <Accordion type="multiple" defaultValue={['appearance', 'spacing']} className="w-full">
      {/* Appearance Section */}
      <AccordionItem value="appearance">
        <AccordionTrigger className="text-sm">Appearance</AccordionTrigger>
        <AccordionContent className="space-y-4">
          {/* Style */}
          <div className="space-y-2">
            <Label className="text-xs">Style</Label>
            <Select
              value={props.style || 'solid'}
              onValueChange={(value) => setProp((p: DividerProps) => (p.style = value as DividerProps['style']))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="solid">Solid</SelectItem>
                <SelectItem value="dashed">Dashed</SelectItem>
                <SelectItem value="dotted">Dotted</SelectItem>
                <SelectItem value="double">Double</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Width */}
          <WidthInput
            label="Width"
            value={props.width || '100%'}
            onChange={(value) => setProp((p: DividerProps) => (p.width = value))}
            allowedUnits={['%', 'px', 'rem']}
          />

          {/* Thickness */}
          <div className="space-y-2">
            <Label className="text-xs">Thickness</Label>
            <Select
              value={props.thickness || '1px'}
              onValueChange={(value) => setProp((p: DividerProps) => (p.thickness = value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1px">1px</SelectItem>
                <SelectItem value="2px">2px</SelectItem>
                <SelectItem value="3px">3px</SelectItem>
                <SelectItem value="4px">4px</SelectItem>
                <SelectItem value="5px">5px</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label className="text-xs">Color</Label>
            <ColorInput
              value={props.color || '#e5e7eb'}
              onChange={(value) => setProp((p: DividerProps) => (p.color = value))}
            />
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Spacing Section */}
      <AccordionItem value="spacing">
        <AccordionTrigger className="text-sm">Spacing</AccordionTrigger>
        <AccordionContent className="space-y-4">
          {/* Margin */}
          <WidthInput
            label="Vertical Margin"
            value={props.margin || '16px'}
            onChange={(value) => setProp((p: DividerProps) => (p.margin = value))}
            allowedUnits={['px', 'rem', '%']}
          />

          {/* Custom Classes */}
          <div className="space-y-2">
            <Label className="text-xs">Custom Classes</Label>
            <Input
              value={props.className || ''}
              onChange={(e) => setProp((p: DividerProps) => (p.className = e.target.value))}
              placeholder="Enter Tailwind classes..."
            />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
