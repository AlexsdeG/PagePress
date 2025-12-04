// PagePress v0.0.7 - 2025-12-04
// Background Settings Tab Component

import { useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
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
import { HexColorPicker } from 'react-colorful';
import { Image, X } from 'lucide-react';
import type { BackgroundSettings, BackgroundImageSettings, BackgroundOverlaySettings } from '../styles/types';
import { GradientInput, defaultGradient } from '../inputs/GradientInput';
import { gradientToCSS } from './styleToCSS';

interface BackgroundSettingsTabProps {
  value: Partial<BackgroundSettings>;
  onChange: (value: Partial<BackgroundSettings>) => void;
  className?: string;
}

/**
 * Default background settings
 */
export const defaultBackgroundSettings: BackgroundSettings = {
  type: 'none',
};

/**
 * Background type options
 */
const backgroundTypeOptions: { value: BackgroundSettings['type']; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'color', label: 'Color' },
  { value: 'gradient', label: 'Gradient' },
  { value: 'image', label: 'Image' },
  { value: 'video', label: 'Video' },
];

/**
 * Background size options
 */
const backgroundSizeOptions: { value: BackgroundImageSettings['size']; label: string }[] = [
  { value: 'cover', label: 'Cover' },
  { value: 'contain', label: 'Contain' },
  { value: 'auto', label: 'Auto' },
  { value: 'custom', label: 'Custom' },
];

/**
 * Background position options
 */
const backgroundPositionOptions: { value: BackgroundImageSettings['position']; label: string }[] = [
  { value: 'center', label: 'Center' },
  { value: 'top', label: 'Top' },
  { value: 'bottom', label: 'Bottom' },
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
  { value: 'top-left', label: 'Top Left' },
  { value: 'top-right', label: 'Top Right' },
  { value: 'bottom-left', label: 'Bottom Left' },
  { value: 'bottom-right', label: 'Bottom Right' },
  { value: 'custom', label: 'Custom' },
];

/**
 * Background repeat options
 */
const backgroundRepeatOptions: { value: BackgroundImageSettings['repeat']; label: string }[] = [
  { value: 'no-repeat', label: 'No Repeat' },
  { value: 'repeat', label: 'Repeat' },
  { value: 'repeat-x', label: 'Repeat X' },
  { value: 'repeat-y', label: 'Repeat Y' },
];

/**
 * Background attachment options
 */
const backgroundAttachmentOptions: { value: BackgroundImageSettings['attachment']; label: string }[] = [
  { value: 'scroll', label: 'Scroll' },
  { value: 'fixed', label: 'Fixed' },
  { value: 'local', label: 'Local' },
];

/**
 * Background Settings Tab - Color, gradient, image, video, overlay
 */
export function BackgroundSettingsTab({ value, onChange, className }: BackgroundSettingsTabProps) {
  // Handle type change
  const handleTypeChange = useCallback(
    (type: BackgroundSettings['type']) => {
      const newValue: Partial<BackgroundSettings> = { type };
      
      // Initialize defaults based on type
      if (type === 'color' && !value.color) {
        newValue.color = '#ffffff';
      } else if (type === 'gradient' && !value.gradient) {
        newValue.gradient = defaultGradient;
      } else if (type === 'image' && !value.image) {
        newValue.image = {
          url: '',
          size: 'cover',
          position: 'center',
          repeat: 'no-repeat',
          attachment: 'scroll',
        };
      } else if (type === 'video' && !value.video) {
        newValue.video = {
          url: '',
          loop: true,
          muted: true,
        };
      }
      
      onChange({ ...value, ...newValue });
    },
    [value, onChange]
  );

  // Handle image settings change
  const handleImageChange = useCallback(
    (updates: Partial<BackgroundImageSettings>) => {
      onChange({
        ...value,
        image: { ...(value.image || {}), ...updates } as BackgroundImageSettings,
      });
    },
    [value, onChange]
  );

  // Handle overlay change
  const handleOverlayChange = useCallback(
    (updates: Partial<BackgroundOverlaySettings>) => {
      onChange({
        ...value,
        overlay: { ...(value.overlay || { enabled: false, type: 'color' }), ...updates } as BackgroundOverlaySettings,
      });
    },
    [value, onChange]
  );

  // Get preview style
  const getPreviewStyle = (): React.CSSProperties => {
    switch (value.type) {
      case 'color':
        return { backgroundColor: value.color };
      case 'gradient':
        return value.gradient ? { backgroundImage: gradientToCSS(value.gradient) } : {};
      case 'image':
        return value.image?.url
          ? {
              backgroundImage: `url(${value.image.url})`,
              backgroundSize: value.image.size === 'custom' 
                ? `${value.image.customWidth || 'auto'} ${value.image.customHeight || 'auto'}`
                : value.image.size,
              backgroundPosition: value.image.position === 'custom'
                ? `${value.image.customX || '50%'} ${value.image.customY || '50%'}`
                : value.image.position?.replace('-', ' '),
              backgroundRepeat: value.image.repeat,
            }
          : {};
      default:
        return {};
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Preview */}
      <div
        className="h-20 rounded-md border flex items-center justify-center text-xs text-muted-foreground"
        style={{
          ...getPreviewStyle(),
          backgroundBlendMode: 'normal',
        }}
      >
        {value.type === 'none' && 'No Background'}
        {value.type === 'video' && 'Video Background'}
      </div>

      {/* Type selector */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Background Type</Label>
        <Select
          value={value.type || 'none'}
          onValueChange={(val) => handleTypeChange(val as BackgroundSettings['type'])}
        >
          <SelectTrigger className="h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {backgroundTypeOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Color picker */}
      {value.type === 'color' && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Background Color</Label>
          <Popover>
            <PopoverTrigger asChild>
              <button className="w-full h-8 rounded border flex items-center gap-2 px-2">
                <div
                  className="w-5 h-5 rounded border"
                  style={{ backgroundColor: value.color || '#ffffff' }}
                />
                <span className="text-xs flex-1 text-left">{value.color || '#ffffff'}</span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-3" align="start">
              <HexColorPicker
                color={value.color || '#ffffff'}
                onChange={(color) => onChange({ ...value, color })}
              />
              <Input
                value={value.color || '#ffffff'}
                onChange={(e) => onChange({ ...value, color: e.target.value })}
                className="mt-2 h-8 text-xs"
              />
            </PopoverContent>
          </Popover>
        </div>
      )}

      {/* Gradient editor */}
      {value.type === 'gradient' && (
        <GradientInput
          value={value.gradient || defaultGradient}
          onChange={(gradient) => onChange({ ...value, gradient })}
        />
      )}

      {/* Image settings */}
      {value.type === 'image' && (
        <Accordion type="multiple" defaultValue={['image-url', 'image-settings']} className="space-y-1">
          <AccordionItem value="image-url" className="border rounded-md px-3">
            <AccordionTrigger className="py-2 text-sm font-medium hover:no-underline">
              Image Source
            </AccordionTrigger>
            <AccordionContent className="pb-3 space-y-3">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Image URL</Label>
                <div className="flex gap-2">
                  <Input
                    value={value.image?.url || ''}
                    onChange={(e) => handleImageChange({ url: e.target.value })}
                    placeholder="https://..."
                    className="h-8 text-xs flex-1"
                  />
                  <Button variant="outline" size="sm" className="h-8 px-2">
                    <Image className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="image-settings" className="border rounded-md px-3">
            <AccordionTrigger className="py-2 text-sm font-medium hover:no-underline">
              Image Settings
            </AccordionTrigger>
            <AccordionContent className="pb-3 space-y-3">
              {/* Size */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Size</Label>
                <Select
                  value={value.image?.size || 'cover'}
                  onValueChange={(val) => handleImageChange({ size: val as BackgroundImageSettings['size'] })}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {backgroundSizeOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {value.image?.size === 'custom' && (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Width</Label>
                      <Input
                        value={value.image.customWidth || ''}
                        onChange={(e) => handleImageChange({ customWidth: e.target.value })}
                        placeholder="auto"
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Height</Label>
                      <Input
                        value={value.image.customHeight || ''}
                        onChange={(e) => handleImageChange({ customHeight: e.target.value })}
                        placeholder="auto"
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Position */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Position</Label>
                <Select
                  value={value.image?.position || 'center'}
                  onValueChange={(val) => handleImageChange({ position: val as BackgroundImageSettings['position'] })}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {backgroundPositionOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {value.image?.position === 'custom' && (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">X</Label>
                      <Input
                        value={value.image.customX || ''}
                        onChange={(e) => handleImageChange({ customX: e.target.value })}
                        placeholder="50%"
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Y</Label>
                      <Input
                        value={value.image.customY || ''}
                        onChange={(e) => handleImageChange({ customY: e.target.value })}
                        placeholder="50%"
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Repeat */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Repeat</Label>
                <Select
                  value={value.image?.repeat || 'no-repeat'}
                  onValueChange={(val) => handleImageChange({ repeat: val as BackgroundImageSettings['repeat'] })}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {backgroundRepeatOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Attachment */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Attachment</Label>
                <Select
                  value={value.image?.attachment || 'scroll'}
                  onValueChange={(val) => handleImageChange({ attachment: val as BackgroundImageSettings['attachment'] })}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {backgroundAttachmentOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

      {/* Video settings */}
      {value.type === 'video' && (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Video URL</Label>
            <Input
              value={value.video?.url || ''}
              onChange={(e) => onChange({ ...value, video: { ...value.video, url: e.target.value } })}
              placeholder="https://..."
              className="h-8 text-xs"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Poster Image</Label>
            <Input
              value={value.video?.posterImage || ''}
              onChange={(e) => onChange({ ...value, video: { ...value.video, url: value.video?.url || '', posterImage: e.target.value } })}
              placeholder="https://..."
              className="h-8 text-xs"
            />
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={value.video?.loop ?? true}
                onChange={(e) => onChange({ ...value, video: { ...value.video, url: value.video?.url || '', loop: e.target.checked } })}
              />
              Loop
            </label>
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={value.video?.muted ?? true}
                onChange={(e) => onChange({ ...value, video: { ...value.video, url: value.video?.url || '', muted: e.target.checked } })}
              />
              Muted
            </label>
          </div>
        </div>
      )}

      {/* Overlay (for image and video) */}
      {(value.type === 'image' || value.type === 'video') && (
        <div className="space-y-3 pt-3 border-t">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Overlay</Label>
            <button
              role="switch"
              aria-checked={value.overlay?.enabled ?? false}
              onClick={() => handleOverlayChange({ enabled: !value.overlay?.enabled })}
              className={cn(
                'relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors',
                value.overlay?.enabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
              )}
            >
              <span
                className={cn(
                  'pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform',
                  value.overlay?.enabled ? 'translate-x-4' : 'translate-x-0'
                )}
              />
            </button>
          </div>

          {value.overlay?.enabled && (
            <>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Overlay Type</Label>
                <Select
                  value={value.overlay.type || 'color'}
                  onValueChange={(val) => handleOverlayChange({ type: val as 'color' | 'gradient' })}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="color">Color</SelectItem>
                    <SelectItem value="gradient">Gradient</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {value.overlay.type === 'color' && (
                <>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Color</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="w-full h-8 rounded border flex items-center gap-2 px-2">
                          <div
                            className="w-5 h-5 rounded border"
                            style={{ backgroundColor: value.overlay.color || '#000000' }}
                          />
                          <span className="text-xs flex-1 text-left">{value.overlay.color || '#000000'}</span>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-3" align="start">
                        <HexColorPicker
                          color={value.overlay.color || '#000000'}
                          onChange={(color) => handleOverlayChange({ color })}
                        />
                        <Input
                          value={value.overlay.color || '#000000'}
                          onChange={(e) => handleOverlayChange({ color: e.target.value })}
                          className="mt-2 h-8 text-xs"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-muted-foreground">Opacity</Label>
                      <span className="text-xs text-muted-foreground">{(value.overlay.opacity ?? 50)}%</span>
                    </div>
                    <Slider
                      value={[value.overlay.opacity ?? 50]}
                      min={0}
                      max={100}
                      step={1}
                      onValueChange={([val]) => handleOverlayChange({ opacity: val })}
                    />
                  </div>
                </>
              )}

              {value.overlay.type === 'gradient' && (
                <GradientInput
                  value={value.overlay.gradient || defaultGradient}
                  onChange={(gradient) => handleOverlayChange({ gradient })}
                />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
