// PagePress v0.0.6 - 2025-12-03
// Icon component settings panel

import { useNode } from '@craftjs/core';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ColorInput } from '../inspector/inputs/ColorInput';
import { IconPicker } from '../inspector/inputs/IconPicker';
import { WidthInput } from '../inspector/inputs/WidthInput';
import type { IconProps } from './Icon';

/**
 * Settings panel for Icon component
 */
export function IconSettings() {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as IconProps,
  }));

  return (
    <Accordion type="multiple" defaultValue={['icon', 'style']} className="w-full">
      {/* Icon Section */}
      <AccordionItem value="icon">
        <AccordionTrigger className="text-sm">Icon</AccordionTrigger>
        <AccordionContent className="space-y-4">
          {/* Icon Picker */}
          <IconPicker
            value={props.iconName || 'Star'}
            onChange={(value) => setProp((p: IconProps) => (p.iconName = value))}
            label="Select Icon"
          />

          {/* Size */}
          <WidthInput
            label="Size"
            value={props.size || '24px'}
            onChange={(value) => setProp((p: IconProps) => (p.size = value))}
            allowedUnits={['px', 'rem']}
            min={12}
            max={128}
          />

          {/* Stroke Width */}
          <div className="space-y-2">
            <Label className="text-xs">Stroke Width ({props.strokeWidth || 2})</Label>
            <Slider
              value={[props.strokeWidth || 2]}
              onValueChange={([value]) => setProp((p: IconProps) => (p.strokeWidth = value))}
              min={0.5}
              max={4}
              step={0.5}
            />
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
              value={props.color || '#000000'}
              onChange={(value) => setProp((p: IconProps) => (p.color = value))}
            />
          </div>

          {/* Custom Classes */}
          <div className="space-y-2">
            <Label className="text-xs">Custom Classes</Label>
            <Input
              value={props.className || ''}
              onChange={(e) => setProp((p: IconProps) => (p.className = e.target.value))}
              placeholder="Enter Tailwind classes..."
            />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
