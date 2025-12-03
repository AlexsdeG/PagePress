// PagePress v0.0.6 - 2025-12-03
// Lucide icon picker dialog

import { useState, useMemo, createElement } from 'react';
import * as LucideIcons from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface IconPickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

/**
 * Curated list of commonly used icons
 */
const ICON_LIST = [
  // Navigation
  'Home', 'Menu', 'X', 'ChevronLeft', 'ChevronRight', 'ChevronUp', 'ChevronDown',
  'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'ExternalLink', 'Link',
  
  // Actions
  'Plus', 'Minus', 'Search', 'Settings', 'Edit', 'Trash2', 'Copy', 'Download',
  'Upload', 'Share', 'Send', 'Save', 'Check', 'RefreshCw', 'RotateCw',
  
  // Communication
  'Mail', 'Phone', 'MessageCircle', 'MessageSquare', 'Bell', 'AtSign',
  
  // Media
  'Image', 'Video', 'Music', 'Play', 'Pause', 'SkipBack', 'SkipForward',
  'Volume2', 'VolumeX', 'Camera', 'Mic', 'Film',
  
  // Social
  'Heart', 'ThumbsUp', 'ThumbsDown', 'Star', 'Bookmark', 'Share2', 'Users', 'User',
  
  // Layout
  'Grid', 'List', 'Columns', 'Rows', 'LayoutGrid', 'Layers', 'Square', 'Circle',
  
  // Files
  'File', 'FileText', 'Folder', 'FolderOpen', 'Archive', 'Paperclip',
  
  // Info
  'Info', 'AlertCircle', 'AlertTriangle', 'HelpCircle', 'CheckCircle', 'XCircle',
  
  // Commerce
  'ShoppingCart', 'ShoppingBag', 'CreditCard', 'DollarSign', 'Tag', 'Gift',
  
  // Weather & Nature
  'Sun', 'Moon', 'Cloud', 'CloudRain', 'Zap', 'Snowflake',
  
  // Tech
  'Laptop', 'Smartphone', 'Tablet', 'Monitor', 'Wifi', 'Bluetooth', 'Globe', 'Code',
  
  // Building
  'Building', 'Building2', 'MapPin', 'Map', 'Navigation', 'Compass',
  
  // Time
  'Clock', 'Calendar', 'Timer', 'Watch', 'Hourglass',
  
  // Misc
  'Eye', 'EyeOff', 'Lock', 'Unlock', 'Key', 'Shield', 'Award', 'Trophy',
  'Lightbulb', 'Rocket', 'Target', 'Flag', 'Sparkles', 'Wand2',
] as const;

/**
 * Get icon component by name
 */
export function getIconComponent(name: string): LucideIcons.LucideIcon | null {
  // Access icons via index signature
  const iconModule = LucideIcons as unknown as Record<string, LucideIcons.LucideIcon>;
  return iconModule[name] ?? null;
}

/**
 * Render icon element directly (avoids component creation during render)
 */
export function renderIcon(name: string, props: LucideIcons.LucideProps = {}) {
  const Icon = getIconComponent(name);
  if (!Icon) return null;
  return createElement(Icon, props);
}

/**
 * Icon picker with search and grid display
 */
export function IconPicker({ value, onChange, label = 'Icon' }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredIcons = useMemo(() => {
    if (!search.trim()) return ICON_LIST;
    const query = search.toLowerCase();
    return ICON_LIST.filter((name) => name.toLowerCase().includes(query));
  }, [search]);

  const handleSelect = (iconName: string) => {
    onChange(iconName);
    setOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setOpen(false);
  };

  return (
    <div className="space-y-2">
      {label && <Label className="text-xs">{label}</Label>}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="w-full h-10 justify-start gap-2"
          >
            {value ? (
              <>
                {renderIcon(value, { className: 'h-4 w-4' })}
                <span className="text-sm">{value}</span>
              </>
            ) : (
              <span className="text-muted-foreground text-sm">Select icon...</span>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Select Icon</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Search icons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9"
            />
            <ScrollArea className="h-[300px]">
              <div className="grid grid-cols-6 gap-2 p-1">
                {filteredIcons.map((iconName) => (
                  <button
                    key={iconName}
                    onClick={() => handleSelect(iconName)}
                    className={cn(
                      'flex items-center justify-center p-2 rounded-md border transition-colors',
                      'hover:bg-accent hover:border-primary/50',
                      value === iconName && 'bg-primary/10 border-primary'
                    )}
                    title={iconName}
                  >
                    {renderIcon(iconName, { className: 'h-5 w-5' })}
                  </button>
                ))}
              </div>
              {filteredIcons.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No icons found
                </div>
              )}
            </ScrollArea>
            {value && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClear}
                className="w-full"
              >
                Clear Selection
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
