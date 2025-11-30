// PagePress v0.0.5 - 2025-11-30
// Container component settings panel

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
import { SpacingInput } from '../inspector/inputs/SpacingInput';
import type { ContainerProps } from '../types';

/**
 * Settings panel for Container component
 */
export function ContainerSettings() {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as ContainerProps,
  }));

  return (
    <Accordion type="multiple" defaultValue={['layout', 'spacing', 'style']} className="w-full">
      {/* Layout Section */}
      <AccordionItem value="layout">
        <AccordionTrigger className="text-sm">Layout</AccordionTrigger>
        <AccordionContent className="space-y-4">
          {/* Display */}
          <div className="space-y-2">
            <Label className="text-xs">Display</Label>
            <Select
              value={props.display || 'flex'}
              onValueChange={(value) => setProp((p: ContainerProps) => (p.display = value as ContainerProps['display']))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="block">Block</SelectItem>
                <SelectItem value="flex">Flex</SelectItem>
                <SelectItem value="grid">Grid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Flex Direction (only show for flex) */}
          {props.display === 'flex' && (
            <div className="space-y-2">
              <Label className="text-xs">Direction</Label>
              <Select
                value={props.flexDirection || 'column'}
                onValueChange={(value) => setProp((p: ContainerProps) => (p.flexDirection = value as ContainerProps['flexDirection']))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="row">Row</SelectItem>
                  <SelectItem value="column">Column</SelectItem>
                  <SelectItem value="row-reverse">Row Reverse</SelectItem>
                  <SelectItem value="column-reverse">Column Reverse</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Justify Content (only show for flex) */}
          {props.display === 'flex' && (
            <div className="space-y-2">
              <Label className="text-xs">Justify Content</Label>
              <Select
                value={props.justifyContent || 'start'}
                onValueChange={(value) => setProp((p: ContainerProps) => (p.justifyContent = value as ContainerProps['justifyContent']))}
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
          )}

          {/* Align Items (only show for flex) */}
          {props.display === 'flex' && (
            <div className="space-y-2">
              <Label className="text-xs">Align Items</Label>
              <Select
                value={props.alignItems || 'stretch'}
                onValueChange={(value) => setProp((p: ContainerProps) => (p.alignItems = value as ContainerProps['alignItems']))}
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
          )}

          {/* Gap */}
          <div className="space-y-2">
            <Label className="text-xs">Gap ({props.gap || 0}px)</Label>
            <Slider
              value={[props.gap || 0]}
              onValueChange={([value]) => setProp((p: ContainerProps) => (p.gap = value))}
              min={0}
              max={64}
              step={4}
            />
          </div>

          {/* Width */}
          <div className="space-y-2">
            <Label className="text-xs">Width</Label>
            <Select
              value={props.width || 'full'}
              onValueChange={(value) => setProp((p: ContainerProps) => (p.width = value as ContainerProps['width']))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto</SelectItem>
                <SelectItem value="full">Full</SelectItem>
                <SelectItem value="fit">Fit Content</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Min Height */}
          <div className="space-y-2">
            <Label className="text-xs">Min Height ({props.minHeight || 0}px)</Label>
            <Slider
              value={[props.minHeight || 0]}
              onValueChange={([value]) => setProp((p: ContainerProps) => (p.minHeight = value))}
              min={0}
              max={500}
              step={10}
            />
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Spacing Section */}
      <AccordionItem value="spacing">
        <AccordionTrigger className="text-sm">Spacing</AccordionTrigger>
        <AccordionContent className="space-y-4">
          {/* Padding */}
          <div className="space-y-2">
            <Label className="text-xs">Padding</Label>
            <SpacingInput
              value={{
                top: props.paddingTop ?? props.padding ?? 0,
                right: props.paddingRight ?? props.padding ?? 0,
                bottom: props.paddingBottom ?? props.padding ?? 0,
                left: props.paddingLeft ?? props.padding ?? 0,
              }}
              onChange={(value) => {
                setProp((p: ContainerProps) => {
                  p.paddingTop = value.top;
                  p.paddingRight = value.right;
                  p.paddingBottom = value.bottom;
                  p.paddingLeft = value.left;
                });
              }}
            />
          </div>

          {/* Margin */}
          <div className="space-y-2">
            <Label className="text-xs">Margin</Label>
            <SpacingInput
              value={{
                top: props.marginTop ?? props.margin ?? 0,
                right: props.marginRight ?? props.margin ?? 0,
                bottom: props.marginBottom ?? props.margin ?? 0,
                left: props.marginLeft ?? props.margin ?? 0,
              }}
              onChange={(value) => {
                setProp((p: ContainerProps) => {
                  p.marginTop = value.top;
                  p.marginRight = value.right;
                  p.marginBottom = value.bottom;
                  p.marginLeft = value.left;
                });
              }}
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
              onChange={(value) => setProp((p: ContainerProps) => (p.backgroundColor = value))}
            />
          </div>

          {/* Border Radius */}
          <div className="space-y-2">
            <Label className="text-xs">Border Radius ({props.borderRadius || 0}px)</Label>
            <Slider
              value={[props.borderRadius || 0]}
              onValueChange={([value]) => setProp((p: ContainerProps) => (p.borderRadius = value))}
              min={0}
              max={32}
              step={2}
            />
          </div>

          {/* Border Width */}
          <div className="space-y-2">
            <Label className="text-xs">Border Width ({props.borderWidth || 0}px)</Label>
            <Slider
              value={[props.borderWidth || 0]}
              onValueChange={([value]) => setProp((p: ContainerProps) => (p.borderWidth = value))}
              min={0}
              max={8}
              step={1}
            />
          </div>

          {/* Border Color */}
          {(props.borderWidth ?? 0) > 0 && (
            <div className="space-y-2">
              <Label className="text-xs">Border Color</Label>
              <ColorInput
                value={props.borderColor || '#e5e7eb'}
                onChange={(value) => setProp((p: ContainerProps) => (p.borderColor = value))}
              />
            </div>
          )}

          {/* Custom Classes */}
          <div className="space-y-2">
            <Label className="text-xs">Custom Classes</Label>
            <Input
              value={props.className || ''}
              onChange={(e) => setProp((p: ContainerProps) => (p.className = e.target.value))}
              placeholder="Enter Tailwind classes..."
            />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
