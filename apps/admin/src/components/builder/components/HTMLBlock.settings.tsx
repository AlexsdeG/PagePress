// PagePress v0.0.11 - 2025-12-04
// Code Block component settings panel (HTML, CSS, JavaScript) with Monaco editor

import { useNode } from '@craftjs/core';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ElementSettingsSidebar } from '../inspector/sidebar';
import { CodeEditor } from '../editor';
import type { HTMLBlockProps } from '../types';
import { Code2, Palette, Braces } from 'lucide-react';

/**
 * Content-specific settings for HTMLBlock (CodeBlock)
 * Uses Monaco Editor for syntax highlighting and code editing
 */
function HTMLBlockContentSettings({
  props,
  setProp,
}: {
  props: HTMLBlockProps;
  setProp: (cb: (props: HTMLBlockProps) => void) => void;
}) {
  return (
    <div className="space-y-4">
      {/* Code Tabs */}
      <Tabs defaultValue="html" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="html" className="flex items-center gap-1 text-xs">
            <Code2 className="h-3 w-3" />
            HTML
          </TabsTrigger>
          <TabsTrigger value="css" className="flex items-center gap-1 text-xs">
            <Palette className="h-3 w-3" />
            CSS
          </TabsTrigger>
          <TabsTrigger value="js" className="flex items-center gap-1 text-xs">
            <Braces className="h-3 w-3" />
            JS
          </TabsTrigger>
        </TabsList>

        {/* HTML Code */}
        <TabsContent value="html" className="mt-3">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">
              Write your custom HTML markup
            </Label>
            <CodeEditor
              value={props.html || ''}
              onChange={(value) => setProp((p: HTMLBlockProps) => (p.html = value))}
              language="html"
              height={250}
              placeholder="<div>Your custom HTML here...</div>"
            />
          </div>
        </TabsContent>

        {/* CSS Styles */}
        <TabsContent value="css" className="mt-3">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">
              Scoped styles for this block
            </Label>
            <CodeEditor
              value={props.css || ''}
              onChange={(value) => setProp((p: HTMLBlockProps) => (p.css = value))}
              language="css"
              height={250}
              placeholder=".my-class { color: red; }"
            />
            <p className="text-xs text-muted-foreground">
              Styles are scoped to this code block only
            </p>
          </div>
        </TabsContent>

        {/* JavaScript Code */}
        <TabsContent value="js" className="mt-3">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">
              JavaScript code to execute
            </Label>
            <CodeEditor
              value={props.javascript || ''}
              onChange={(value) => setProp((p: HTMLBlockProps) => (p.javascript = value))}
              language="javascript"
              height={250}
              placeholder="console.log('Hello World');"
            />
            <p className="text-xs text-amber-600 dark:text-amber-400">
              ⚠️ JavaScript only runs in preview mode for security
            </p>
          </div>
        </TabsContent>
      </Tabs>

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
    </div>
  );
}

/**
 * Settings panel for CodeBlock (formerly HTMLBlock) component
 * All style tabs are available by default
 */
export function HTMLBlockSettings() {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as HTMLBlockProps,
  }));

  return (
    <ElementSettingsSidebar
      contentSettings={
        <HTMLBlockContentSettings
          props={props}
          setProp={setProp}
        />
      }
    />
  );
}
