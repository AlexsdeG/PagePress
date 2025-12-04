// PagePress v0.0.9 - 2025-12-04
// Image component settings panel with ElementSettingsSidebar

import { useState } from 'react';
import { useNode } from '@craftjs/core';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FolderOpen } from 'lucide-react';
import { MediaPickerDialog, getProxiedUrl } from '../inspector/MediaPickerDialog';
import { ElementSettingsSidebar } from '../inspector/sidebar';
import type { ImageProps } from '../types';

/**
 * Content-specific settings for Image
 */
function ImageContentSettings({
  props,
  setProp,
}: {
  props: ImageProps;
  setProp: (cb: (props: ImageProps) => void) => void;
}) {
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);

  // Get proxied URL for preview
  const previewUrl = props.src ? getProxiedUrl(props.src) : '';

  return (
    <>
      <div className="space-y-4">
        {/* Image URL with Media Picker */}
        <div className="space-y-2">
          <Label className="text-xs">Image URL</Label>
          <div className="flex gap-2">
            <Input
              value={props.src || ''}
              onChange={(e) => setProp((p: ImageProps) => (p.src = e.target.value))}
              placeholder="Enter URL or select..."
              className="flex-1"
            />
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setMediaPickerOpen(true)}
              title="Browse media library"
            >
              <FolderOpen className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Image preview - constrained size */}
          {props.src && (
            <div className="mt-2 rounded-md overflow-hidden border bg-muted w-full max-w-full">
              <div className="w-full h-24 relative">
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = '<div class="flex items-center justify-center h-full text-xs text-muted-foreground">Invalid URL or image failed to load</div>';
                    }
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Alt Text */}
        <div className="space-y-2">
          <Label className="text-xs">Alt Text</Label>
          <Input
            value={props.alt || ''}
            onChange={(e) => setProp((p: ImageProps) => (p.alt = e.target.value))}
            placeholder="Describe the image..."
          />
          <p className="text-xs text-muted-foreground">
            Important for accessibility and SEO
          </p>
        </div>

        {/* Object Fit */}
        <div className="space-y-2">
          <Label className="text-xs">Object Fit</Label>
          <Select
            value={props.objectFit || 'cover'}
            onValueChange={(value) => setProp((p: ImageProps) => (p.objectFit = value as ImageProps['objectFit']))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cover">Cover</SelectItem>
              <SelectItem value="contain">Contain</SelectItem>
              <SelectItem value="fill">Fill</SelectItem>
              <SelectItem value="none">None</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            How the image fits within its container
          </p>
        </div>

        {/* Custom Classes */}
        <div className="space-y-2">
          <Label className="text-xs">Custom Classes</Label>
          <Input
            value={props.className || ''}
            onChange={(e) => setProp((p: ImageProps) => (p.className = e.target.value))}
            placeholder="Enter Tailwind classes..."
          />
        </div>
      </div>

      {/* Media Picker Dialog */}
      <MediaPickerDialog
        open={mediaPickerOpen}
        onOpenChange={setMediaPickerOpen}
        onSelect={(media) => {
          setProp((p: ImageProps) => {
            p.src = media.url;
            if (media.altText) {
              p.alt = media.altText;
            }
          });
        }}
        accept="image"
      />
    </>
  );
}

/**
 * Settings panel for Image component
 * All style tabs are available by default
 */
export function ImageSettings() {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as ImageProps,
  }));

  return (
    <ElementSettingsSidebar
      contentSettings={
        <ImageContentSettings
          props={props}
          setProp={setProp}
        />
      }
    />
  );
}
