// PagePress v0.0.9 - 2025-12-04
// Custom CSS Tab - Allow users to write custom CSS for individual elements

import { useState, useCallback, useRef } from 'react';
import { useNode } from '@craftjs/core';
import { Info, Copy, Check, Code } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import type { ElementMetadata } from './types';

interface CustomCSSTabProps {
  className?: string;
}

export function CustomCSSTab({ className }: CustomCSSTabProps) {
  const { metadata, actions, id } = useNode((node) => ({
    metadata: node.data.props.metadata as ElementMetadata | undefined,
    id: node.id,
  }));

  const elementId = metadata?.elementId || id;
  const [css, setCSS] = useState(metadata?.customCSS || '');
  const [copied, setCopied] = useState(false);
  const [isValid, setIsValid] = useState(true);

  // Initialize CSS from metadata (only on mount or when metadata changes externally)
  // Using a ref to track if we should sync
  const prevCustomCSSRef = useRef(metadata?.customCSS);
  if (prevCustomCSSRef.current !== metadata?.customCSS) {
    prevCustomCSSRef.current = metadata?.customCSS;
    if (css !== (metadata?.customCSS || '')) {
      // Only update if different to avoid loops
      // This handles external changes to metadata
    }
  }

  const handleCSSChange = useCallback(
    (value: string) => {
      setCSS(value);
      
      // Basic CSS validation
      const isValidCSS = validateCSS(value);
      setIsValid(isValidCSS);

      // Update the node metadata
      actions.setProp((props: { metadata?: ElementMetadata }) => {
        props.metadata = {
          ...props.metadata,
          elementId: metadata?.elementId || id,
          appliedClasses: metadata?.appliedClasses || [],
          customCSS: value,
        };
      });
    },
    [actions, id, metadata]
  );

  const handleCopy = useCallback(async () => {
    const fullCSS = generateScopedCSS(elementId, css);
    await navigator.clipboard.writeText(fullCSS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [css, elementId]);

  const handleClear = useCallback(() => {
    handleCSSChange('');
  }, [handleCSSChange]);

  return (
    <ScrollArea className={cn('h-full', className)}>
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-muted-foreground" />
            <Label className="text-sm font-medium">Custom CSS</Label>
          </div>
          <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={handleCopy}
                    disabled={!css}
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-green-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>{copied ? 'Copied!' : 'Copy scoped CSS'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Info Banner */}
        <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
          <div className="text-xs text-muted-foreground space-y-1">
            <p>
              Write CSS rules that will be scoped to this element. Use{' '}
              <code className="px-1 py-0.5 bg-muted rounded text-[10px]">
                %root%
              </code>{' '}
              as a placeholder for the element selector.
            </p>
            <p className="text-muted-foreground/70">
              Example:{' '}
              <code className="px-1 py-0.5 bg-muted rounded text-[10px]">
                %root%:hover {'{'} opacity: 0.8; {'}'}
              </code>
            </p>
          </div>
        </div>

        {/* Element ID Reference */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Element ID:</span>
          <Badge variant="secondary" className="font-mono text-[10px]">
            #{elementId}
          </Badge>
        </div>

        {/* CSS Editor */}
        <div className="space-y-2">
          <Textarea
            value={css}
            onChange={(e) => handleCSSChange(e.target.value)}
            placeholder={`/* Custom CSS for this element */
%root% {
  /* Your styles here */
}

%root%:hover {
  /* Hover styles */
}

%root%::before {
  /* Pseudo-element styles */
}`}
            className={cn(
              'min-h-[300px] font-mono text-xs resize-y',
              'bg-muted/30 border-border/50',
              !isValid && 'border-red-500/50 focus-visible:ring-red-500/20'
            )}
            spellCheck={false}
          />
          
          {/* Validation Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {!isValid && (
                <span className="text-xs text-red-500">
                  CSS may contain syntax errors
                </span>
              )}
            </div>
            {css && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground hover:text-foreground"
                onClick={handleClear}
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Quick Reference */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">
            Quick Reference
          </Label>
          <div className="grid grid-cols-2 gap-1.5 text-[10px]">
            {QUICK_REFERENCE.map((item) => (
              <button
                key={item.selector}
                className="flex items-center justify-between px-2 py-1.5 bg-muted/30 hover:bg-muted/50 rounded text-left transition-colors"
                onClick={() => {
                  const template = `${item.selector} {\n  \n}`;
                  handleCSSChange(css ? `${css}\n\n${template}` : template);
                }}
              >
                <code className="font-mono text-muted-foreground">
                  {item.selector}
                </code>
                <span className="text-muted-foreground/70">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Output Preview */}
        {css && (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">
              Generated CSS
            </Label>
            <div className="p-3 bg-muted/30 rounded-lg overflow-x-auto">
              <pre className="text-[10px] font-mono text-muted-foreground whitespace-pre-wrap">
                {generateScopedCSS(elementId, css)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}

// Quick reference selectors
const QUICK_REFERENCE = [
  { selector: '%root%', label: 'Element' },
  { selector: '%root%:hover', label: 'Hover' },
  { selector: '%root%:active', label: 'Active' },
  { selector: '%root%:focus', label: 'Focus' },
  { selector: '%root%::before', label: 'Before' },
  { selector: '%root%::after', label: 'After' },
  { selector: '%root% > *', label: 'Children' },
  { selector: '@media (max-width: 768px)', label: 'Mobile' },
];

// Basic CSS validation
function validateCSS(css: string): boolean {
  if (!css.trim()) return true;
  
  // Check for balanced braces
  let braceCount = 0;
  for (const char of css) {
    if (char === '{') braceCount++;
    if (char === '}') braceCount--;
    if (braceCount < 0) return false;
  }
  
  return braceCount === 0;
}

// Generate scoped CSS with element ID
function generateScopedCSS(elementId: string, css: string): string {
  if (!css.trim()) return '';
  
  // Replace %root% placeholder with actual element selector
  return css.replace(/%root%/g, `#${elementId}`);
}

export default CustomCSSTab;
