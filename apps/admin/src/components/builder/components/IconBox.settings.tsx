// PagePress v0.0.6 - 2025-12-03
// IconBox component settings panel

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ColorInput } from '../inspector/inputs/ColorInput';
import { IconPicker } from '../inspector/inputs/IconPicker';
import { WidthInput } from '../inspector/inputs/WidthInput';
import type { IconBoxProps } from './IconBox';

/**
 * Settings panel for IconBox component
 */
export function IconBoxSettings() {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as IconBoxProps,
  }));

  return (
    <Tabs defaultValue="icon" className="w-full">
      <TabsList className="grid grid-cols-3 w-full">
        <TabsTrigger value="icon" className="text-xs">Icon</TabsTrigger>
        <TabsTrigger value="content" className="text-xs">Content</TabsTrigger>
        <TabsTrigger value="layout" className="text-xs">Layout</TabsTrigger>
      </TabsList>

      {/* Icon Tab */}
      <TabsContent value="icon" className="space-y-4 mt-4">
        {/* Icon Picker */}
        <IconPicker
          value={props.iconName || 'Star'}
          onChange={(value) => setProp((p: IconBoxProps) => (p.iconName = value))}
          label="Select Icon"
        />

        {/* Icon Size */}
        <WidthInput
          label="Icon Size"
          value={props.iconSize || '48px'}
          onChange={(value) => setProp((p: IconBoxProps) => (p.iconSize = value))}
          allowedUnits={['px', 'rem']}
          min={16}
          max={128}
        />

        {/* Icon Color */}
        <div className="space-y-2">
          <Label className="text-xs">Icon Color</Label>
          <ColorInput
            value={props.iconColor || '#3b82f6'}
            onChange={(value) => setProp((p: IconBoxProps) => (p.iconColor = value))}
          />
        </div>
      </TabsContent>

      {/* Content Tab */}
      <TabsContent value="content" className="space-y-4 mt-4">
        {/* Heading */}
        <div className="space-y-2">
          <Label className="text-xs">Heading</Label>
          <Input
            value={props.heading || ''}
            onChange={(e) => setProp((p: IconBoxProps) => (p.heading = e.target.value))}
            placeholder="Feature Title"
          />
        </div>

        {/* Heading Tag */}
        <div className="space-y-2">
          <Label className="text-xs">Heading Tag</Label>
          <Select
            value={props.headingTag || 'h3'}
            onValueChange={(value) => setProp((p: IconBoxProps) => (p.headingTag = value as IconBoxProps['headingTag']))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="h2">H2</SelectItem>
              <SelectItem value="h3">H3</SelectItem>
              <SelectItem value="h4">H4</SelectItem>
              <SelectItem value="h5">H5</SelectItem>
              <SelectItem value="h6">H6</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Heading Color */}
        <div className="space-y-2">
          <Label className="text-xs">Heading Color</Label>
          <ColorInput
            value={props.headingColor || '#000000'}
            onChange={(value) => setProp((p: IconBoxProps) => (p.headingColor = value))}
          />
        </div>

        {/* Text */}
        <div className="space-y-2">
          <Label className="text-xs">Description</Label>
          <Input
            value={props.text || ''}
            onChange={(e) => setProp((p: IconBoxProps) => (p.text = e.target.value))}
            placeholder="Add description..."
          />
        </div>

        {/* Text Color */}
        <div className="space-y-2">
          <Label className="text-xs">Text Color</Label>
          <ColorInput
            value={props.textColor || '#6b7280'}
            onChange={(value) => setProp((p: IconBoxProps) => (p.textColor = value))}
          />
        </div>
      </TabsContent>

      {/* Layout Tab */}
      <TabsContent value="layout" className="space-y-4 mt-4">
        {/* Layout */}
        <div className="space-y-2">
          <Label className="text-xs">Layout</Label>
          <Select
            value={props.layout || 'top'}
            onValueChange={(value) => setProp((p: IconBoxProps) => (p.layout = value as IconBoxProps['layout']))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="top">Icon on Top</SelectItem>
              <SelectItem value="left">Icon on Left</SelectItem>
              <SelectItem value="right">Icon on Right</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Gap */}
        <WidthInput
          label="Gap"
          value={props.gap || '16px'}
          onChange={(value) => setProp((p: IconBoxProps) => (p.gap = value))}
          allowedUnits={['px', 'rem']}
        />

        {/* Padding */}
        <WidthInput
          label="Padding"
          value={props.padding || '24px'}
          onChange={(value) => setProp((p: IconBoxProps) => (p.padding = value))}
          allowedUnits={['px', 'rem']}
        />

        {/* Background Color */}
        <div className="space-y-2">
          <Label className="text-xs">Background Color</Label>
          <ColorInput
            value={props.backgroundColor || 'transparent'}
            onChange={(value) => setProp((p: IconBoxProps) => (p.backgroundColor = value))}
          />
        </div>

        {/* Custom Classes */}
        <div className="space-y-2">
          <Label className="text-xs">Custom Classes</Label>
          <Input
            value={props.className || ''}
            onChange={(e) => setProp((p: IconBoxProps) => (p.className = e.target.value))}
            placeholder="Enter Tailwind classes..."
          />
        </div>
      </TabsContent>
    </Tabs>
  );
}
