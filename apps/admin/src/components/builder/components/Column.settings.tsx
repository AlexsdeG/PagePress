// PagePress v0.0.6 - 2025-12-03
// Column component settings panel

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
import { WidthInput } from '../inspector/inputs/WidthInput';
import type { ColumnProps } from './Column';

/**
 * Settings panel for Column component
 */
export function ColumnSettings() {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as ColumnProps,
  }));

  return (
    <Accordion type="multiple" defaultValue={['layout', 'spacing', 'style']} className="w-full">
      {/* Layout Section */}
      <AccordionItem value="layout">
        <AccordionTrigger className="text-sm">Layout</AccordionTrigger>
        <AccordionContent className="space-y-4">
          {/* Width */}
          <WidthInput
            label="Width"
            value={props.width || 'auto'}
            onChange={(value) => setProp((p: ColumnProps) => (p.width = value))}
            allowedUnits={['auto', 'px', '%', 'fr']}
          />

          {/* Min Width */}
          <WidthInput
            label="Min Width"
            value={props.minWidth || '0px'}
            onChange={(value) => setProp((p: ColumnProps) => (p.minWidth = value))}
            allowedUnits={['px', '%', 'rem']}
          />

          {/* Max Width */}
          <WidthInput
            label="Max Width"
            value={props.maxWidth || 'none'}
            onChange={(value) => setProp((p: ColumnProps) => (p.maxWidth = value))}
            allowedUnits={['auto', 'px', '%', 'rem']}
            placeholder="none"
          />

          {/* Order */}
          <div className="space-y-2">
            <Label className="text-xs">Order ({props.order || 0})</Label>
            <Slider
              value={[props.order || 0]}
              onValueChange={([value]) => setProp((p: ColumnProps) => (p.order = value))}
              min={-10}
              max={10}
              step={1}
            />
          </div>

          {/* Align Self */}
          <div className="space-y-2">
            <Label className="text-xs">Align Self</Label>
            <Select
              value={props.alignSelf || 'auto'}
              onValueChange={(value) => setProp((p: ColumnProps) => (p.alignSelf = value as ColumnProps['alignSelf']))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto</SelectItem>
                <SelectItem value="start">Start</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="end">End</SelectItem>
                <SelectItem value="stretch">Stretch</SelectItem>
              </SelectContent>
            </Select>
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
            value={props.padding || '16px'}
            onChange={(value) => setProp((p: ColumnProps) => {
              p.padding = value;
              p.paddingTop = undefined;
              p.paddingRight = undefined;
              p.paddingBottom = undefined;
              p.paddingLeft = undefined;
            })}
            allowedUnits={['px', 'rem', '%']}
          />

          <div className="grid grid-cols-2 gap-2">
            <WidthInput
              label="Top"
              value={props.paddingTop || props.padding || '16px'}
              onChange={(value) => setProp((p: ColumnProps) => (p.paddingTop = value))}
              allowedUnits={['px', 'rem', '%']}
            />
            <WidthInput
              label="Right"
              value={props.paddingRight || props.padding || '16px'}
              onChange={(value) => setProp((p: ColumnProps) => (p.paddingRight = value))}
              allowedUnits={['px', 'rem', '%']}
            />
            <WidthInput
              label="Bottom"
              value={props.paddingBottom || props.padding || '16px'}
              onChange={(value) => setProp((p: ColumnProps) => (p.paddingBottom = value))}
              allowedUnits={['px', 'rem', '%']}
            />
            <WidthInput
              label="Left"
              value={props.paddingLeft || props.padding || '16px'}
              onChange={(value) => setProp((p: ColumnProps) => (p.paddingLeft = value))}
              allowedUnits={['px', 'rem', '%']}
            />
          </div>
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
              onChange={(value) => setProp((p: ColumnProps) => (p.backgroundColor = value))}
            />
          </div>

          {/* Custom Classes */}
          <div className="space-y-2">
            <Label className="text-xs">Custom Classes</Label>
            <Input
              value={props.className || ''}
              onChange={(e) => setProp((p: ColumnProps) => (p.className = e.target.value))}
              placeholder="Enter Tailwind classes..."
            />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
