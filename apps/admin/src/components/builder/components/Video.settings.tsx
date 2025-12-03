// PagePress v0.0.6 - 2025-12-03
// Video component settings panel

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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { WidthInput } from '../inspector/inputs/WidthInput';
import { MediaPickerDialog } from '../inspector/MediaPickerDialog';
import type { VideoProps } from './Video';
import type { Media } from '@/lib/api';

/**
 * Settings panel for Video component
 */
export function VideoSettings() {
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);

  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as VideoProps,
  }));

  const handleMediaSelect = (media: Media) => {
    setProp((p: VideoProps) => (p.posterImage = media.url));
  };

  return (
    <>
      <Accordion type="multiple" defaultValue={['source', 'playback', 'layout']} className="w-full">
        {/* Source Section */}
        <AccordionItem value="source">
          <AccordionTrigger className="text-sm">Source</AccordionTrigger>
          <AccordionContent className="space-y-4">
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
                  <SelectItem value="mp4">MP4 File</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* URL */}
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

            {/* Poster Image (only for MP4) */}
            {props.source === 'mp4' && (
              <div className="space-y-2">
                <Label className="text-xs">Poster Image</Label>
                <div className="flex gap-2">
                  <Input
                    value={props.posterImage || ''}
                    onChange={(e) => setProp((p: VideoProps) => (p.posterImage = e.target.value))}
                    placeholder="Image URL..."
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setMediaPickerOpen(true)}
                  >
                    Browse
                  </Button>
                </div>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Playback Section */}
        <AccordionItem value="playback">
          <AccordionTrigger className="text-sm">Playback</AccordionTrigger>
          <AccordionContent className="space-y-4">
            {/* Controls */}
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

            {/* Autoplay */}
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

            {/* Muted */}
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

            {/* Loop */}
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
          </AccordionContent>
        </AccordionItem>

        {/* Layout Section */}
        <AccordionItem value="layout">
          <AccordionTrigger className="text-sm">Layout</AccordionTrigger>
          <AccordionContent className="space-y-4">
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
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Media Picker Dialog */}
      <MediaPickerDialog
        open={mediaPickerOpen}
        onOpenChange={setMediaPickerOpen}
        onSelect={handleMediaSelect}
        accept="image"
      />
    </>
  );
}
