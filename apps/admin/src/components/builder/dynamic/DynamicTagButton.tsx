// PagePress v0.0.16 - 2026-02-28
// DynamicTagButton — Lightning icon button for binding dynamic data to inputs

import { useState, useCallback } from 'react';
import { Zap, X, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  DYNAMIC_DATA_SOURCES,
  type DynamicBinding,
} from './types';
import type { DynamicDataSourceItem } from '@/lib/api';

interface DynamicTagButtonProps {
  /** Current binding (if any) */
  binding?: DynamicBinding;
  /** Callback when a binding is set or cleared */
  onBindingChange: (binding: DynamicBinding | undefined) => void;
  /** Filter by value type (e.g., only show image sources for image inputs) */
  valueTypeFilter?: DynamicDataSourceItem['valueType'][];
  /** Additional class name */
  className?: string;
}

/**
 * Category labels & icons
 */
const CATEGORY_CONFIG: Record<string, { label: string; color: string }> = {
  site: { label: 'Site', color: 'bg-blue-500/15 text-blue-600 dark:text-blue-400' },
  page: { label: 'Page', color: 'bg-green-500/15 text-green-600 dark:text-green-400' },
  user: { label: 'User', color: 'bg-purple-500/15 text-purple-600 dark:text-purple-400' },
  custom: { label: 'Custom', color: 'bg-orange-500/15 text-orange-600 dark:text-orange-400' },
};

/**
 * DynamicTagButton — Shows a lightning icon button. When clicked, opens a popover
 * to pick a dynamic data source and set a fallback value.
 */
export function DynamicTagButton({
  binding,
  onBindingChange,
  valueTypeFilter,
  className,
}: DynamicTagButtonProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [fallbackValue, setFallbackValue] = useState(binding?.fallback ?? '');

  const hasBind = !!binding;

  // Filter sources by type if needed
  const filteredSources = DYNAMIC_DATA_SOURCES.filter((source) => {
    if (valueTypeFilter && !valueTypeFilter.includes(source.valueType)) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      source.label.toLowerCase().includes(q) ||
      source.field.toLowerCase().includes(q) ||
      source.description.toLowerCase().includes(q)
    );
  });

  // Group by category
  const groupedSources = filteredSources.reduce<Record<string, DynamicDataSourceItem[]>>(
    (acc, source) => {
      if (!acc[source.category]) acc[source.category] = [];
      acc[source.category].push(source);
      return acc;
    },
    {}
  );

  const handleSelectSource = useCallback(
    (source: DynamicDataSourceItem) => {
      onBindingChange({
        field: source.field,
        fallback: fallbackValue,
      });
      setOpen(false);
    },
    [onBindingChange, fallbackValue]
  );

  const handleClearBinding = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onBindingChange(undefined);
      setFallbackValue('');
    },
    [onBindingChange]
  );

  const handleFallbackChange = useCallback(
    (value: string) => {
      setFallbackValue(value);
      if (binding) {
        onBindingChange({ ...binding, fallback: value });
      }
    },
    [binding, onBindingChange]
  );

  // Find current source label
  const currentSource = binding
    ? DYNAMIC_DATA_SOURCES.find((s) => s.field === binding.field)
    : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={hasBind ? 'default' : 'ghost'}
          size="icon"
          className={cn(
            'h-7 w-7 shrink-0',
            hasBind
              ? 'bg-amber-500 hover:bg-amber-600 text-white'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted',
            className
          )}
          title={hasBind ? `Dynamic: ${currentSource?.label ?? binding?.field}` : 'Add dynamic data'}
        >
          <Zap className="h-3.5 w-3.5" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-0" align="end" sideOffset={8}>
        {/* Header */}
        <div className="px-3 py-2.5 border-b">
          <h4 className="text-sm font-medium">Dynamic Data</h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            Bind a dynamic value to this field
          </p>
        </div>

        {/* Current binding */}
        {hasBind && currentSource && (
          <div className="px-3 py-2 border-b bg-amber-500/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <Zap className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <span className="text-xs font-medium truncate">
                  {currentSource.label}
                </span>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  {currentSource.field}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 text-muted-foreground hover:text-destructive"
                onClick={handleClearBinding}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>

            {/* Fallback value */}
            <div className="mt-2">
              <Label className="text-[10px] text-muted-foreground">Fallback Value</Label>
              <Input
                value={fallbackValue}
                onChange={(e) => handleFallbackChange(e.target.value)}
                placeholder="Default if data is empty..."
                className="h-7 text-xs mt-1"
              />
            </div>
          </div>
        )}

        {/* Search */}
        <div className="px-3 py-2 border-b">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search data sources..."
              className="h-7 pl-7 text-xs"
            />
          </div>
        </div>

        {/* Source list */}
        <ScrollArea className="max-h-[280px]">
          <div className="p-2">
            {Object.entries(groupedSources).map(([category, sources]) => (
              <div key={category} className="mb-2 last:mb-0">
                <div className="px-2 py-1">
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-[10px] font-medium border-0',
                      CATEGORY_CONFIG[category]?.color
                    )}
                  >
                    {CATEGORY_CONFIG[category]?.label ?? category}
                  </Badge>
                </div>
                {sources.map((source) => (
                  <button
                    key={source.field}
                    onClick={() => handleSelectSource(source)}
                    className={cn(
                      'w-full text-left px-2 py-1.5 rounded-md text-sm transition-colors',
                      'hover:bg-muted flex flex-col gap-0.5',
                      binding?.field === source.field && 'bg-muted ring-1 ring-amber-500/30'
                    )}
                  >
                    <span className="font-medium text-xs">{source.label}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {source.description}
                    </span>
                  </button>
                ))}
                <Separator className="mt-1" />
              </div>
            ))}

            {filteredSources.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">
                No data sources found
              </p>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
