// PagePress v0.0.9 - 2025-12-04
// Element Settings Sidebar - Bricks-style icon navigation with all tabs

import { useState, useCallback, useRef, useEffect, type ReactNode } from 'react';
import { useNode } from '@craftjs/core';
import {
  Settings,
  LayoutGrid,
  Type,
  Paintbrush,
  Square,
  Sparkles,
  Move3d,
  FileText,
  Code,
  Braces,
  X,
  Check,
  Pencil,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { GeneralSettingsTab } from './GeneralSettingsTab';
import { CustomCSSTab } from './CustomCSSTab';
import { AttributesTab } from './AttributesTab';
import { LayoutSettingsTab } from '../styles/LayoutSettingsTab';
import { TypographySettingsTab } from '../styles/TypographySettingsTab';
import { BackgroundSettingsTab } from '../styles/BackgroundSettingsTab';
import { BorderInput, defaultBorderSettings } from '../inputs/BorderInput';
import { BoxShadowInput } from '../inputs/BoxShadowInput';
import { FilterInput, BackdropFilterInput, defaultFilterSettings, defaultBackdropFilterSettings } from '../inputs/FilterInput';
import { TransformInput, defaultTransformSettings } from '../inputs/TransformInput';
import { TransitionInput, defaultTransitionSettings } from '../inputs/TransitionInput';
import type { AdvancedStyling } from '../styles/types';
import type { SettingsTabId, ElementMetadata, PseudoClass } from './types';
import { COMPONENT_TYPE_LABELS, getComponentBadgeColor, ALL_SETTINGS_TABS } from './types';
import { Badge } from '@/components/ui/badge';
import { useEditor } from '@craftjs/core';

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
  const [isEditingName, setIsEditingName] = useState(false);
  const [editingNameValue, setEditingNameValue] = useState('');
  const nameInputRef = useRef<HTMLInputElement>(null);

  const { actions: editorActions } = useEditor();

  const {
    actions: { setProp },
    displayName,
    componentType,
    customName,
    styling,
    pseudoStateStyling,
    nodeId,
  } = useNode((node) => ({
    nodeId: node.id,
    displayName: node.data.displayName || node.data.name || 'Element',
    componentType: node.data.name || 'Unknown',
    customName: (node.data.props.metadata as ElementMetadata | undefined)?.customName,
    styling: (node.data.props.advancedStyling || {}) as AdvancedStyling,
    pseudoStateStyling: (node.data.props.pseudoStateStyling || {}) as Partial<Record<PseudoClass, Partial<AdvancedStyling>>>,
  }));

  // Focus input when editing starts
  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditingName]);

  // Start editing name
  const handleStartEditName = useCallback(() => {
    setEditingNameValue(customName || '');
    setIsEditingName(true);
  }, [customName]);

  // Save the name
  const handleSaveName = useCallback(() => {
    setProp((props: Record<string, unknown>) => {
      const metadata = (props.metadata || { elementId: nodeId }) as ElementMetadata;
      props.metadata = { ...metadata, customName: editingNameValue.trim() || undefined };
    });
    setIsEditingName(false);
    if (editingNameValue.trim()) {
      toast.success('Element renamed');
    }
  }, [setProp, nodeId, editingNameValue]);

  // Cancel editing
  const handleCancelEditName = useCallback(() => {
    setIsEditingName(false);
    setEditingNameValue('');
  }, []);

  // Handle keyboard in edit mode
  const handleNameKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveName();
    } else if (e.key === 'Escape') {
      handleCancelEditName();
    }
  }, [handleSaveName, handleCancelEditName]);

  // Get the active styling based on current pseudo state
  const getActiveStyling = useCallback((): AdvancedStyling => {
    if (pseudoState === 'default') {
      return styling;
    }
    // For pseudo states, merge base styling with pseudo-specific overrides
    const pseudoStyles = pseudoStateStyling[pseudoState] || {};
    return {
      ...styling,
      ...pseudoStyles,
    };
  }, [pseudoState, styling, pseudoStateStyling]);

  const activeStyling = getActiveStyling();

  // Update a specific style category (handles pseudo states)
  const handleStyleChange = useCallback(
    <K extends keyof AdvancedStyling>(category: K, value: AdvancedStyling[K]) => {
      if (pseudoState === 'default') {
        // Writing to base styling
        setProp((props: Record<string, unknown>) => {
          props.advancedStyling = {
            ...(props.advancedStyling as AdvancedStyling || {}),
            [category]: value,
          };
        });
      } else {
        // Writing to pseudo state styling
        setProp((props: Record<string, unknown>) => {
          const currentPseudoStyles = (props.pseudoStateStyling || {}) as Partial<Record<PseudoClass, Partial<AdvancedStyling>>>;
          props.pseudoStateStyling = {
            ...currentPseudoStyles,
            [pseudoState]: {
              ...(currentPseudoStyles[pseudoState] || {}),
              [category]: value,
            },
          };
        });
      }
    },
    [setProp, pseudoState]
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

  const typeLabel = COMPONENT_TYPE_LABELS[componentType] || componentType;
  const badgeColor = getComponentBadgeColor(componentType);
  const elementName = customName || displayName;

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
          />
        );
      
      case 'typography':
        return (
          <TypographySettingsTab
            value={activeStyling.typography || {}}
            onChange={(typography) => handleStyleChange('typography', typography)}
          />
        );
      
      case 'background':
        return (
          <BackgroundSettingsTab
            value={activeStyling.background || {}}
            onChange={(background) => handleStyleChange('background', background)}
          />
        );
      
      case 'border':
        return (
          <div className="space-y-6">
            <BorderInput
              value={{ ...defaultBorderSettings, ...(activeStyling.border || {}) }}
              onChange={(border) => handleStyleChange('border', border)}
            />
            <Separator />
            <div className="space-y-3">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Box Shadow
              </h4>
              <BoxShadowInput
                value={activeStyling.boxShadow || []}
                onChange={(boxShadow) => handleStyleChange('boxShadow', boxShadow)}
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
              />
            </div>

            <Separator />

            {/* Backdrop Filter */}
            <BackdropFilterInput
              value={{ ...defaultBackdropFilterSettings, ...(activeStyling.backdropFilter || {}) }}
              onChange={(backdropFilter) => handleStyleChange('backdropFilter', backdropFilter)}
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
          <div className="px-4 py-3 border-b bg-muted/10 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <Badge className={cn('text-[10px] px-1.5 py-0.5 shrink-0 border', badgeColor)}>
                  {typeLabel}
                </Badge>
                {isEditingName ? (
                  <div className="flex items-center gap-1 flex-1 min-w-0">
                    <Input
                      ref={nameInputRef}
                      value={editingNameValue}
                      onChange={(e) => setEditingNameValue(e.target.value)}
                      onBlur={handleSaveName}
                      onKeyDown={handleNameKeyDown}
                      placeholder={displayName}
                      className="h-6 text-sm flex-1 min-w-0"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0"
                      onClick={handleSaveName}
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <button
                    onClick={handleStartEditName}
                    className="flex items-center gap-1 min-w-0 group hover:text-primary transition-colors"
                    title="Click to rename element"
                  >
                    <span className="text-sm font-medium truncate">{elementName}</span>
                    <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-50 shrink-0" />
                  </button>
                )}
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground ml-2"
                    onClick={handleDeselect}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  Deselect element
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                {TAB_LABELS[activeTab]}
              </span>
              {pseudoState !== 'default' && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 font-mono text-purple-600 dark:text-purple-400 border-purple-500/30">
                  :{pseudoState}
                </Badge>
              )}
            </div>
          </div>

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
