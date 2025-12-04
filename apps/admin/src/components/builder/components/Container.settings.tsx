// PagePress v0.0.9 - 2025-12-04
// Container component settings panel with new ElementSettingsSidebar

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
import { TagSelector } from '../inspector/inputs/TagSelector';
import { ElementSettingsSidebar } from '../inspector/sidebar';
import type { ContainerProps } from '../types';
import type { HtmlTag } from '../inspector/inputs/TagSelector';

/**
 * Content-specific settings for Container
 */
function ContainerContentSettings({
  props,
  setProp,
}: {
  props: ContainerProps;
  setProp: (cb: (props: ContainerProps) => void) => void;
}) {
  return (
    <div className="space-y-4">
      {/* HTML Tag */}
      <TagSelector
        value={(props.htmlTag as HtmlTag) || 'div'}
        onChange={(value: HtmlTag) => setProp((p) => (p.htmlTag = value))}
        label="HTML Tag"
      />

      {/* Display */}
      <div className="space-y-2">
        <Label className="text-xs">Display</Label>
        <Select
          value={props.display || 'flex'}
          onValueChange={(value) => setProp((p) => (p.display = value as ContainerProps['display']))}
        >
          <SelectTrigger className="h-8">
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
            onValueChange={(value) => setProp((p) => (p.flexDirection = value as ContainerProps['flexDirection']))}
          >
            <SelectTrigger className="h-8">
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
            onValueChange={(value) => setProp((p) => (p.justifyContent = value as ContainerProps['justifyContent']))}
          >
            <SelectTrigger className="h-8">
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
            onValueChange={(value) => setProp((p) => (p.alignItems = value as ContainerProps['alignItems']))}
          >
            <SelectTrigger className="h-8">
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
          onValueChange={([value]) => setProp((p) => (p.gap = value))}
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
          onValueChange={(value) => setProp((p) => (p.width = value as ContainerProps['width']))}
        >
          <SelectTrigger className="h-8">
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
          onValueChange={([value]) => setProp((p) => (p.minHeight = value))}
          min={0}
          max={500}
          step={10}
        />
      </div>

      {/* Custom Classes (legacy - now moved to General tab) */}
      <div className="space-y-2">
        <Label className="text-xs">Custom Classes (Tailwind)</Label>
        <Input
          value={props.className || ''}
          onChange={(e) => setProp((p) => (p.className = e.target.value))}
          placeholder="Enter Tailwind classes..."
          className="h-8 text-sm"
        />
      </div>
    </div>
  );
}

/**
 * Settings panel for Container component
 * All style tabs are available by default - no sections config needed
 */
export function ContainerSettings() {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as ContainerProps,
  }));

  return (
    <ElementSettingsSidebar
      contentSettings={
        <ContainerContentSettings
          props={props}
          setProp={setProp}
        />
      }
    />
  );
}
