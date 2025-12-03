// PagePress v0.0.6 - 2025-12-03
// Spacer component settings panel

import { useNode } from '@craftjs/core';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { WidthInput } from '../inspector/inputs/WidthInput';
import type { SpacerProps } from './Spacer';

/**
 * Settings panel for Spacer component
 */
export function SpacerSettings() {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as SpacerProps,
  }));

  return (
    <Accordion type="multiple" defaultValue={['size']} className="w-full">
      {/* Size Section */}
      <AccordionItem value="size">
        <AccordionTrigger className="text-sm">Size</AccordionTrigger>
        <AccordionContent className="space-y-4">
          {/* Height */}
          <WidthInput
            label="Height"
            value={props.height || '40px'}
            onChange={(value) => setProp((p: SpacerProps) => (p.height = value))}
            allowedUnits={['px', 'vh', 'rem']}
          />

          {/* Custom Classes */}
          <div className="space-y-2">
            <Label className="text-xs">Custom Classes</Label>
            <Input
              value={props.className || ''}
              onChange={(e) => setProp((p: SpacerProps) => (p.className = e.target.value))}
              placeholder="Enter Tailwind classes..."
            />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
