// PagePress v0.0.10 - 2025-12-04
// Social sharing page settings tab

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';
import type { PageSettings } from '../../global/types';

interface SocialTabProps {
  settings: PageSettings;
  onUpdate: (updates: Partial<PageSettings>) => void;
}

/**
 * Social tab - Open Graph and Twitter card settings
 */
export function SocialTab({ settings, onUpdate }: SocialTabProps) {
  const handleImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    field: 'ogImage' | 'twitterImage'
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real implementation, upload to server and get URL
      // For now, create a preview URL
      const url = URL.createObjectURL(file);
      onUpdate({ [field]: url });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-2">Open Graph</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Control how this page appears when shared on Facebook, LinkedIn, and other platforms.
        </p>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="og-title">OG Title</Label>
            <Input
              id="og-title"
              value={settings.ogTitle || ''}
              onChange={(e) => onUpdate({ ogTitle: e.target.value })}
              placeholder="Title for social shares (defaults to meta title)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="og-description">OG Description</Label>
            <Textarea
              id="og-description"
              value={settings.ogDescription || ''}
              onChange={(e) => onUpdate({ ogDescription: e.target.value })}
              placeholder="Description for social shares"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>OG Image</Label>
            <div className="flex items-start gap-3">
              {settings.ogImage ? (
                <div className="relative w-32 h-20 border rounded overflow-hidden">
                  <img
                    src={settings.ogImage}
                    alt="OG Preview"
                    className="w-full h-full object-cover"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1 h-6 w-6 p-0"
                    onClick={() => onUpdate({ ogImage: undefined })}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-32 h-20 border-2 border-dashed rounded cursor-pointer hover:bg-muted/50">
                  <Upload className="h-5 w-5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground mt-1">Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, 'ogImage')}
                  />
                </label>
              )}
              <div className="flex-1">
                <Input
                  value={settings.ogImage || ''}
                  onChange={(e) => onUpdate({ ogImage: e.target.value })}
                  placeholder="Or enter image URL"
                  className="text-xs"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Recommended: 1200×630 pixels
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-medium mb-2">Twitter Card</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Control how this page appears when shared on Twitter/X.
        </p>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="twitter-title">Twitter Title</Label>
            <Input
              id="twitter-title"
              value={settings.twitterTitle || ''}
              onChange={(e) => onUpdate({ twitterTitle: e.target.value })}
              placeholder="Title for Twitter (defaults to OG title)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="twitter-description">Twitter Description</Label>
            <Textarea
              id="twitter-description"
              value={settings.twitterDescription || ''}
              onChange={(e) => onUpdate({ twitterDescription: e.target.value })}
              placeholder="Description for Twitter"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Twitter Image</Label>
            <div className="flex items-start gap-3">
              {settings.twitterImage ? (
                <div className="relative w-32 h-20 border rounded overflow-hidden">
                  <img
                    src={settings.twitterImage}
                    alt="Twitter Preview"
                    className="w-full h-full object-cover"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1 h-6 w-6 p-0"
                    onClick={() => onUpdate({ twitterImage: undefined })}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-32 h-20 border-2 border-dashed rounded cursor-pointer hover:bg-muted/50">
                  <Upload className="h-5 w-5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground mt-1">Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, 'twitterImage')}
                  />
                </label>
              )}
              <div className="flex-1">
                <Input
                  value={settings.twitterImage || ''}
                  onChange={(e) => onUpdate({ twitterImage: e.target.value })}
                  placeholder="Or enter image URL"
                  className="text-xs"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Recommended: 1200×675 pixels
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-medium mb-4">Preview</h3>
        <div className="border rounded-lg overflow-hidden bg-muted/30">
          <div className="aspect-[1.91/1] bg-muted flex items-center justify-center">
            {settings.ogImage ? (
              <img
                src={settings.ogImage}
                alt="Social preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-muted-foreground text-sm">No image</span>
            )}
          </div>
          <div className="p-3">
            <div className="font-medium text-sm truncate">
              {settings.ogTitle || settings.metaTitle || 'Page Title'}
            </div>
            <div className="text-muted-foreground text-xs mt-1 line-clamp-2">
              {settings.ogDescription ||
                settings.metaDescription ||
                'Add a description to preview how this page will appear when shared.'}
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Approximate social share preview
        </p>
      </div>
    </div>
  );
}
