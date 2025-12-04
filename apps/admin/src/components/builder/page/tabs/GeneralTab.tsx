// PagePress v0.0.10 - 2025-12-04
// General page settings tab

import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import type { PageSettings } from '../../global/types';

interface GeneralTabProps {
  settings: PageSettings;
  onUpdate: (updates: Partial<PageSettings>) => void;
}

/**
 * General tab - header/footer toggles and page layout options
 */
export function GeneralTab({ settings, onUpdate }: GeneralTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-4">Page Layout</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="disable-header">Disable Header</Label>
              <p className="text-xs text-muted-foreground">
                Hide the site header on this page
              </p>
            </div>
            <Switch
              id="disable-header"
              checked={settings.disableHeader}
              onCheckedChange={(checked) =>
                onUpdate({ disableHeader: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="disable-footer">Disable Footer</Label>
              <p className="text-xs text-muted-foreground">
                Hide the site footer on this page
              </p>
            </div>
            <Switch
              id="disable-footer"
              checked={settings.disableFooter}
              onCheckedChange={(checked) =>
                onUpdate({ disableFooter: checked })
              }
            />
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-medium mb-4">Content Width</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="full-width">Full Width Layout</Label>
              <p className="text-xs text-muted-foreground">
                Remove max-width container constraints
              </p>
            </div>
            <Switch
              id="full-width"
              checked={settings.fullWidth ?? false}
              onCheckedChange={(checked) =>
                onUpdate({ fullWidth: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="transparent-header">Transparent Header</Label>
              <p className="text-xs text-muted-foreground">
                Make header overlay the content
              </p>
            </div>
            <Switch
              id="transparent-header"
              checked={settings.transparentHeader ?? false}
              onCheckedChange={(checked) =>
                onUpdate({ transparentHeader: checked })
              }
            />
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-medium mb-4">Page Background</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Override the global background for this page. Leave empty to use global
          settings.
        </p>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={settings.backgroundColor || '#ffffff'}
            onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
            className="h-8 w-12 rounded border cursor-pointer"
          />
          <input
            type="text"
            value={settings.backgroundColor || ''}
            onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
            placeholder="e.g., #ffffff"
            className="flex-1 h-8 px-2 text-sm border rounded"
          />
          {settings.backgroundColor && (
            <button
              onClick={() => onUpdate({ backgroundColor: undefined })}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
