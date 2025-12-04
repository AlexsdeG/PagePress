// PagePress v0.0.10 - 2025-12-04
// Global element defaults tab

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { HexColorPicker } from 'react-colorful';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useGlobalSettingsStore } from '../globalSettingsStore';
import type { GlobalElementDefaults } from '../types';

/**
 * Color input helper component
 */
function ColorInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <div className="flex gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <button
              className="w-9 h-9 rounded-md border shadow-sm"
              style={{ backgroundColor: value }}
            />
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3" align="start">
            <HexColorPicker color={value} onChange={onChange} />
            <Input
              className="mt-2 h-8 text-xs font-mono"
              value={value}
              onChange={(e) => onChange(e.target.value)}
            />
          </PopoverContent>
        </Popover>
        <Input
          className="flex-1 h-9 text-sm font-mono"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}

/**
 * Elements tab for global settings
 * Set default styles for buttons, links, containers, and forms
 */
export function ElementsTab() {
  const { themeSettings, updateThemeSettings } = useGlobalSettingsStore();
  const elements = themeSettings?.elements;

  /**
   * Update an element property
   */
  const updateElement = (
    element: keyof GlobalElementDefaults,
    property: string,
    value: string
  ) => {
    if (!elements) return;

    const updated = {
      ...elements,
      [element]: {
        ...elements[element],
        [property]: value,
      },
    };
    updateThemeSettings({ elements: updated });
  };

  if (!elements) {
    return <div className="text-sm text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Set default styles for common elements. These will be applied globally.
      </p>

      <Accordion type="multiple" defaultValue={['button', 'link']}>
        {/* Button Defaults */}
        <AccordionItem value="button">
          <AccordionTrigger className="text-sm py-2">Buttons</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Padding</Label>
                <Input
                  className="h-9"
                  value={elements.button?.padding || '12px 24px'}
                  onChange={(e) =>
                    updateElement('button', 'padding', e.target.value)
                  }
                  placeholder="12px 24px"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Border Radius</Label>
                <Input
                  className="h-9"
                  value={elements.button?.borderRadius || '6px'}
                  onChange={(e) =>
                    updateElement('button', 'borderRadius', e.target.value)
                  }
                  placeholder="6px"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Font Size</Label>
                <Input
                  className="h-9"
                  value={elements.button?.fontSize || '14px'}
                  onChange={(e) =>
                    updateElement('button', 'fontSize', e.target.value)
                  }
                  placeholder="14px"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Link Defaults */}
        <AccordionItem value="link">
          <AccordionTrigger className="text-sm py-2">Links</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-2">
              <ColorInput
                label="Link Color"
                value={elements.link?.color || '#3b82f6'}
                onChange={(value) => updateElement('link', 'color', value)}
              />
              <ColorInput
                label="Hover Color"
                value={elements.link?.hoverColor || '#2563eb'}
                onChange={(value) => updateElement('link', 'hoverColor', value)}
              />
              <div className="space-y-1.5">
                <Label className="text-xs">Text Decoration</Label>
                <Input
                  className="h-9"
                  value={elements.link?.textDecoration || 'none'}
                  onChange={(e) =>
                    updateElement('link', 'textDecoration', e.target.value)
                  }
                  placeholder="none, underline"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Container Defaults */}
        <AccordionItem value="container">
          <AccordionTrigger className="text-sm py-2">
            Containers
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Max Width</Label>
                <Input
                  className="h-9"
                  value={elements.container?.maxWidth || '1280px'}
                  onChange={(e) =>
                    updateElement('container', 'maxWidth', e.target.value)
                  }
                  placeholder="1280px"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Default Padding</Label>
                <Input
                  className="h-9"
                  value={elements.container?.padding || '16px'}
                  onChange={(e) =>
                    updateElement('container', 'padding', e.target.value)
                  }
                  placeholder="16px"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Form Defaults */}
        <AccordionItem value="form">
          <AccordionTrigger className="text-sm py-2">
            Form Inputs
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Input Padding</Label>
                <Input
                  className="h-9"
                  value={elements.form?.inputPadding || '8px 12px'}
                  onChange={(e) =>
                    updateElement('form', 'inputPadding', e.target.value)
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Input Border Radius</Label>
                <Input
                  className="h-9"
                  value={elements.form?.inputBorderRadius || '4px'}
                  onChange={(e) =>
                    updateElement('form', 'inputBorderRadius', e.target.value)
                  }
                />
              </div>
              <ColorInput
                label="Border Color"
                value={elements.form?.inputBorderColor || '#e5e7eb'}
                onChange={(value) =>
                  updateElement('form', 'inputBorderColor', value)
                }
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
