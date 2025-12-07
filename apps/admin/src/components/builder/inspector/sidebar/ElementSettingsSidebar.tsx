
// PagePress v0.0.9 - 2025-12-04
// Element Settings Sidebar - Bricks-style icon navigation with all tabs

import { useState, useCallback, type ReactNode } from 'react';
import { useEditor, useNode } from '@craftjs/core';
import {
  LayoutGrid,
  Type,
  Paintbrush,
  Square,
  Sparkles,
  Move3d,
  Code,
  Braces,
  FileText,
  Settings
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useBuilderStore } from '@/stores/builder';

import {
  ALL_SETTINGS_TABS,
  type SettingsTabId,
  type ElementMetadata,
  type PseudoClass,
  type PropertySource,
  type StyleSourceResult,
} from './types';
import type { AdvancedStyling, BreakpointStyling } from '../styles/types';
import { InspectorHeader } from './InspectorHeader';

import { GeneralSettingsTab } from './GeneralSettingsTab';
import { CustomCSSTab } from './CustomCSSTab';
import AttributesTab from './AttributesTab';
import { LayoutSettingsTab } from '../styles/LayoutSettingsTab';
import { TypographySettingsTab } from '../styles/TypographySettingsTab';
import { BackgroundSettingsTab } from '../styles/BackgroundSettingsTab';
import { BorderInput, defaultBorderSettings } from '../inputs/BorderInput';
import { BoxShadowInput } from '../inputs/BoxShadowInput';
import { FilterInput, BackdropFilterInput, defaultFilterSettings, defaultBackdropFilterSettings } from '../inputs/FilterInput';
import { TransformInput, defaultTransformSettings } from '../inputs/TransformInput';
import { TransitionInput, defaultTransitionSettings } from '../inputs/TransitionInput';

/**
 * Icon mapping for tabs
 */
const TAB_ICONS: Record<SettingsTabId, React.ElementType> = {
  content: FileText,
  general: Settings,
  layout: LayoutGrid,
  typography: Type,
  background: Paintbrush,
  border: Square,
  effects: Sparkles,
  transform: Move3d,
  attributes: Code,
  css: Braces,
};

/**
 * Tab labels
 */
const TAB_LABELS: Record<SettingsTabId, string> = {
  content: 'Content',
  general: 'General',
  layout: 'Layout',
  typography: 'Typography',
  background: 'Background',
  border: 'Border',
  effects: 'Effects',
  transform: 'Transform',
  attributes: 'Attributes',
  css: 'CSS',
};

interface ElementSettingsSidebarProps {
  /** Content-specific settings rendered by each component */
  contentSettings: ReactNode;
  /** Which style sections to show (all available by default) */
  sections?: {
    content?: boolean;
    general?: boolean;
    layout?: boolean;
    typography?: boolean;
    background?: boolean;
    border?: boolean;
    effects?: boolean;
    transform?: boolean;
    attributes?: boolean;
    css?: boolean;
  };
  /** Additional class name */
  className?: string;
}

/**
 * Element Settings Sidebar - Bricks-style icon navigation with all style tabs
 */
export function ElementSettingsSidebar({
  contentSettings,
  sections = {
    content: true,
    general: true,
    layout: true,
    typography: true,
    background: true,
    border: true,
    effects: true,
    transform: true,
    attributes: true,
    css: true,
  },
  className,
}: ElementSettingsSidebarProps) {
  const [activeTab, setActiveTab] = useState<SettingsTabId>('content');
  const [pseudoState, setPseudoState] = useState<PseudoClass>('default');

  const { activeBreakpoint } = useBuilderStore();
  const { actions: editorActions } = useEditor();

  const {
    actions: { setProp },
    displayName,
    componentType,
    customName,
    styling,
    pseudoStateStyling,
    breakpointStyling,
    nodeId,
  } = useNode((node) => ({
    nodeId: node.id,
    displayName: node.data.displayName || node.data.name || 'Element',
    componentType: node.data.name || 'Unknown',
    customName: (node.data.props.metadata as ElementMetadata | undefined)?.customName,
    styling: (node.data.props.advancedStyling || {}) as AdvancedStyling,
    pseudoStateStyling: (node.data.props.pseudoStateStyling || {}) as Partial<Record<PseudoClass, Partial<AdvancedStyling>>>,
    breakpointStyling: (node.data.props.breakpointStyling || {}) as BreakpointStyling,
  }));

  // Save the name
  const handleRename = useCallback((newName: string) => {
    setProp((props: Record<string, unknown>) => {
      const metadata = (props.metadata || { elementId: nodeId }) as ElementMetadata;
      props.metadata = { ...metadata, customName: newName.trim() || undefined };
    });
    if (newName.trim()) {
      toast.success('Element renamed');
    }
  }, [setProp, nodeId]);



  // Calculate effective styling (cascade)
  // Desktop -> Tablet -> Mobile
  const getEffectiveStyling = useCallback((): AdvancedStyling => {
    // 1. Start with Desktop Base
    let effective = { ...styling };

    // 2. Apply Desktop Pseudo if active
    if (activeBreakpoint === 'desktop' && pseudoState !== 'default') {
      effective = { ...effective, ...(pseudoStateStyling[pseudoState] || {}) };
      return effective;
    }

    // 3. Apply Tablet Base if activeBreakpoint is tablet or mobile
    if (activeBreakpoint === 'tablet' || activeBreakpoint === 'mobile') {
      const tabletBase = breakpointStyling.tablet || {};
      effective = { ...effective, ...tabletBase };

      // Apply Tablet Pseudo if active
      if (activeBreakpoint === 'tablet' && pseudoState !== 'default') {
        const tabletPseudo = breakpointStyling.tablet?.pseudoStates?.[pseudoState] || {};
        effective = { ...effective, ...tabletPseudo };
        return effective;
      }
    }

    // 4. Apply Mobile Base if activeBreakpoint is mobile
    if (activeBreakpoint === 'mobile') {
      const mobileBase = breakpointStyling.mobile || {};
      effective = { ...effective, ...mobileBase };

      // Apply Mobile Pseudo if active
      if (activeBreakpoint === 'mobile' && pseudoState !== 'default') {
        const mobilePseudo = breakpointStyling.mobile?.pseudoStates?.[pseudoState] || {};
        effective = { ...effective, ...mobilePseudo };
        return effective;
      }
    }

    return effective;
  }, [activeBreakpoint, pseudoState, styling, pseudoStateStyling, breakpointStyling]);

  const activeStyling = getEffectiveStyling();

  // Update a specific style category
  const handleStyleChange = useCallback(
    <K extends keyof AdvancedStyling>(category: K, value: AdvancedStyling[K]) => {
      setProp((props: Record<string, any>) => {


        if (activeBreakpoint === 'desktop') {
          if (pseudoState === 'default') {
            // Desktop Base
            if (!props.advancedStyling) props.advancedStyling = {};
            props.advancedStyling[category] = value;
          } else {
            // Desktop Pseudo
            if (!props.pseudoStateStyling) props.pseudoStateStyling = {};
            if (!props.pseudoStateStyling[pseudoState]) props.pseudoStateStyling[pseudoState] = {};
            props.pseudoStateStyling[pseudoState][category] = value;
          }
        } else {
          // Tablet or Mobile
          if (!props.breakpointStyling) props.breakpointStyling = {};

          if (pseudoState === 'default') {
            // Breakpoint Base
            if (!props.breakpointStyling[activeBreakpoint]) props.breakpointStyling[activeBreakpoint] = {};
            props.breakpointStyling[activeBreakpoint][category] = value;
          } else {
            // Breakpoint Pseudo
            if (!props.breakpointStyling[activeBreakpoint]) props.breakpointStyling[activeBreakpoint] = {};
            if (!props.breakpointStyling[activeBreakpoint].pseudoStates) props.breakpointStyling[activeBreakpoint].pseudoStates = {};
            if (!props.breakpointStyling[activeBreakpoint].pseudoStates[pseudoState]) props.breakpointStyling[activeBreakpoint].pseudoStates[pseudoState] = {};
            props.breakpointStyling[activeBreakpoint].pseudoStates[pseudoState][category] = value;
          }
        }
      });
    },
    [setProp, activeBreakpoint, pseudoState]
  );

  // Get available tabs based on sections
  const availableTabs = (Object.keys(sections) as SettingsTabId[]).filter(
    (tab) => sections[tab as keyof typeof sections]
  );

  // Determine which tabs to show based on component type
  const getVisibleTabs = useCallback(() => {
    // All tabs available for all components - user can style any element
    return availableTabs;
  }, [availableTabs]);

  const visibleTabs = getVisibleTabs();



  // Helper to check if a value exists at path
  const hasValue = (obj: any, path: string): boolean => {
    if (!obj) return false;
    const parts = path.split('.');
    let current = obj;
    for (const part of parts) {
      if (current === undefined || current === null) return false;
      current = current[part];
    }
    return current !== undefined && current !== null;
  };

  // Determine source of a style property
  const getStyleSource = useCallback((path: string): StyleSourceResult => {
    // 1. Check current level (User/Manual)
    let currentStyling: any = {};
    let source: PropertySource = 'default';

    if (activeBreakpoint === 'desktop') {
      if (pseudoState === 'default') {
        currentStyling = styling;
      } else {
        currentStyling = pseudoStateStyling[pseudoState] || {};
      }
    } else {
      // Tablet/Mobile
      const bpStyling = breakpointStyling[activeBreakpoint] || {};
      if (pseudoState === 'default') {
        currentStyling = bpStyling;
      } else {
        currentStyling = bpStyling.pseudoStates?.[pseudoState] || {};
      }
    }

    if (hasValue(currentStyling, path)) {
      source = 'user';
    }

    // 2. Check classes (Future)
    // if (source === 'default' && hasClassValue(path)) source = 'class';

    // 3. Check global theme (Future)
    // if (source === 'default' && hasGlobalValue(path)) source = 'global';

    // 4. Check other breakpoints (Yellow dot)
    // If not set in current view, check if it's set in ANY other view
    let isResponsive = false;

    // Check desktop
    if (activeBreakpoint !== 'desktop' || pseudoState !== 'default') {
      if (hasValue(styling, path)) isResponsive = true;
    }

    // Check desktop pseudo-states
    if (!isResponsive) {
      for (const state of Object.keys(pseudoStateStyling)) {
        if (activeBreakpoint === 'desktop' && pseudoState === state) continue;
        if (hasValue(pseudoStateStyling[state as PseudoClass], path)) {
          isResponsive = true;
          break;
        }
      }
    }

    // Check breakpoints
    if (!isResponsive) {
      for (const bp of ['tablet', 'mobile'] as const) {
        const bpData = breakpointStyling[bp];
        if (!bpData) continue;

        // Check base breakpoint
        if (activeBreakpoint !== bp || pseudoState !== 'default') {
          if (hasValue(bpData, path)) {
            isResponsive = true;
            break;
          }
        }

        // Check breakpoint pseudo-states
        if (bpData.pseudoStates) {
          for (const state of Object.keys(bpData.pseudoStates)) {
            if (activeBreakpoint === bp && pseudoState === state) continue;
            if (hasValue(bpData.pseudoStates[state as PseudoClass], path)) {
              isResponsive = true;
              break;
            }
          }
        }
        if (isResponsive) break;
      }
    }

    return { source, isResponsive };
  }, [activeBreakpoint, pseudoState, styling, pseudoStateStyling, breakpointStyling]);

  // Deselect element
  const handleDeselect = useCallback(() => {
    editorActions.selectNode();
  }, [editorActions]);

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'content':
        return contentSettings;

      case 'general':
        return (
          <GeneralSettingsTab
            styling={activeStyling}
            activePseudoState={pseudoState}
            onPseudoStateChange={setPseudoState}
          />
        );

      case 'layout':
        return (
          <LayoutSettingsTab
            value={activeStyling.layout || {}}
            onChange={(layout) => handleStyleChange('layout', layout)}
            getStyleSource={getStyleSource}
          />
        );

      case 'typography':
        return (
          <TypographySettingsTab
            value={activeStyling.typography || {}}
            onChange={(typography) => handleStyleChange('typography', typography)}
            getStyleSource={getStyleSource}
          />
        );

      case 'background':
        return (
          <BackgroundSettingsTab
            value={activeStyling.background || {}}
            onChange={(background) => handleStyleChange('background', background)}
            getStyleSource={getStyleSource}
          />
        );

      case 'border':
        return (
          <div className="space-y-6">
            <BorderInput
              value={{ ...defaultBorderSettings, ...(activeStyling.border || {}) }}
              onChange={(border) => handleStyleChange('border', border)}
              getStyleSource={(path) => getStyleSource(`border.${path}`)}
            />
            <Separator />
            <div className="space-y-3">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Box Shadow
              </h4>
              <BoxShadowInput
                value={activeStyling.boxShadow || []}
                onChange={(boxShadow) => handleStyleChange('boxShadow', boxShadow)}
                getStyleSource={getStyleSource}
                path="boxShadow"
              />
            </div>
          </div>
        );

      case 'effects':
        return (
          <div className="space-y-6">
            {/* Transitions / Animations */}
            <div className="space-y-3">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Transitions & Animations
              </h4>
              <TransitionInput
                value={{ ...defaultTransitionSettings, ...(activeStyling.transition || {}) }}
                onChange={(transition) => handleStyleChange('transition', transition)}
                getStyleSource={getStyleSource}
                path="transition"
              />
            </div>

            <Separator />

            {/* Filters */}
            <div className="space-y-3">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Filters
              </h4>
              <FilterInput
                value={{ ...defaultFilterSettings, ...(activeStyling.filter || {}) }}
                onChange={(filter) => handleStyleChange('filter', filter)}
                getStyleSource={getStyleSource}
                path="filter"
              />
            </div>

            <Separator />

            {/* Backdrop Filter */}
            <BackdropFilterInput
              value={{ ...defaultBackdropFilterSettings, ...(activeStyling.backdropFilter || {}) }}
              onChange={(backdropFilter) => handleStyleChange('backdropFilter', backdropFilter)}
              getStyleSource={getStyleSource}
              path="backdropFilter"
            />
          </div>
        );

      case 'transform':
        return (
          <div className="space-y-6">
            {/* Transform */}
            <TransformInput
              value={{ ...defaultTransformSettings, ...(activeStyling.transform || {}) }}
              onChange={(transform) => handleStyleChange('transform', transform)}
              getStyleSource={getStyleSource}
              path="transform"
            />
          </div>
        );

      case 'attributes':
        return <AttributesTab />;

      case 'css':
        return <CustomCSSTab />;

      default:
        return null;
    }
  };

  // Get tab description
  const getTabDescription = (tabId: SettingsTabId): string => {
    const tab = ALL_SETTINGS_TABS.find(t => t.id === tabId);
    return tab?.description || '';
  };

  return (
    <TooltipProvider>
      <div className={cn('flex h-full bg-background', className)}>
        {/* Icon Sidebar */}
        <div className="w-12 border-r bg-muted/20 flex flex-col items-center py-2 gap-0.5 shrink-0">
          {visibleTabs.map((tabId) => {
            const Icon = TAB_ICONS[tabId];
            const isActive = activeTab === tabId;

            return (
              <Tooltip key={tabId}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setActiveTab(tabId)}
                    className={cn(
                      'w-9 h-9 rounded-md flex items-center justify-center transition-all duration-150',
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="flex flex-col gap-0.5">
                  <span className="font-medium">{TAB_LABELS[tabId]}</span>
                  <span className="text-xs text-muted-foreground">{getTabDescription(tabId)}</span>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header */}
          <InspectorHeader
            elementName={displayName}
            componentType={componentType}
            customName={customName}
            onRename={handleRename}
            pseudoState={pseudoState}
            onPseudoStateChange={setPseudoState}
            onDeselect={handleDeselect}
          />

          {/* Tab Content */}
          <ScrollArea className="flex-1">
            <div className="p-4">
              {renderTabContent()}
            </div>
          </ScrollArea>
        </div>
      </div>
    </TooltipProvider>
  );
}

/**
 * Wrapper to easily create settings for any component
 */
export function createElementSettings<P extends object>(
  ContentSettingsComponent: React.ComponentType<{
    props: P;
    setProp: (cb: (props: P) => void) => void;
  }>,
  options: {
    sections?: ElementSettingsSidebarProps['sections'];
  } = {}
) {
  return function ElementSettings() {
    const {
      actions: { setProp },
      props,
    } = useNode((node) => ({
      props: node.data.props as P,
    }));

    return (
      <ElementSettingsSidebar
        contentSettings={<ContentSettingsComponent props={props} setProp={setProp} />}
        sections={options.sections}
      />
    );
  };
}
