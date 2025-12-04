// PagePress v0.0.10 - 2025-12-04
// Page-specific settings panel

import { useState, useEffect } from 'react';
import { X, Settings, Search, Share2, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useGlobalSettingsStore } from '../global/globalSettingsStore';
import { DEFAULT_PAGE_SETTINGS, type PageSettings } from '../global/types';
import { GeneralTab } from './tabs/GeneralTab';
import { SeoTab } from './tabs/SeoTab';
import { SocialTab } from './tabs/SocialTab';
import { CustomCodeTab } from './tabs/CustomCodeTab';

interface PageSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  pageId: string;
}

type TabId = 'general' | 'seo' | 'social' | 'code';

const TABS = [
  { id: 'general' as TabId, label: 'General', icon: Settings },
  { id: 'seo' as TabId, label: 'SEO', icon: Search },
  { id: 'social' as TabId, label: 'Social', icon: Share2 },
  { id: 'code' as TabId, label: 'Custom Code', icon: Code },
];

/**
 * Page settings panel - slide-out panel for page-specific settings
 */
export function PageSettingsPanel({
  isOpen,
  onClose,
  pageId,
}: PageSettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>('general');
  const [settings, setSettings] = useState<PageSettings>(DEFAULT_PAGE_SETTINGS);
  const [isLoading, setIsLoading] = useState(false);

  const { loadPageSettings, updatePageSettings } = useGlobalSettingsStore();

  // Load page settings when panel opens
  useEffect(() => {
    if (!isOpen || !pageId) return;
    
    let cancelled = false;
    
    const load = async () => {
      setIsLoading(true);
      try {
        const loaded = await loadPageSettings(pageId);
        if (!cancelled) {
          setSettings({ ...DEFAULT_PAGE_SETTINGS, ...loaded });
        }
      } catch (error) {
        console.error('Failed to load page settings:', error);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };
    
    load();
    
    return () => {
      cancelled = true;
    };
  }, [isOpen, pageId, loadPageSettings]);

  // Update settings handler
  const handleUpdate = (updates: Partial<PageSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    updatePageSettings(pageId, updates).catch(console.error);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />

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
            <h2 className="font-semibold text-sm">Page Settings</h2>
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

              {!isLoading && (
                <>
                  {activeTab === 'general' && (
                    <GeneralTab settings={settings} onUpdate={handleUpdate} />
                  )}
                  {activeTab === 'seo' && (
                    <SeoTab settings={settings} onUpdate={handleUpdate} />
                  )}
                  {activeTab === 'social' && (
                    <SocialTab settings={settings} onUpdate={handleUpdate} />
                  )}
                  {activeTab === 'code' && (
                    <CustomCodeTab settings={settings} onUpdate={handleUpdate} />
                  )}
                </>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </>
  );
}
