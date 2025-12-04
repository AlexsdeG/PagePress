// PagePress v0.0.9 - 2025-12-04
// Video component settings panel with ElementSettingsSidebar

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
import { FolderOpen, Image as ImageIcon } from 'lucide-react';
import { WidthInput } from '../inspector/inputs/WidthInput';
import { MediaPickerDialog } from '../inspector/MediaPickerDialog';
import { ElementSettingsSidebar } from '../inspector/sidebar';
import type { VideoProps } from './Video';
import type { Media } from '@/lib/api';

/**
 * Content-specific settings for Video
 */
function VideoContentSettings({
  props,
  setProp,
}: {
  props: VideoProps;
  setProp: (cb: (props: VideoProps) => void) => void;
}) {
  const [videoPickerOpen, setVideoPickerOpen] = useState(false);
  const [posterPickerOpen, setPosterPickerOpen] = useState(false);

  const handleVideoSelect = (media: Media) => {
    setProp((p: VideoProps) => (p.url = media.url));
  };

  const handlePosterSelect = (media: Media) => {
    setProp((p: VideoProps) => (p.posterImage = media.url));
  };

  return (
    <>
      <div className="space-y-4">
        {/* Source Type */}
        <div className="space-y-2">
          <Label className="text-xs">Source Type</Label>
          <Select
            value={props.source || 'youtube'}
            onValueChange={(value) => setProp((p: VideoProps) => (p.source = value as VideoProps['source']))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="youtube">YouTube</SelectItem>
              <SelectItem value="vimeo">Vimeo</SelectItem>
              <SelectItem value="mp4">MP4 URL</SelectItem>
              <SelectItem value="upload">Uploaded Video</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* URL / Upload */}
        {props.source === 'upload' ? (
          <div className="space-y-2">
            <Label className="text-xs">Video File</Label>
            <div className="flex gap-2">
              <Input
                value={props.url || ''}
                onChange={(e) => setProp((p: VideoProps) => (p.url = e.target.value))}
                placeholder="Select from media library..."
                className="flex-1"
                readOnly
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setVideoPickerOpen(true)}
                title="Browse media library"
              >
                <FolderOpen className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Label className="text-xs">
              {props.source === 'youtube' ? 'YouTube URL' :
               props.source === 'vimeo' ? 'Vimeo URL' :
               'MP4 URL'}
            </Label>
            <Input
              value={props.url || ''}
              onChange={(e) => setProp((p: VideoProps) => (p.url = e.target.value))}
              placeholder={
                props.source === 'youtube' ? 'https://www.youtube.com/watch?v=...' :
                props.source === 'vimeo' ? 'https://vimeo.com/...' :
                'https://example.com/video.mp4'
              }
            />
          </div>
        )}

        {/* Poster Image (for MP4 and upload) */}
        {(props.source === 'mp4' || props.source === 'upload') && (
          <div className="space-y-2">
            <Label className="text-xs">Poster Image</Label>
            <div className="flex gap-2">
              <Input
                value={props.posterImage || ''}
                onChange={(e) => setProp((p: VideoProps) => (p.posterImage = e.target.value))}
                placeholder="Select poster image..."
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPosterPickerOpen(true)}
                title="Browse images"
              >
                <ImageIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Playback Options */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="controls"
            checked={props.controls ?? true}
            onChange={(e) => setProp((p: VideoProps) => (p.controls = e.target.checked))}
            className="rounded border-gray-300"
          />
          <Label htmlFor="controls" className="text-xs">Show Controls</Label>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="autoplay"
            checked={props.autoplay || false}
            onChange={(e) => setProp((p: VideoProps) => (p.autoplay = e.target.checked))}
            className="rounded border-gray-300"
          />
          <Label htmlFor="autoplay" className="text-xs">Autoplay</Label>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="muted"
            checked={props.muted || false}
            onChange={(e) => setProp((p: VideoProps) => (p.muted = e.target.checked))}
            className="rounded border-gray-300"
          />
          <Label htmlFor="muted" className="text-xs">Muted</Label>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="loop"
            checked={props.loop || false}
            onChange={(e) => setProp((p: VideoProps) => (p.loop = e.target.checked))}
            className="rounded border-gray-300"
          />
          <Label htmlFor="loop" className="text-xs">Loop</Label>
        </div>

        {props.autoplay && !props.muted && (
          <p className="text-xs text-amber-600">
            Note: Most browsers require videos to be muted for autoplay to work.
          </p>
        )}

        {/* Aspect Ratio */}
        <div className="space-y-2">
          <Label className="text-xs">Aspect Ratio</Label>
          <Select
            value={props.aspectRatio || '16:9'}
            onValueChange={(value) => setProp((p: VideoProps) => (p.aspectRatio = value as VideoProps['aspectRatio']))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="16:9">16:9 (Widescreen)</SelectItem>
              <SelectItem value="4:3">4:3 (Standard)</SelectItem>
              <SelectItem value="1:1">1:1 (Square)</SelectItem>
              <SelectItem value="21:9">21:9 (Ultrawide)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Width */}
        <WidthInput
          label="Width"
          value={props.width || '100%'}
          onChange={(value) => setProp((p: VideoProps) => (p.width = value))}
          allowedUnits={['%', 'px', 'vw']}
        />

        {/* Custom Classes */}
        <div className="space-y-2">
          <Label className="text-xs">Custom Classes</Label>
          <Input
            value={props.className || ''}
            onChange={(e) => setProp((p: VideoProps) => (p.className = e.target.value))}
            placeholder="Enter Tailwind classes..."
          />
        </div>
      </div>

      {/* Media Picker Dialog - Video */}
      <MediaPickerDialog
        open={videoPickerOpen}
        onOpenChange={setVideoPickerOpen}
        onSelect={handleVideoSelect}
        accept="video"
      />
      
      {/* Media Picker Dialog - Poster Image */}
      <MediaPickerDialog
        open={posterPickerOpen}
        onOpenChange={setPosterPickerOpen}
        onSelect={handlePosterSelect}
        accept="image"
      />
    </>
  );
}

/**
 * Settings panel for Video component
 * All style tabs are available by default
 */
export function VideoSettings() {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as VideoProps,
  }));

  return (
    <ElementSettingsSidebar
      contentSettings={
        <VideoContentSettings
          props={props}
          setProp={setProp}
        />
      }
    />
  );
}
