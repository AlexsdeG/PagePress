// PagePress v0.0.6 - 2025-12-03
// Row component settings panel

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
import type { RowProps } from './Row';

/**
 * Settings panel for Row component
 */
export function RowSettings() {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as RowProps,
  }));

  return (
    <Accordion type="multiple" defaultValue={['layout', 'spacing', 'style']} className="w-full">
      {/* Layout Section */}
      <AccordionItem value="layout">
        <AccordionTrigger className="text-sm">Layout</AccordionTrigger>
        <AccordionContent className="space-y-4">
          {/* Gap */}
          <WidthInput
            label="Gap"
            value={props.gap || '16px'}
            onChange={(value) => setProp((p: RowProps) => (p.gap = value))}
            allowedUnits={['px', 'rem', '%']}
          />

          {/* Justify Content */}
          <div className="space-y-2">
            <Label className="text-xs">Justify Content</Label>
            <Select
              value={props.justifyContent || 'start'}
              onValueChange={(value) => setProp((p: RowProps) => (p.justifyContent = value as RowProps['justifyContent']))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="start">Start</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="end">End</SelectItem>
                <SelectItem value="between">Space Between</SelectItem>
                <SelectItem value="around">Space Around</SelectItem>
                <SelectItem value="evenly">Space Evenly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Align Items */}
          <div className="space-y-2">
            <Label className="text-xs">Align Items</Label>
            <Select
              value={props.alignItems || 'stretch'}
              onValueChange={(value) => setProp((p: RowProps) => (p.alignItems = value as RowProps['alignItems']))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="start">Start</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="end">End</SelectItem>
                <SelectItem value="stretch">Stretch</SelectItem>
                <SelectItem value="baseline">Baseline</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Wrap */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="wrap"
              checked={props.wrap ?? true}
              onChange={(e) => setProp((p: RowProps) => (p.wrap = e.target.checked))}
              className="rounded border-gray-300"
            />
            <Label htmlFor="wrap" className="text-xs">Wrap Items</Label>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Spacing Section */}
      <AccordionItem value="spacing">
        <AccordionTrigger className="text-sm">Spacing</AccordionTrigger>
        <AccordionContent className="space-y-4">
          {/* Padding */}
          <WidthInput
            label="Padding"
            value={props.padding || '0px'}
            onChange={(value) => setProp((p: RowProps) => {
              p.padding = value;
              p.paddingTop = undefined;
              p.paddingRight = undefined;
              p.paddingBottom = undefined;
              p.paddingLeft = undefined;
            })}
            allowedUnits={['px', 'rem', '%']}
          />

          {/* Margin */}
          <WidthInput
            label="Margin"
            value={props.margin || '0px'}
            onChange={(value) => setProp((p: RowProps) => (p.margin = value))}
            allowedUnits={['px', 'rem', '%', 'auto']}
          />
        </AccordionContent>
      </AccordionItem>

      {/* Style Section */}
      <AccordionItem value="style">
        <AccordionTrigger className="text-sm">Style</AccordionTrigger>
        <AccordionContent className="space-y-4">
          {/* Background Color */}
          <div className="space-y-2">
            <Label className="text-xs">Background Color</Label>
            <ColorInput
              value={props.backgroundColor || 'transparent'}
              onChange={(value) => setProp((p: RowProps) => (p.backgroundColor = value))}
            />
          </div>

          {/* Custom Classes */}
          <div className="space-y-2">
            <Label className="text-xs">Custom Classes</Label>
            <Input
              value={props.className || ''}
              onChange={(e) => setProp((p: RowProps) => (p.className = e.target.value))}
              placeholder="Enter Tailwind classes..."
            />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
