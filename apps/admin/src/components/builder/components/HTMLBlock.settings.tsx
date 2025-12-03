// PagePress v0.0.6 - 2025-12-03
// Code Block component settings panel (HTML, CSS, JavaScript)

import { useNode } from '@craftjs/core';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import type { HTMLBlockProps } from '../types';

/**
 * Settings panel for CodeBlock (formerly HTMLBlock) component
 */
export function HTMLBlockSettings() {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as HTMLBlockProps,
  }));

  return (
    <Accordion type="multiple" defaultValue={['html', 'css', 'javascript', 'style']} className="w-full">
      {/* HTML Section */}
      <AccordionItem value="html">
        <AccordionTrigger className="text-sm">HTML</AccordionTrigger>
        <AccordionContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs">HTML Code</Label>
            <Textarea
              value={props.html || ''}
              onChange={(e) => setProp((p: HTMLBlockProps) => (p.html = e.target.value))}
              placeholder="<div>Your custom HTML here...</div>"
              rows={8}
              className="font-mono text-sm"
            />
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* CSS Section */}
      <AccordionItem value="css">
        <AccordionTrigger className="text-sm">CSS</AccordionTrigger>
        <AccordionContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs">CSS Styles</Label>
            <Textarea
              value={props.css || ''}
              onChange={(e) => setProp((p: HTMLBlockProps) => (p.css = e.target.value))}
              placeholder=".my-class { color: red; }"
              rows={6}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Styles are scoped to this code block
            </p>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* JavaScript Section */}
      <AccordionItem value="javascript">
        <AccordionTrigger className="text-sm">JavaScript</AccordionTrigger>
        <AccordionContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs">JavaScript Code</Label>
            <Textarea
              value={props.javascript || ''}
              onChange={(e) => setProp((p: HTMLBlockProps) => (p.javascript = e.target.value))}
              placeholder="console.log('Hello World');"
              rows={6}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              ⚠️ JavaScript only runs in preview mode for security
            </p>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Style Section */}
      <AccordionItem value="style">
        <AccordionTrigger className="text-sm">Layout</AccordionTrigger>
        <AccordionContent className="space-y-4">
          {/* Min Height */}
          <div className="space-y-2">
            <Label className="text-xs">Min Height ({props.minHeight || 60}px)</Label>
            <Slider
              value={[props.minHeight || 60]}
              onValueChange={([value]) => setProp((p: HTMLBlockProps) => (p.minHeight = value))}
              min={0}
              max={500}
              step={10}
            />
          </div>

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
