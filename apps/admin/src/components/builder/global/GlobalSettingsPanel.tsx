// PagePress v0.0.10 - 2025-12-04
// Global settings sidebar panel

import { useState, useEffect } from 'react';
import { X, Palette, Type, Component, Grid, Ruler } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useGlobalSettingsStore } from './globalSettingsStore';
import { ColorsTab } from './tabs/ColorsTab';
import { TypographyTab } from './tabs/TypographyTab';
import { ElementsTab } from './tabs/ElementsTab';
import { BreakpointsTab } from './tabs/BreakpointsTab';
import { SpacingTab } from './tabs/SpacingTab';

interface GlobalSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabId = 'colors' | 'typography' | 'elements' | 'breakpoints' | 'spacing';

const TABS = [
  { id: 'colors' as TabId, label: 'Colors', icon: Palette },
  { id: 'typography' as TabId, label: 'Typography', icon: Type },
  { id: 'elements' as TabId, label: 'Elements', icon: Component },
  { id: 'breakpoints' as TabId, label: 'Breakpoints', icon: Grid },
  { id: 'spacing' as TabId, label: 'Spacing', icon: Ruler },
];

/**
 * Global settings panel - slides in from the right
 * Contains tabs for colors, typography, elements, breakpoints, and spacing
 */
export function GlobalSettingsPanel({
  isOpen,
  onClose,
}: GlobalSettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>('colors');
  const { loadThemeSettings, themeSettings, isLoading, error } =
    useGlobalSettingsStore();

  // Load settings when panel opens
  useEffect(() => {
    if (isOpen && !themeSettings) {
      loadThemeSettings();
    }
  }, [isOpen, themeSettings, loadThemeSettings]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 w-92 bg-background border-l shadow-xl z-50 flex animate-in slide-in-from-right duration-200">
        {/* Icon sidebar */}
        <div className="w-12 border-r bg-muted/30 flex flex-col items-center py-2 gap-1">
          {TABS.map((tab) => (
            <Tooltip key={tab.id}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'h-9 w-9 p-0',
                    activeTab === tab.id && 'bg-background shadow-sm'
                  )}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <tab.icon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">{tab.label}</TooltipContent>
            </Tooltip>
          ))}
        </div>

        {/* Content area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="h-12 border-b flex items-center justify-between px-4 shrink-0">
            <h2 className="font-semibold text-sm">Global Styles</h2>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Tab content */}
          <ScrollArea className="flex-1">
            <div className="p-4">
              {isLoading && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                </div>
              )}

              {error && (
                <div className="text-sm text-red-500 py-4">{error}</div>
              )}

              {!isLoading && !error && (
                <>
                  {activeTab === 'colors' && <ColorsTab />}
                  {activeTab === 'typography' && <TypographyTab />}
                  {activeTab === 'elements' && <ElementsTab />}
                  {activeTab === 'breakpoints' && <BreakpointsTab />}
                  {activeTab === 'spacing' && <SpacingTab />}
                </>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </>
  );
}
