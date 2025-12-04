// PagePress v0.0.10 - 2025-12-04
// SEO page settings tab

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import type { PageSettings } from '../../global/types';

interface SeoTabProps {
  settings: PageSettings;
  onUpdate: (updates: Partial<PageSettings>) => void;
}

const MAX_TITLE_LENGTH = 60;
const MAX_DESCRIPTION_LENGTH = 160;

/**
 * SEO tab - meta title, description, and indexing options
 */
export function SeoTab({ settings, onUpdate }: SeoTabProps) {
  const titleLength = settings.metaTitle?.length || 0;
  const descriptionLength = settings.metaDescription?.length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-4">Search Engine Optimization</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="meta-title">Meta Title</Label>
              <span
                className={`text-xs ${
                  titleLength > MAX_TITLE_LENGTH
                    ? 'text-destructive'
                    : 'text-muted-foreground'
                }`}
              >
                {titleLength}/{MAX_TITLE_LENGTH}
              </span>
            </div>
            <Input
              id="meta-title"
              value={settings.metaTitle || ''}
              onChange={(e) => onUpdate({ metaTitle: e.target.value })}
              placeholder="Page title for search results"
            />
            <p className="text-xs text-muted-foreground">
              Appears in browser tabs and search results. Recommended: 50-60 characters.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="meta-description">Meta Description</Label>
              <span
                className={`text-xs ${
                  descriptionLength > MAX_DESCRIPTION_LENGTH
                    ? 'text-destructive'
                    : 'text-muted-foreground'
                }`}
              >
                {descriptionLength}/{MAX_DESCRIPTION_LENGTH}
              </span>
            </div>
            <Textarea
              id="meta-description"
              value={settings.metaDescription || ''}
              onChange={(e) => onUpdate({ metaDescription: e.target.value })}
              placeholder="Brief description for search results"
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Summary shown in search results. Recommended: 150-160 characters.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="canonical-url">Canonical URL</Label>
            <Input
              id="canonical-url"
              type="url"
              value={settings.canonicalUrl || ''}
              onChange={(e) => onUpdate({ canonicalUrl: e.target.value })}
              placeholder="https://example.com/page"
            />
            <p className="text-xs text-muted-foreground">
              The preferred URL for this page. Use to avoid duplicate content issues.
            </p>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-medium mb-4">Search Engine Visibility</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="no-index">No Index</Label>
              <p className="text-xs text-muted-foreground">
                Prevent search engines from indexing this page
              </p>
            </div>
            <Switch
              id="no-index"
              checked={settings.noIndex}
              onCheckedChange={(checked) => onUpdate({ noIndex: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="no-follow">No Follow</Label>
              <p className="text-xs text-muted-foreground">
                Prevent search engines from following links
              </p>
            </div>
            <Switch
              id="no-follow"
              checked={settings.noFollow}
              onCheckedChange={(checked) => onUpdate({ noFollow: checked })}
            />
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-medium mb-4">Preview</h3>
        <div className="border rounded-lg p-3 bg-muted/30">
          <div className="text-blue-600 text-sm font-medium truncate">
            {settings.metaTitle || 'Page Title'}
          </div>
          <div className="text-green-700 text-xs truncate mt-1">
            {settings.canonicalUrl || 'https://example.com/page'}
          </div>
          <div className="text-muted-foreground text-xs mt-1 line-clamp-2">
            {settings.metaDescription ||
              'Add a meta description to preview how this page will appear in search results.'}
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Approximate Google search result preview
        </p>
      </div>
    </div>
  );
}
