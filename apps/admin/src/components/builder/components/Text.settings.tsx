// PagePress v0.0.5 - 2025-11-30
// Text component settings panel

import { useNode } from '@craftjs/core';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import type { TextProps } from '../types';

/**
 * Settings panel for Text component
 */
export function TextSettings() {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as TextProps,
  }));

  return (
    <Accordion type="multiple" defaultValue={['content', 'typography', 'style']} className="w-full">
      {/* Content Section */}
      <AccordionItem value="content">
        <AccordionTrigger className="text-sm">Content</AccordionTrigger>
        <AccordionContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs">Text</Label>
            <Textarea
              value={props.text || ''}
              onChange={(e) => setProp((p: TextProps) => (p.text = e.target.value))}
              placeholder="Enter text..."
              rows={4}
            />
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Typography Section */}
      <AccordionItem value="typography">
        <AccordionTrigger className="text-sm">Typography</AccordionTrigger>
        <AccordionContent className="space-y-4">
          {/* Font Size */}
          <div className="space-y-2">
            <Label className="text-xs">Font Size ({props.fontSize || 16}px)</Label>
            <Slider
              value={[props.fontSize || 16]}
              onValueChange={([value]) => setProp((p: TextProps) => (p.fontSize = value))}
              min={10}
              max={72}
              step={1}
            />
          </div>

          {/* Font Weight */}
          <div className="space-y-2">
            <Label className="text-xs">Font Weight</Label>
            <Select
              value={props.fontWeight || 'normal'}
              onValueChange={(value) => setProp((p: TextProps) => (p.fontWeight = value as TextProps['fontWeight']))}
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
              onValueChange={(value) => setProp((p: TextProps) => (p.textAlign = value as TextProps['textAlign']))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="right">Right</SelectItem>
                <SelectItem value="justify">Justify</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Line Height */}
          <div className="space-y-2">
            <Label className="text-xs">Line Height ({props.lineHeight || 1.5})</Label>
            <Slider
              value={[props.lineHeight || 1.5]}
              onValueChange={([value]) => setProp((p: TextProps) => (p.lineHeight = value))}
              min={1}
              max={3}
              step={0.1}
            />
          </div>

          {/* Letter Spacing */}
          <div className="space-y-2">
            <Label className="text-xs">Letter Spacing ({props.letterSpacing || 0}px)</Label>
            <Slider
              value={[props.letterSpacing || 0]}
              onValueChange={([value]) => setProp((p: TextProps) => (p.letterSpacing = value))}
              min={-2}
              max={10}
              step={0.5}
            />
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
              onChange={(value) => setProp((p: TextProps) => (p.color = value))}
            />
          </div>

          {/* Custom Classes */}
          <div className="space-y-2">
            <Label className="text-xs">Custom Classes</Label>
            <Input
              value={props.className || ''}
              onChange={(e) => setProp((p: TextProps) => (p.className = e.target.value))}
              placeholder="Enter Tailwind classes..."
            />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
