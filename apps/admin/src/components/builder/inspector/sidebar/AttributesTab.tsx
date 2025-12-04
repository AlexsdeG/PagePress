// PagePress v0.0.9 - 2025-12-04
// HTML Attributes Tab - Custom name/value pairs for HTML attributes

import { useState, useCallback, useRef } from 'react';
import { useNode } from '@craftjs/core';
import { Plus, Trash2, Code2, Info, GripVertical } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { ElementMetadata, CustomAttribute } from './types';
import { generateAttributeId } from './types';

interface AttributesTabProps {
  className?: string;
}

// Common HTML attributes suggestions
const COMMON_ATTRIBUTES = [
  { name: 'data-testid', description: 'Testing identifier' },
  { name: 'data-analytics', description: 'Analytics tracking' },
  { name: 'aria-label', description: 'Accessibility label' },
  { name: 'aria-describedby', description: 'Description reference' },
  { name: 'aria-hidden', description: 'Hide from screen readers' },
  { name: 'role', description: 'ARIA role' },
  { name: 'tabindex', description: 'Tab order' },
  { name: 'title', description: 'Tooltip text' },
  { name: 'rel', description: 'Link relationship' },
  { name: 'target', description: 'Link target' },
  { name: 'download', description: 'Download attribute' },
  { name: 'data-aos', description: 'Animate on scroll' },
];

export function AttributesTab({ className }: AttributesTabProps) {
  const { metadata, actions, id } = useNode((node) => ({
    metadata: node.data.props.metadata as ElementMetadata | undefined,
    id: node.id,
  }));

  const [attributes, setAttributes] = useState<CustomAttribute[]>(
    metadata?.customAttributes || []
  );
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Initialize attributes from metadata using ref-based sync
  const prevAttributesRef = useRef(metadata?.customAttributes);
  if (prevAttributesRef.current !== metadata?.customAttributes) {
    prevAttributesRef.current = metadata?.customAttributes;
    // State will be synced through updateMetadata callback
  }

  const updateMetadata = useCallback(
    (newAttributes: CustomAttribute[]) => {
      setAttributes(newAttributes);
      actions.setProp((props: { metadata?: ElementMetadata }) => {
        props.metadata = {
          ...props.metadata,
          elementId: metadata?.elementId || id,
          appliedClasses: metadata?.appliedClasses || [],
          customAttributes: newAttributes,
        };
      });
    },
    [actions, id, metadata]
  );

  const handleAddAttribute = useCallback(() => {
    const newAttribute: CustomAttribute = {
      id: generateAttributeId(),
      name: '',
      value: '',
    };
    updateMetadata([...attributes, newAttribute]);
  }, [attributes, updateMetadata]);

  const handleAddCommonAttribute = useCallback(
    (name: string) => {
      // Check if attribute already exists
      if (attributes.some((attr) => attr.name === name)) {
        return;
      }
      const newAttribute: CustomAttribute = {
        id: generateAttributeId(),
        name,
        value: '',
      };
      updateMetadata([...attributes, newAttribute]);
      setShowSuggestions(false);
    },
    [attributes, updateMetadata]
  );

  const handleUpdateAttribute = useCallback(
    (attributeId: string, field: 'name' | 'value', value: string) => {
      const newAttributes = attributes.map((attr) =>
        attr.id === attributeId ? { ...attr, [field]: value } : attr
      );
      updateMetadata(newAttributes);
    },
    [attributes, updateMetadata]
  );

  const handleRemoveAttribute = useCallback(
    (attributeId: string) => {
      const newAttributes = attributes.filter((attr) => attr.id !== attributeId);
      updateMetadata(newAttributes);
    },
    [attributes, updateMetadata]
  );

  const handleClearAll = useCallback(() => {
    updateMetadata([]);
  }, [updateMetadata]);

  // Get unused common attributes
  const unusedCommonAttributes = COMMON_ATTRIBUTES.filter(
    (common) => !attributes.some((attr) => attr.name === common.name)
  );

  return (
    <ScrollArea className={cn('h-full', className)}>
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-muted-foreground" />
            <Label className="text-sm font-medium">HTML Attributes</Label>
            {attributes.length > 0 && (
              <Badge variant="secondary" className="text-[10px]">
                {attributes.length}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={handleAddAttribute}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Add attribute</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Info Banner */}
        <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <Info className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground">
            Add custom HTML attributes like{' '}
            <code className="px-1 py-0.5 bg-muted rounded text-[10px]">
              data-*
            </code>
            ,{' '}
            <code className="px-1 py-0.5 bg-muted rounded text-[10px]">
              aria-*
            </code>
            , or any other valid HTML attribute.
          </p>
        </div>

        {/* Attributes List */}
        <div className="space-y-2">
          {attributes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Code2 className="w-8 h-8 text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">
                No custom attributes
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Click + to add an attribute
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {attributes.map((attribute) => (
                <AttributeRow
                  key={attribute.id}
                  attribute={attribute}
                  onUpdate={handleUpdateAttribute}
                  onRemove={handleRemoveAttribute}
                />
              ))}
            </div>
          )}
        </div>

        {/* Clear All Button */}
        {attributes.length > 1 && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full h-8 text-xs text-muted-foreground hover:text-red-500"
            onClick={handleClearAll}
          >
            Clear all attributes
          </Button>
        )}

        {/* Common Attributes Suggestions */}
        {unusedCommonAttributes.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">
                Quick Add
              </Label>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-[10px] text-muted-foreground"
                onClick={() => setShowSuggestions(!showSuggestions)}
              >
                {showSuggestions ? 'Hide' : 'Show all'}
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-1.5">
              {(showSuggestions
                ? unusedCommonAttributes
                : unusedCommonAttributes.slice(0, 4)
              ).map((common) => (
                <TooltipProvider key={common.name}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        className="px-2 py-1 text-[10px] bg-muted/50 hover:bg-muted rounded-md transition-colors font-mono"
                        onClick={() => handleAddCommonAttribute(common.name)}
                      >
                        {common.name}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>{common.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>
        )}

        {/* Generated HTML Preview */}
        {attributes.length > 0 && attributes.some((a) => a.name) && (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">
              HTML Preview
            </Label>
            <div className="p-3 bg-muted/30 rounded-lg overflow-x-auto">
              <pre className="text-[10px] font-mono text-muted-foreground whitespace-pre-wrap">
                {generateHTMLPreview(attributes)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}

interface AttributeRowProps {
  attribute: CustomAttribute;
  onUpdate: (id: string, field: 'name' | 'value', value: string) => void;
  onRemove: (id: string) => void;
}

function AttributeRow({
  attribute,
  onUpdate,
  onRemove,
}: AttributeRowProps) {

  return (
    <div className="group flex items-start gap-1.5 p-2 bg-muted/30 hover:bg-muted/50 rounded-lg transition-colors">
      {/* Drag Handle (visual only for now) */}
      <div className="pt-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
        <GripVertical className="w-3 h-3 text-muted-foreground/50" />
      </div>

      {/* Attribute Inputs */}
      <div className="flex-1 grid grid-cols-2 gap-1.5">
        <Input
          value={attribute.name}
          onChange={(e) => onUpdate(attribute.id, 'name', e.target.value)}
          placeholder="name"
          className="h-8 text-xs font-mono bg-background/50"
        />
        <Input
          value={attribute.value}
          onChange={(e) => onUpdate(attribute.id, 'value', e.target.value)}
          placeholder="value"
          className="h-8 text-xs font-mono bg-background/50"
        />
      </div>

      {/* Remove Button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-500"
              onClick={() => onRemove(attribute.id)}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Remove attribute</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

function generateHTMLPreview(attributes: CustomAttribute[]): string {
  const validAttrs = attributes.filter((attr) => attr.name);
  if (validAttrs.length === 0) return '';

  const attrString = validAttrs
    .map((attr) =>
      attr.value ? `${attr.name}="${attr.value}"` : attr.name
    )
    .join('\n  ');

  return `<element\n  ${attrString}\n>`;
}

export default AttributesTab;
