// PagePress v0.0.7 - 2025-12-04
// Settings Tabs Wrapper - Master container for Content/Style tabs

import { useState, useCallback, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { LayoutSettingsTab } from './LayoutSettingsTab';
import { BackgroundSettingsTab } from './BackgroundSettingsTab';
import { TypographySettingsTab } from './TypographySettingsTab';
import { BorderInput, defaultBorderSettings } from '../inputs/BorderInput';
import { BoxShadowInput } from '../inputs/BoxShadowInput';
import { TransformInput, defaultTransformSettings } from '../inputs/TransformInput';
import { TransitionInput, defaultTransitionSettings } from '../inputs/TransitionInput';
import { FilterInput, BackdropFilterInput, defaultFilterSettings, defaultBackdropFilterSettings } from '../inputs/FilterInput';
import type { AdvancedStyling, PseudoState } from './types';

interface SettingsTabsWrapperProps {
  /** Content-specific settings rendered by each component */
  contentSettings: ReactNode;
  /** Component display name for the header */
  componentName: string;
  /** Current advanced styling values */
  styling: Partial<AdvancedStyling>;
  /** Callback when styling changes */
  onStylingChange: (styling: Partial<AdvancedStyling>) => void;
  /** Which style sections to show */
  sections?: {
    layout?: boolean;
    typography?: boolean;
    background?: boolean;
    border?: boolean;
    effects?: boolean;
    transform?: boolean;
  };
  /** Additional class names */
  className?: string;
}

/**
 * Pseudo state selector component
 */
function PseudoStateSelector({
  value,
  onChange,
}: {
  value: PseudoState;
  onChange: (state: PseudoState) => void;
}) {
  const states: { value: PseudoState; label: string }[] = [
    { value: 'default', label: 'Default' },
    { value: 'hover', label: ':hover' },
    { value: 'active', label: ':active' },
    { value: 'focus', label: ':focus' },
  ];

  return (
    <div className="flex gap-1 mb-4">
      {states.map((state) => (
        <button
          key={state.value}
          onClick={() => onChange(state.value)}
          className={cn(
            'px-2 py-1 text-xs rounded border transition-colors',
            value === state.value
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-transparent text-muted-foreground border-border hover:bg-muted'
          )}
        >
          {state.label}
        </button>
      ))}
    </div>
  );
}

/**
 * Settings Tabs Wrapper - Master container with Content/Style tabs
 */
export function SettingsTabsWrapper({
  contentSettings,
  componentName,
  styling,
  onStylingChange,
  sections = {
    layout: true,
    typography: true,
    background: true,
    border: true,
    effects: true,
    transform: true,
  },
  className,
}: SettingsTabsWrapperProps) {
  const [activeTab, setActiveTab] = useState<'content' | 'style'>('content');
  const [pseudoState, setPseudoState] = useState<PseudoState>('default');

  // Update a specific style category
  const handleStyleChange = useCallback(
    <K extends keyof AdvancedStyling>(category: K, value: AdvancedStyling[K]) => {
      onStylingChange({
        ...styling,
        [category]: value,
      });
    },
    [styling, onStylingChange]
  );

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Component name header */}
      <div className="px-4 py-3 border-b">
        <h3 className="text-sm font-semibold">{componentName}</h3>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as 'content' | 'style')}
        className="flex-1 flex flex-col"
      >
        <TabsList className="grid w-full grid-cols-2 mx-4 mt-2" style={{ width: 'calc(100% - 2rem)' }}>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="style">Style</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="flex-1 mt-0">
          <ScrollArea className="h-full">
            <div className="p-4">{contentSettings}</div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="style" className="flex-1 mt-0">
          <ScrollArea className="h-full">
            <div className="p-4">
              {/* Pseudo state selector */}
              <PseudoStateSelector value={pseudoState} onChange={setPseudoState} />

              {pseudoState !== 'default' && (
                <div className="mb-4 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-xs text-yellow-800 dark:text-yellow-200">
                  Editing <strong>{pseudoState}</strong> state styles. Changes here only apply when the element is in this state.
                </div>
              )}

              {/* Style sections */}
              <Accordion
                type="multiple"
                defaultValue={['layout', 'typography', 'background']}
                className="space-y-1"
              >
                {/* Layout */}
                {sections.layout && (
                  <AccordionItem value="layout" className="border rounded-md">
                    <AccordionTrigger className="px-3 py-2 text-sm font-medium hover:no-underline">
                      Layout
                    </AccordionTrigger>
                    <AccordionContent className="px-3 pb-3">
                      <LayoutSettingsTab
                        value={styling.layout || {}}
                        onChange={(layout) => handleStyleChange('layout', layout)}
                      />
                    </AccordionContent>
                  </AccordionItem>
                )}

                {/* Typography */}
                {sections.typography && (
                  <AccordionItem value="typography" className="border rounded-md">
                    <AccordionTrigger className="px-3 py-2 text-sm font-medium hover:no-underline">
                      Typography
                    </AccordionTrigger>
                    <AccordionContent className="px-3 pb-3">
                      <TypographySettingsTab
                        value={styling.typography || {}}
                        onChange={(typography) => handleStyleChange('typography', typography)}
                      />
                    </AccordionContent>
                  </AccordionItem>
                )}

                {/* Background */}
                {sections.background && (
                  <AccordionItem value="background" className="border rounded-md">
                    <AccordionTrigger className="px-3 py-2 text-sm font-medium hover:no-underline">
                      Background
                    </AccordionTrigger>
                    <AccordionContent className="px-3 pb-3">
                      <BackgroundSettingsTab
                        value={styling.background || {}}
                        onChange={(background) => handleStyleChange('background', background)}
                      />
                    </AccordionContent>
                  </AccordionItem>
                )}

                {/* Border */}
                {sections.border && (
                  <AccordionItem value="border" className="border rounded-md">
                    <AccordionTrigger className="px-3 py-2 text-sm font-medium hover:no-underline">
                      Border
                    </AccordionTrigger>
                    <AccordionContent className="px-3 pb-3">
                      <BorderInput
                        value={styling.border || defaultBorderSettings}
                        onChange={(border) => handleStyleChange('border', border)}
                      />
                    </AccordionContent>
                  </AccordionItem>
                )}

                {/* Effects (Box Shadow, Filters) */}
                {sections.effects && (
                  <AccordionItem value="effects" className="border rounded-md">
                    <AccordionTrigger className="px-3 py-2 text-sm font-medium hover:no-underline">
                      Effects
                    </AccordionTrigger>
                    <AccordionContent className="px-3 pb-3 space-y-4">
                      {/* Box Shadow */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-medium text-muted-foreground">Box Shadow</h4>
                        <BoxShadowInput
                          value={styling.boxShadow || []}
                          onChange={(boxShadow) => handleStyleChange('boxShadow', boxShadow)}
                        />
                      </div>

                      {/* Filters */}
                      <div className="pt-4 border-t space-y-2">
                        <h4 className="text-xs font-medium text-muted-foreground">Filters</h4>
                        <FilterInput
                          value={styling.filter || defaultFilterSettings}
                          onChange={(filter) => handleStyleChange('filter', filter)}
                        />
                      </div>

                      {/* Backdrop Filter */}
                      <div className="pt-4 border-t">
                        <BackdropFilterInput
                          value={styling.backdropFilter || defaultBackdropFilterSettings}
                          onChange={(backdropFilter) => handleStyleChange('backdropFilter', backdropFilter)}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {/* Transform & Transition */}
                {sections.transform && (
                  <AccordionItem value="transform" className="border rounded-md">
                    <AccordionTrigger className="px-3 py-2 text-sm font-medium hover:no-underline">
                      Transform & Transition
                    </AccordionTrigger>
                    <AccordionContent className="px-3 pb-3 space-y-4">
                      {/* Transform */}
                      <TransformInput
                        value={styling.transform || defaultTransformSettings}
                        onChange={(transform) => handleStyleChange('transform', transform)}
                      />

                      {/* Transition */}
                      <div className="pt-4 border-t">
                        <TransitionInput
                          value={styling.transition || defaultTransitionSettings}
                          onChange={(transition) => handleStyleChange('transition', transition)}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/**
 * Hook to create content settings form
 * This is a helper to build the content settings section
 */
export function useContentSettings() {
  // This can be expanded to provide common form controls
  return {};
}
