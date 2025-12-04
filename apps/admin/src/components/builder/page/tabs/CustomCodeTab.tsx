// PagePress v0.0.10 - 2025-12-04
// Custom code page settings tab

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle } from 'lucide-react';
import type { PageSettings } from '../../global/types';

interface CustomCodeTabProps {
  settings: PageSettings;
  onUpdate: (updates: Partial<PageSettings>) => void;
}

/**
 * Custom Code tab - CSS and JavaScript injection for this page
 */
export function CustomCodeTab({ settings, onUpdate }: CustomCodeTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
        <AlertTriangle className="h-4 w-4 text-yellow-600 shrink-0 mt-0.5" />
        <p className="text-xs text-yellow-700 dark:text-yellow-400">
          Custom code is injected directly into the page. Use with caution and
          ensure your code is properly tested.
        </p>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-4">Custom CSS</h3>
        <div className="space-y-2">
          <Label htmlFor="custom-css">Page Styles</Label>
          <Textarea
            id="custom-css"
            value={settings.customCss || ''}
            onChange={(e) => onUpdate({ customCss: e.target.value })}
            placeholder={`.my-class {\n  color: red;\n}`}
            rows={8}
            className="font-mono text-xs"
          />
          <p className="text-xs text-muted-foreground">
            CSS that will be injected into this page only. Do not include{' '}
            <code className="bg-muted px-1 rounded">&lt;style&gt;</code> tags.
          </p>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-medium mb-4">Custom JavaScript</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="js-head">Head Scripts</Label>
            <Textarea
              id="js-head"
              value={settings.jsHead || ''}
              onChange={(e) => onUpdate({ jsHead: e.target.value })}
              placeholder={`// Analytics, fonts, or other head scripts\nconsole.log('Head loaded');`}
              rows={5}
              className="font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground">
              JavaScript injected into the{' '}
              <code className="bg-muted px-1 rounded">&lt;head&gt;</code>. Runs
              before page content loads.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="js-body">Body Scripts</Label>
            <Textarea
              id="js-body"
              value={settings.jsBody || ''}
              onChange={(e) => onUpdate({ jsBody: e.target.value })}
              placeholder={`// Interactive scripts, event handlers\ndocument.addEventListener('DOMContentLoaded', () => {\n  console.log('Page ready');\n});`}
              rows={6}
              className="font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground">
              JavaScript injected at the end of{' '}
              <code className="bg-muted px-1 rounded">&lt;body&gt;</code>. Runs
              after page content loads.
            </p>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-medium mb-4">External Resources</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="external-css">External Stylesheets</Label>
            <Textarea
              id="external-css"
              value={settings.externalCss || ''}
              onChange={(e) => onUpdate({ externalCss: e.target.value })}
              placeholder={`https://fonts.googleapis.com/css2?family=Inter\nhttps://cdn.example.com/styles.css`}
              rows={3}
              className="font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground">
              One URL per line. External CSS files to load on this page.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="external-js">External Scripts</Label>
            <Textarea
              id="external-js"
              value={settings.externalJs || ''}
              onChange={(e) => onUpdate({ externalJs: e.target.value })}
              placeholder={`https://cdn.example.com/library.js\nhttps://analytics.example.com/script.js`}
              rows={3}
              className="font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground">
              One URL per line. External JS files to load on this page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
