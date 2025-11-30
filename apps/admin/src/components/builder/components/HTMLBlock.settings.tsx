// PagePress v0.0.5 - 2025-11-30
// HTML Block component settings panel

import { useNode } from '@craftjs/core';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import type { HTMLBlockProps } from '../types';

/**
 * Settings panel for HTMLBlock component
 */
export function HTMLBlockSettings() {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as HTMLBlockProps,
  }));

  return (
    <Accordion type="multiple" defaultValue={['code', 'style']} className="w-full">
      {/* Code Section */}
      <AccordionItem value="code">
        <AccordionTrigger className="text-sm">HTML Code</AccordionTrigger>
        <AccordionContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs">HTML</Label>
            <Textarea
              value={props.html || ''}
              onChange={(e) => setProp((p: HTMLBlockProps) => (p.html = e.target.value))}
              placeholder="<div>Your custom HTML here...</div>"
              rows={10}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              ⚠️ HTML is sanitized for security. Inline scripts are removed.
            </p>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Style Section */}
      <AccordionItem value="style">
        <AccordionTrigger className="text-sm">Style</AccordionTrigger>
        <AccordionContent className="space-y-4">
          {/* Custom Classes */}
          <div className="space-y-2">
            <Label className="text-xs">Custom Classes</Label>
            <Input
              value={props.className || ''}
              onChange={(e) => setProp((p: HTMLBlockProps) => (p.className = e.target.value))}
              placeholder="Enter Tailwind classes..."
            />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
