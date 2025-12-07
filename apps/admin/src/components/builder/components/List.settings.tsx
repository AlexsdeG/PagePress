// PagePress v0.0.9 - 2025-12-04
// List component settings panel with ElementSettingsSidebar

import { useNode } from '@craftjs/core';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RichTextEditor } from '../editor';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { WidthInput } from '../inspector/inputs/WidthInput';
import { ElementSettingsSidebar } from '../inspector/sidebar';
import type { ListProps } from './List';

/**
 * Content-specific settings for List
 */
function ListContentSettings({
  props,
  setProp,
}: {
  props: ListProps;
  setProp: (cb: (props: ListProps) => void) => void;
}) {
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
    <div className="space-y-4">
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

      {/* Items (Rich Text) */}
      <div className="space-y-2">
        <Label className="text-xs">List Items</Label>
        <RichTextEditor
          content={props.htmlContent || `<ul>${(props.items || []).map(i => `<li>${i}</li>`).join('')}</ul>`}
          onChange={(html) => {
            setProp((p: ListProps) => {
              p.htmlContent = html;
              // We could try to parse back to items, but htmlContent is enough for display
            });
          }}
          placeholder="Enter list items..."
          className="min-h-[150px] border rounded-md p-2 text-sm"
        />
      </div>

      {/* Gap */}
      <WidthInput
        label="Item Gap"
        value={props.gap || '8px'}
        onChange={(value) => setProp((p: ListProps) => (p.gap = value))}
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
    </div>
  );
}

/**
 * Settings panel for List component
 * All style tabs are available by default
 */
export function ListSettings() {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as ListProps,
  }));

  return (
    <ElementSettingsSidebar
      contentSettings={
        <ListContentSettings
          props={props}
          setProp={setProp}
        />
      }
    />
  );
}
