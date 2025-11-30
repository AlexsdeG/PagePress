// PagePress v0.0.5 - 2025-11-30
// Image component settings panel

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
import type { ImageProps } from '../types';

/**
 * Settings panel for Image component
 */
export function ImageSettings() {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as ImageProps,
  }));

  return (
    <Accordion type="multiple" defaultValue={['source', 'dimensions', 'style']} className="w-full">
      {/* Source Section */}
      <AccordionItem value="source">
        <AccordionTrigger className="text-sm">Source</AccordionTrigger>
        <AccordionContent className="space-y-4">
          {/* Image URL */}
          <div className="space-y-2">
            <Label className="text-xs">Image URL</Label>
            <Input
              value={props.src || ''}
              onChange={(e) => setProp((p: ImageProps) => (p.src = e.target.value))}
              placeholder="Enter image URL or select from media..."
            />
          </div>

          {/* Alt Text */}
          <div className="space-y-2">
            <Label className="text-xs">Alt Text</Label>
            <Input
              value={props.alt || ''}
              onChange={(e) => setProp((p: ImageProps) => (p.alt = e.target.value))}
              placeholder="Describe the image..."
            />
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Dimensions Section */}
      <AccordionItem value="dimensions">
        <AccordionTrigger className="text-sm">Dimensions</AccordionTrigger>
        <AccordionContent className="space-y-4">
          {/* Width */}
          <div className="space-y-2">
            <Label className="text-xs">Width</Label>
            <Select
              value={String(props.width || 'full')}
              onValueChange={(value) => {
                if (value === 'auto' || value === 'full') {
                  setProp((p: ImageProps) => (p.width = value));
                } else {
                  setProp((p: ImageProps) => (p.width = Number(value)));
                }
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto</SelectItem>
                <SelectItem value="full">Full Width</SelectItem>
                <SelectItem value="200">200px</SelectItem>
                <SelectItem value="300">300px</SelectItem>
                <SelectItem value="400">400px</SelectItem>
                <SelectItem value="500">500px</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Height */}
          <div className="space-y-2">
            <Label className="text-xs">Height</Label>
            <Select
              value={String(props.height || 'auto')}
              onValueChange={(value) => {
                if (value === 'auto') {
                  setProp((p: ImageProps) => (p.height = value));
                } else {
                  setProp((p: ImageProps) => (p.height = Number(value)));
                }
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto</SelectItem>
                <SelectItem value="100">100px</SelectItem>
                <SelectItem value="200">200px</SelectItem>
                <SelectItem value="300">300px</SelectItem>
                <SelectItem value="400">400px</SelectItem>
                <SelectItem value="500">500px</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Object Fit */}
          <div className="space-y-2">
            <Label className="text-xs">Object Fit</Label>
            <Select
              value={props.objectFit || 'cover'}
              onValueChange={(value) => setProp((p: ImageProps) => (p.objectFit = value as ImageProps['objectFit']))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cover">Cover</SelectItem>
                <SelectItem value="contain">Contain</SelectItem>
                <SelectItem value="fill">Fill</SelectItem>
                <SelectItem value="none">None</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Style Section */}
      <AccordionItem value="style">
        <AccordionTrigger className="text-sm">Style</AccordionTrigger>
        <AccordionContent className="space-y-4">
          {/* Border Radius */}
          <div className="space-y-2">
            <Label className="text-xs">Border Radius ({props.borderRadius || 0}px)</Label>
            <Slider
              value={[props.borderRadius || 0]}
              onValueChange={([value]) => setProp((p: ImageProps) => (p.borderRadius = value))}
              min={0}
              max={50}
              step={2}
            />
          </div>

          {/* Custom Classes */}
          <div className="space-y-2">
            <Label className="text-xs">Custom Classes</Label>
            <Input
              value={props.className || ''}
              onChange={(e) => setProp((p: ImageProps) => (p.className = e.target.value))}
              placeholder="Enter Tailwind classes..."
            />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
