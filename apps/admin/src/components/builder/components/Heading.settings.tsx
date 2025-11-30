// PagePress v0.0.5 - 2025-11-30
// Heading component settings panel

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
import type { HeadingProps } from '../types';

/**
 * Default font sizes for each heading level
 */
const defaultFontSizes: Record<number, number> = {
  1: 36,
  2: 30,
  3: 24,
  4: 20,
  5: 18,
  6: 16,
};

/**
 * Settings panel for Heading component
 */
export function HeadingSettings() {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as HeadingProps,
  }));

  const currentFontSize = props.fontSize ?? defaultFontSizes[props.level ?? 2];

  return (
    <Accordion type="multiple" defaultValue={['content', 'typography', 'style']} className="w-full">
      {/* Content Section */}
      <AccordionItem value="content">
        <AccordionTrigger className="text-sm">Content</AccordionTrigger>
        <AccordionContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs">Text</Label>
            <Input
              value={props.text || ''}
              onChange={(e) => setProp((p: HeadingProps) => (p.text = e.target.value))}
              placeholder="Enter heading text..."
            />
          </div>

          {/* Heading Level */}
          <div className="space-y-2">
            <Label className="text-xs">Heading Level</Label>
            <Select
              value={String(props.level || 2)}
              onValueChange={(value) => setProp((p: HeadingProps) => (p.level = Number(value) as HeadingProps['level']))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">H1</SelectItem>
                <SelectItem value="2">H2</SelectItem>
                <SelectItem value="3">H3</SelectItem>
                <SelectItem value="4">H4</SelectItem>
                <SelectItem value="5">H5</SelectItem>
                <SelectItem value="6">H6</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Typography Section */}
      <AccordionItem value="typography">
        <AccordionTrigger className="text-sm">Typography</AccordionTrigger>
        <AccordionContent className="space-y-4">
          {/* Font Size */}
          <div className="space-y-2">
            <Label className="text-xs">Font Size ({currentFontSize}px)</Label>
            <Slider
              value={[currentFontSize]}
              onValueChange={([value]) => setProp((p: HeadingProps) => (p.fontSize = value))}
              min={12}
              max={96}
              step={1}
            />
          </div>

          {/* Font Weight */}
          <div className="space-y-2">
            <Label className="text-xs">Font Weight</Label>
            <Select
              value={props.fontWeight || 'bold'}
              onValueChange={(value) => setProp((p: HeadingProps) => (p.fontWeight = value as HeadingProps['fontWeight']))}
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

          {/* Text Align */}
          <div className="space-y-2">
            <Label className="text-xs">Text Align</Label>
            <Select
              value={props.textAlign || 'left'}
              onValueChange={(value) => setProp((p: HeadingProps) => (p.textAlign = value as HeadingProps['textAlign']))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Style Section */}
      <AccordionItem value="style">
        <AccordionTrigger className="text-sm">Style</AccordionTrigger>
        <AccordionContent className="space-y-4">
          {/* Text Color */}
          <div className="space-y-2">
            <Label className="text-xs">Text Color</Label>
            <ColorInput
              value={props.color || '#000000'}
              onChange={(value) => setProp((p: HeadingProps) => (p.color = value))}
            />
          </div>

          {/* Custom Classes */}
          <div className="space-y-2">
            <Label className="text-xs">Custom Classes</Label>
            <Input
              value={props.className || ''}
              onChange={(e) => setProp((p: HeadingProps) => (p.className = e.target.value))}
              placeholder="Enter Tailwind classes..."
            />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
