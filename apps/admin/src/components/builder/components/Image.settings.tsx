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
import { MediaPickerDialog } from '../inspector/MediaPickerDialog';
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
              size="sm"
              onClick={() => setMediaPickerOpen(true)}
            >
              📁
            </Button>
          </div>
          
          {/* Image preview */}
          {props.src && (
            <div className="mt-2 rounded-md overflow-hidden border bg-muted">
              <img 
                src={props.src} 
                alt="Preview" 
                className="w-full h-24 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23ccc" width="100%" height="100%"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23666">Invalid URL</text></svg>';
                }}
              />
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
        </div>

        {/* Width */}
        <div className="space-y-2">
          <Label className="text-xs">Width</Label>
          <Select
            value={String(props.width || 'full')}
            onValueChange={(value) => {
              if (value === 'auto' || value === 'full') {
                setProp((p: ImageProps) => (p.width = value));
              } else {
                setProp((p: ImageProps) => (p.width = Number(value)));
              }
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto</SelectItem>
              <SelectItem value="full">Full Width</SelectItem>
              <SelectItem value="200">200px</SelectItem>
              <SelectItem value="300">300px</SelectItem>
              <SelectItem value="400">400px</SelectItem>
              <SelectItem value="500">500px</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Height */}
        <div className="space-y-2">
          <Label className="text-xs">Height</Label>
          <Select
            value={String(props.height || 'auto')}
            onValueChange={(value) => {
              if (value === 'auto') {
                setProp((p: ImageProps) => (p.height = value));
              } else {
                setProp((p: ImageProps) => (p.height = Number(value)));
              }
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto</SelectItem>
              <SelectItem value="100">100px</SelectItem>
              <SelectItem value="200">200px</SelectItem>
              <SelectItem value="300">300px</SelectItem>
              <SelectItem value="400">400px</SelectItem>
              <SelectItem value="500">500px</SelectItem>
            </SelectContent>
          </Select>
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
