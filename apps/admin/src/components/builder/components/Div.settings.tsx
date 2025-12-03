// PagePress v0.0.6 - 2025-12-03
// Div component settings panel

import { useNode } from '@craftjs/core';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ColorInput } from '../inspector/inputs/ColorInput';
import { WidthInput } from '../inspector/inputs/WidthInput';
import { TagSelector } from '../inspector/inputs/TagSelector';
import type { DivProps } from './Div';
import type { HtmlTag } from '../inspector/inputs/TagSelector';

/**
 * Settings panel for Div component
 */
export function DivSettings() {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as DivProps,
  }));

  return (
    <Accordion type="multiple" defaultValue={['element', 'spacing', 'style']} className="w-full">
      {/* Element Section */}
      <AccordionItem value="element">
        <AccordionTrigger className="text-sm">Element</AccordionTrigger>
        <AccordionContent className="space-y-4">
          {/* HTML Tag */}
          <TagSelector
            value={props.htmlTag || 'div'}
            onChange={(value: HtmlTag) => setProp((p: DivProps) => (p.htmlTag = value))}
            label="HTML Tag"
          />
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
            onChange={(value) => setProp((p: DivProps) => {
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
              onChange={(value) => setProp((p: DivProps) => (p.paddingTop = value))}
              allowedUnits={['px', 'rem', '%']}
            />
            <WidthInput
              label="Right"
              value={props.paddingRight || props.padding || '16px'}
              onChange={(value) => setProp((p: DivProps) => (p.paddingRight = value))}
              allowedUnits={['px', 'rem', '%']}
            />
            <WidthInput
              label="Bottom"
              value={props.paddingBottom || props.padding || '16px'}
              onChange={(value) => setProp((p: DivProps) => (p.paddingBottom = value))}
              allowedUnits={['px', 'rem', '%']}
            />
            <WidthInput
              label="Left"
              value={props.paddingLeft || props.padding || '16px'}
              onChange={(value) => setProp((p: DivProps) => (p.paddingLeft = value))}
              allowedUnits={['px', 'rem', '%']}
            />
          </div>

          {/* Margin */}
          <WidthInput
            label="Margin"
            value={props.margin || '0px'}
            onChange={(value) => setProp((p: DivProps) => (p.margin = value))}
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
              onChange={(value) => setProp((p: DivProps) => (p.backgroundColor = value))}
            />
          </div>

          {/* Custom Classes */}
          <div className="space-y-2">
            <Label className="text-xs">Custom Classes</Label>
            <Input
              value={props.className || ''}
              onChange={(e) => setProp((p: DivProps) => (p.className = e.target.value))}
              placeholder="Enter Tailwind classes..."
            />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
