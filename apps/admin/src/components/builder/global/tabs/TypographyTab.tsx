// PagePress v0.0.10 - 2025-12-04
// Global typography settings tab

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useGlobalSettingsStore } from '../globalSettingsStore';
import type { GlobalTypography } from '../types';

/**
 * Available font families
 */
const FONT_FAMILIES = [
  { value: 'system-ui', label: 'System Default' },
  { value: 'Inter', label: 'Inter' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Open Sans', label: 'Open Sans' },
  { value: 'Lato', label: 'Lato' },
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'Poppins', label: 'Poppins' },
  { value: 'Playfair Display', label: 'Playfair Display' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Arial', label: 'Arial' },
];

const HEADING_LEVELS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const;

/**
 * Typography tab for global settings
 * Manages fonts, sizes, and line heights
 */
export function TypographyTab() {
  const { themeSettings, updateThemeSettings } = useGlobalSettingsStore();
  const typography = themeSettings?.typography;

  /**
   * Update a nested typography value
   */
  const updateTypography = (path: string, value: unknown) => {
    if (!typography) return;

    // Deep update helper
    const updated = { ...typography };
    const keys = path.split('.');
    let current: Record<string, unknown> = updated as unknown as Record<string, unknown>;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      current[key] = { ...(current[key] as Record<string, unknown>) };
      current = current[key] as Record<string, unknown>;
    }

    current[keys[keys.length - 1]] = value;
    updateThemeSettings({ typography: updated as GlobalTypography });
  };

  if (!typography) {
    return <div className="text-sm text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <p className="text-xs text-muted-foreground">
        Set global typography defaults for your site.
      </p>

      {/* Font Families */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-xs">Heading Font</Label>
          <Select
            value={typography.fontFamily?.heading || 'system-ui'}
            onValueChange={(value) =>
              updateTypography('fontFamily.heading', value)
            }
          >
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FONT_FAMILIES.map((font) => (
                <SelectItem key={font.value} value={font.value}>
                  <span style={{ fontFamily: font.value }}>{font.label}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Body Font</Label>
          <Select
            value={typography.fontFamily?.body || 'system-ui'}
            onValueChange={(value) =>
              updateTypography('fontFamily.body', value)
            }
          >
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FONT_FAMILIES.map((font) => (
                <SelectItem key={font.value} value={font.value}>
                  <span style={{ fontFamily: font.value }}>{font.label}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Base Font Size */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label className="text-xs">Base Font Size</Label>
          <span className="text-xs text-muted-foreground">
            {typography.baseFontSize || 16}px
          </span>
        </div>
        <Slider
          value={[typography.baseFontSize || 16]}
          min={12}
          max={24}
          step={1}
          onValueChange={([value]) => updateTypography('baseFontSize', value)}
        />
      </div>

      {/* Heading Sizes */}
      <Accordion type="single" collapsible>
        <AccordionItem value="headings">
          <AccordionTrigger className="text-sm py-2">
            Heading Sizes
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-2">
              {HEADING_LEVELS.map((level) => (
                <div key={level} className="flex items-center gap-3">
                  <Label className="w-8 uppercase text-xs font-mono">
                    {level}
                  </Label>
                  <Input
                    className="flex-1 h-8 text-sm"
                    value={
                      typography.headingSizes?.[level]?.desktop || ''
                    }
                    onChange={(e) =>
                      updateTypography(
                        `headingSizes.${level}.desktop`,
                        e.target.value
                      )
                    }
                    placeholder="e.g., 2.5rem"
                  />
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Line Heights */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-xs">Body Line Height</Label>
          <Input
            type="number"
            step="0.1"
            className="h-9"
            value={typography.bodyLineHeight || 1.6}
            onChange={(e) =>
              updateTypography('bodyLineHeight', parseFloat(e.target.value))
            }
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Heading Line Height</Label>
          <Input
            type="number"
            step="0.1"
            className="h-9"
            value={typography.headingLineHeight || 1.2}
            onChange={(e) =>
              updateTypography('headingLineHeight', parseFloat(e.target.value))
            }
          />
        </div>
      </div>
    </div>
  );
}
