// PagePress v0.0.6 - 2025-12-03
// Media picker dialog for selecting images from the media library

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api, type Media } from '@/lib/api';
import { cn } from '@/lib/utils';

interface MediaPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (media: Media) => void;
  accept?: 'image' | 'video' | 'all';
}

/**
 * Convert absolute URLs to relative for Vite proxy
 */
function getProxiedUrl(url: string): string {
  if (!url) return '';
  // If the URL is from localhost:3000, convert to relative /uploads path
  if (url.includes('localhost:3000/uploads/')) {
    return url.replace(/http:\/\/localhost:3000/, '');
  }
  return url;
}

/**
 * Media picker dialog component
 */
export function MediaPickerDialog({
  open,
  onOpenChange,
  onSelect,
  accept = 'image',
}: MediaPickerDialogProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Fetch media
  const { data, isLoading } = useQuery({
    queryKey: ['media', 'picker', accept],
    queryFn: async () => {
      const response = await api.media.list({ limit: 100 });
      return response.media;
    },
    enabled: open,
  });

  // Filter media based on accept type and search
  const filteredMedia = data?.filter((item) => {
    // Filter by type
    if (accept === 'image' && !item.mimeType.startsWith('image/')) {
      return false;
    }
    if (accept === 'video' && !item.mimeType.startsWith('video/')) {
      return false;
    }
    
    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        item.originalName.toLowerCase().includes(searchLower) ||
        (item.altText?.toLowerCase().includes(searchLower) ?? false)
      );
    }
    
    return true;
  }) ?? [];

  // Reset selection when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedId(null);
      setSearch('');
    }
  }, [open]);

  // Handle selection confirm
  const handleConfirm = () => {
    const selected = filteredMedia.find((m) => m.id === selectedId);
    if (selected) {
      onSelect(selected);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Media</DialogTitle>
          <DialogDescription>
            Choose an image from your media library
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="flex gap-2">
          <Input
            placeholder="Search media..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />
        </div>

        {/* Media Grid */}
        <div className="flex-1 overflow-auto min-h-[300px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : filteredMedia.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>No media found</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-4 p-2">
              {filteredMedia.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className={cn(
                    'relative aspect-square rounded-lg overflow-hidden border-2 transition-all',
                    'hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary',
                    selectedId === item.id
                      ? 'border-primary ring-2 ring-primary'
                      : 'border-transparent'
                  )}
                >
                  {item.mimeType.startsWith('image/') ? (
                    <img
                      src={getProxiedUrl(item.url)}
                      alt={item.altText || item.originalName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <span className="text-4xl">🎬</span>
                    </div>
                  )}
                  
                  {/* Selected checkmark */}
                  {selectedId === item.id && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">✓</span>
                    </div>
                  )}
                  
                  {/* Filename overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
                    <p className="text-white text-xs truncate">
                      {item.originalName}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            {filteredMedia.length} items
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirm} disabled={!selectedId}>
              Select
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
