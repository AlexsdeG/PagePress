// PagePress v0.0.6 - 2025-12-03
// Section component settings panel

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
import type { SectionProps } from './Section';

/**
 * Settings panel for Section component
 */
export function SectionSettings() {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as SectionProps,
  }));

  return (
    <Accordion type="multiple" defaultValue={['layout', 'spacing', 'style']} className="w-full">
      {/* Layout Section */}
      <AccordionItem value="layout">
        <AccordionTrigger className="text-sm">Layout</AccordionTrigger>
        <AccordionContent className="space-y-4">
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
        </AccordionContent>
      </AccordionItem>

      {/* Spacing Section */}
      <AccordionItem value="spacing">
        <AccordionTrigger className="text-sm">Spacing</AccordionTrigger>
        <AccordionContent className="space-y-4">
          {/* Padding */}
          <WidthInput
            label="Padding (All)"
            value={props.padding || '40px'}
            onChange={(value) => setProp((p: SectionProps) => {
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
              value={props.paddingTop || props.padding || '40px'}
              onChange={(value) => setProp((p: SectionProps) => (p.paddingTop = value))}
              allowedUnits={['px', 'rem', '%']}
            />
            <WidthInput
              label="Right"
              value={props.paddingRight || props.padding || '40px'}
              onChange={(value) => setProp((p: SectionProps) => (p.paddingRight = value))}
              allowedUnits={['px', 'rem', '%']}
            />
            <WidthInput
              label="Bottom"
              value={props.paddingBottom || props.padding || '40px'}
              onChange={(value) => setProp((p: SectionProps) => (p.paddingBottom = value))}
              allowedUnits={['px', 'rem', '%']}
            />
            <WidthInput
              label="Left"
              value={props.paddingLeft || props.padding || '40px'}
              onChange={(value) => setProp((p: SectionProps) => (p.paddingLeft = value))}
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
              onChange={(value) => setProp((p: SectionProps) => (p.backgroundColor = value))}
            />
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
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
