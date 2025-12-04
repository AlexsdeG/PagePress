// PagePress v0.0.9 - 2025-12-04
// Row component settings panel with ElementSettingsSidebar

import { useNode, useEditor } from '@craftjs/core';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { WidthInput } from '../inspector/inputs/WidthInput';
import { ElementSettingsSidebar } from '../inspector/sidebar';
import { Column } from './Column';
import type { RowProps } from './Row';

/**
 * Column preset configurations
 */
const COLUMN_PRESETS = [
  { label: '2 Equal', icon: '▌▐', columns: [{ width: '50%' }, { width: '50%' }] },
  { label: '3 Equal', icon: '▌▐▐', columns: [{ width: '33.33%' }, { width: '33.33%' }, { width: '33.33%' }] },
  { label: '4 Equal', icon: '▌▐▐▐', columns: [{ width: '25%' }, { width: '25%' }, { width: '25%' }, { width: '25%' }] },
  { label: '1/3 + 2/3', icon: '▌▐▐', columns: [{ width: '33.33%' }, { width: '66.66%' }] },
  { label: '2/3 + 1/3', icon: '▐▐▌', columns: [{ width: '66.66%' }, { width: '33.33%' }] },
  { label: '1/4 + 3/4', icon: '▌▐▐▐', columns: [{ width: '25%' }, { width: '75%' }] },
  { label: '1/4 + 1/2 + 1/4', icon: '▌▐▐▌', columns: [{ width: '25%' }, { width: '50%' }, { width: '25%' }] },
];

/**
 * Content-specific settings for Row
 */
function RowContentSettings({
  props,
  setProp,
  nodeId,
}: {
  props: RowProps;
  setProp: (cb: (props: RowProps) => void) => void;
  nodeId: string;
}) {
  const { actions, query } = useEditor();

  // Apply column preset - clears existing columns and adds new ones
  const applyPreset = (columns: Array<{ width: string }>) => {
    // Get current children
    const node = query.node(nodeId).get();
    const existingChildren = node.data.nodes || [];
    
    // Delete existing children
    existingChildren.forEach((childId: string) => {
      try {
        actions.delete(childId);
      } catch {
        // Ignore deletion errors - child might already be gone
      }
    });

    // Add new columns
    columns.forEach((col) => {
      const nodeTree = query.parseReactElement(
        <Column width={col.width} padding="16px" backgroundColor="transparent" />
      ).toNodeTree();
      
      actions.addNodeTree(nodeTree, nodeId);
    });
  };

  return (
    <div className="space-y-4">
      {/* Column Presets */}
      <div className="space-y-2">
        <Label className="text-xs font-medium">Column Presets</Label>
        <div className="grid grid-cols-2 gap-2">
          {COLUMN_PRESETS.map((preset) => (
            <Button
              key={preset.label}
              variant="outline"
              size="sm"
              className="h-auto py-2 flex flex-col gap-1"
              onClick={() => applyPreset(preset.columns)}
            >
              <span className="text-lg font-mono tracking-tight">{preset.icon}</span>
              <span className="text-[10px] text-muted-foreground">{preset.label}</span>
            </Button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Click a preset to create columns. Existing columns will be replaced.
        </p>
      </div>

      {/* Gap */}
      <WidthInput
        label="Gap"
        value={props.gap || '16px'}
        onChange={(value) => setProp((p: RowProps) => (p.gap = value))}
        allowedUnits={['px', 'rem', '%']}
      />

      {/* Justify Content */}
      <div className="space-y-2">
        <Label className="text-xs">Justify Content</Label>
        <Select
          value={props.justifyContent || 'start'}
          onValueChange={(value) => setProp((p: RowProps) => (p.justifyContent = value as RowProps['justifyContent']))}
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

      {/* Align Items */}
      <div className="space-y-2">
        <Label className="text-xs">Align Items</Label>
        <Select
          value={props.alignItems || 'stretch'}
          onValueChange={(value) => setProp((p: RowProps) => (p.alignItems = value as RowProps['alignItems']))}
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

      {/* Wrap */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="wrap"
          checked={props.wrap ?? true}
          onChange={(e) => setProp((p: RowProps) => (p.wrap = e.target.checked))}
          className="rounded border-gray-300"
        />
        <Label htmlFor="wrap" className="text-xs">Wrap Items</Label>
      </div>

      {/* Custom Classes */}
      <div className="space-y-2">
        <Label className="text-xs">Custom Classes</Label>
        <Input
          value={props.className || ''}
          onChange={(e) => setProp((p: RowProps) => (p.className = e.target.value))}
          placeholder="Enter Tailwind classes..."
        />
      </div>
    </div>
  );
}

/**
 * Settings panel for Row component
 * All style tabs are available by default
 */
export function RowSettings() {
  const {
    actions: { setProp },
    props,
    nodeId,
  } = useNode((node) => ({
    props: node.data.props as RowProps,
    nodeId: node.id,
  }));

  return (
    <ElementSettingsSidebar
      contentSettings={
        <RowContentSettings
          props={props}
          setProp={setProp}
          nodeId={nodeId}
        />
      }
    />
  );
}
