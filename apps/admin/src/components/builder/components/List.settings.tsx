// PagePress v0.0.6 - 2025-12-03
// List component settings panel

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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ColorInput } from '../inspector/inputs/ColorInput';
import { WidthInput } from '../inspector/inputs/WidthInput';
import type { ListProps } from './List';

/**
 * Settings panel for List component
 */
export function ListSettings() {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as ListProps,
  }));

  // Convert items array to text for editing
  const itemsText = (props.items || []).join('\n');

  // Handle items text change
  const handleItemsChange = (text: string) => {
    const items = text.split('\n').filter((item) => item.trim() !== '');
    setProp((p: ListProps) => (p.items = items.length > 0 ? items : ['Item']));
  };

  // Get available bullet styles based on list type
  const getBulletStyles = () => {
    if (props.listType === 'ol') {
      return [
        { value: 'decimal', label: '1, 2, 3' },
        { value: 'alpha', label: 'a, b, c' },
        { value: 'roman', label: 'i, ii, iii' },
        { value: 'none', label: 'None' },
      ];
    }
    return [
      { value: 'disc', label: '● Disc' },
      { value: 'circle', label: '○ Circle' },
      { value: 'square', label: '■ Square' },
      { value: 'none', label: 'None' },
    ];
  };

  return (
    <Accordion type="multiple" defaultValue={['content', 'style', 'typography']} className="w-full">
      {/* Content Section */}
      <AccordionItem value="content">
        <AccordionTrigger className="text-sm">Content</AccordionTrigger>
        <AccordionContent className="space-y-4">
          {/* List Type */}
          <div className="space-y-2">
            <Label className="text-xs">List Type</Label>
            <Select
              value={props.listType || 'ul'}
              onValueChange={(value) => {
                setProp((p: ListProps) => {
                  p.listType = value as ListProps['listType'];
                  // Reset bullet style when changing list type
                  if (value === 'ol') {
                    p.bulletStyle = 'decimal';
                  } else {
                    p.bulletStyle = 'disc';
                  }
                });
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ul">Unordered (Bullets)</SelectItem>
                <SelectItem value="ol">Ordered (Numbers)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bullet Style */}
          <div className="space-y-2">
            <Label className="text-xs">Bullet Style</Label>
            <Select
              value={props.bulletStyle || 'disc'}
              onValueChange={(value) => setProp((p: ListProps) => (p.bulletStyle = value as ListProps['bulletStyle']))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {getBulletStyles().map((style) => (
                  <SelectItem key={style.value} value={style.value}>
                    {style.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Items */}
          <div className="space-y-2">
            <Label className="text-xs">Items (one per line)</Label>
            <Textarea
              value={itemsText}
              onChange={(e) => handleItemsChange(e.target.value)}
              placeholder="Enter list items..."
              rows={5}
            />
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Typography Section */}
      <AccordionItem value="typography">
        <AccordionTrigger className="text-sm">Typography</AccordionTrigger>
        <AccordionContent className="space-y-4">
          {/* Color */}
          <div className="space-y-2">
            <Label className="text-xs">Color</Label>
            <ColorInput
              value={props.color || '#000000'}
              onChange={(value) => setProp((p: ListProps) => (p.color = value))}
            />
          </div>

          {/* Font Size */}
          <WidthInput
            label="Font Size"
            value={props.fontSize || '16px'}
            onChange={(value) => setProp((p: ListProps) => (p.fontSize = value))}
            allowedUnits={['px', 'rem']}
          />

          {/* Line Height */}
          <div className="space-y-2">
            <Label className="text-xs">Line Height</Label>
            <Input
              type="number"
              value={parseFloat(props.lineHeight || '1.6')}
              onChange={(e) => setProp((p: ListProps) => (p.lineHeight = e.target.value))}
              min={1}
              max={3}
              step={0.1}
            />
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Style Section */}
      <AccordionItem value="style">
        <AccordionTrigger className="text-sm">Style</AccordionTrigger>
        <AccordionContent className="space-y-4">
          {/* Gap */}
          <WidthInput
            label="Item Gap"
            value={props.gap || '8px'}
            onChange={(value) => setProp((p: ListProps) => (p.gap = value))}
            allowedUnits={['px', 'rem']}
          />

          {/* Padding */}
          <WidthInput
            label="Padding"
            value={props.padding || '0px'}
            onChange={(value) => setProp((p: ListProps) => (p.padding = value))}
            allowedUnits={['px', 'rem']}
          />

          {/* Custom Classes */}
          <div className="space-y-2">
            <Label className="text-xs">Custom Classes</Label>
            <Input
              value={props.className || ''}
              onChange={(e) => setProp((p: ListProps) => (p.className = e.target.value))}
              placeholder="Enter Tailwind classes..."
            />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
