// PagePress v0.0.6 - 2025-12-03
// HTML tag selector dropdown for semantic elements

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type HtmlTag = 'div' | 'section' | 'article' | 'aside' | 'nav' | 'header' | 'footer' | 'main';

interface TagSelectorProps {
  value: HtmlTag;
  onChange: (value: HtmlTag) => void;
  label?: string;
}

/**
 * Tag descriptions for tooltips
 */
const TAG_DESCRIPTIONS: Record<HtmlTag, string> = {
  div: 'Generic container',
  section: 'Thematic content grouping',
  article: 'Self-contained content',
  aside: 'Tangentially related content',
  nav: 'Navigation links',
  header: 'Introductory content',
  footer: 'Footer content',
  main: 'Main content area',
};

/**
 * HTML tag selector with semantic descriptions
 */
export function TagSelector({ value, onChange, label = 'HTML Tag' }: TagSelectorProps) {
  return (
    <div className="space-y-2">
      {label && <Label className="text-xs">{label}</Label>}
      <Select value={value} onValueChange={(v) => onChange(v as HtmlTag)}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(TAG_DESCRIPTIONS) as HtmlTag[]).map((tag) => (
            <SelectItem key={tag} value={tag}>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-muted px-1 py-0.5 rounded">&lt;{tag}&gt;</code>
                <span className="text-xs text-muted-foreground">{TAG_DESCRIPTIONS[tag]}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
