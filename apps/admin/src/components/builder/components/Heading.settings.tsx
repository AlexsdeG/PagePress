// PagePress v0.0.12 - 2025-12-05
// Heading component settings panel with ElementSettingsSidebar

import { useNode } from '@craftjs/core';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RichTextEditor } from '../editor';
import { ElementSettingsSidebar } from '../inspector/sidebar';
import { SettingsFieldWrapper } from '../inspector/SettingsFieldWrapper';
import { useModifiedProps } from '../hooks';
import { defaultHeadingFontSizes } from './Heading';
import type { HeadingProps } from '../types';

// Extended props with our new fontSizeModified flag
interface ExtendedHeadingProps extends HeadingProps {
  fontSizeModified?: boolean;
  _modifiedProps?: string[];
}

/**
 * Content-specific settings for Heading
 */
function HeadingContentSettings({
  props,
  setProp,
}: {
  props: ExtendedHeadingProps;
  setProp: (cb: (props: ExtendedHeadingProps) => void) => void;
}) {
  const { isModified, resetProp, setModifiedProp } = useModifiedProps();

  // Get the current displayed font size (either user-set or default for level)
  const currentFontSize = props.fontSizeModified && props.fontSize !== undefined
    ? props.fontSize
    : defaultHeadingFontSizes[props.level || 2];

  // Default values for reset
  const defaults = {
    text: 'Heading',
    level: 2,
    linkUrl: '',
    linkTarget: '_self',
    className: '',
  };

  return (
    <div className="space-y-4">
      {/* Text */}
      <SettingsFieldWrapper
        fieldName="text"
        isModified={isModified('text')}
        defaultValue={defaults.text}
        currentValue={props.text}
        onReset={resetProp}
        label="Text"
      >
        <div className="space-y-2">
          <Label className="text-xs">Text</Label>
          <RichTextEditor
            content={props.htmlContent || props.text || ''}
            onChange={(html) => {
              const tempDiv = document.createElement('div');
              tempDiv.innerHTML = html;
              const plainText = tempDiv.textContent || '';

              setModifiedProp('text', plainText);
              setProp((p) => {
                p.htmlContent = html;
              });
            }}
            placeholder="Enter heading text..."
            minimalMode={true}
            className="min-h-[60px] border rounded-md p-2 text-sm"
          />
        </div>
      </SettingsFieldWrapper>

      {/* Heading Level */}
      <SettingsFieldWrapper
        fieldName="level"
        isModified={isModified('level')}
        defaultValue={defaults.level}
        currentValue={props.level}
        onReset={(field, val) => {
          resetProp(field, val);
          // Also reset font size when level is reset
          setProp((p) => {
            p.fontSizeModified = false;
            p.fontSize = defaultHeadingFontSizes[val as number];
          });
        }}
        label="Heading Level"
      >
        <div className="space-y-2">
          <Label className="text-xs">Heading Level</Label>
          <Select
            value={String(props.level || 2)}
            onValueChange={(value) => {
              const newLevel = Number(value) as HeadingProps['level'];
              setModifiedProp('level', newLevel);
              setProp((p) => {
                // If fontSize hasn't been manually modified, update it to match the new level
                if (!p.fontSizeModified) {
                  p.fontSize = defaultHeadingFontSizes[newLevel];
                }
              });
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">H1 - {defaultHeadingFontSizes[1]}px</SelectItem>
              <SelectItem value="2">H2 - {defaultHeadingFontSizes[2]}px</SelectItem>
              <SelectItem value="3">H3 - {defaultHeadingFontSizes[3]}px</SelectItem>
              <SelectItem value="4">H4 - {defaultHeadingFontSizes[4]}px</SelectItem>
              <SelectItem value="5">H5 - {defaultHeadingFontSizes[5]}px</SelectItem>
              <SelectItem value="6">H6 - {defaultHeadingFontSizes[6]}px</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-[10px] text-muted-foreground">
            Current size: {currentFontSize}px
            {props.fontSizeModified && ' (customized)'}
          </p>
        </div>
      </SettingsFieldWrapper>

      {/* Link URL */}
      <SettingsFieldWrapper
        fieldName="linkUrl"
        isModified={isModified('linkUrl')}
        defaultValue={defaults.linkUrl}
        currentValue={props.linkUrl}
        onReset={resetProp}
        label="Link URL"
      >
        <div className="space-y-2">
          <Label className="text-xs">Link URL (optional)</Label>
          <Input
            value={props.linkUrl || ''}
            onChange={(e) => setModifiedProp('linkUrl', e.target.value)}
            placeholder="https://example.com"
          />
        </div>
      </SettingsFieldWrapper>

      {/* Link Target */}
      {props.linkUrl && (
        <SettingsFieldWrapper
          fieldName="linkTarget"
          isModified={isModified('linkTarget')}
          defaultValue={defaults.linkTarget}
          currentValue={props.linkTarget}
          onReset={resetProp}
          label="Open In"
        >
          <div className="space-y-2">
            <Label className="text-xs">Open In</Label>
            <Select
              value={props.linkTarget || '_self'}
              onValueChange={(value) => setModifiedProp('linkTarget', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_self">Same Window</SelectItem>
                <SelectItem value="_blank">New Window</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </SettingsFieldWrapper>
      )}

      {/* Custom Classes */}
      <SettingsFieldWrapper
        fieldName="className"
        isModified={isModified('className')}
        defaultValue={defaults.className}
        currentValue={props.className}
        onReset={resetProp}
        label="Custom Classes"
      >
        <div className="space-y-2">
          <Label className="text-xs">Custom Classes</Label>
          <Input
            value={props.className || ''}
            onChange={(e) => setModifiedProp('className', e.target.value)}
            placeholder="Enter Tailwind classes..."
          />
        </div>
      </SettingsFieldWrapper>
    </div>
  );
}

/**
 * Settings panel for Heading component
 * All style tabs are available by default
 */
export function HeadingSettings() {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as ExtendedHeadingProps,
  }));

  return (
    <ElementSettingsSidebar
      contentSettings={
        <HeadingContentSettings
          props={props}
          setProp={setProp}
        />
      }
    />
  );
}
