// PagePress v0.0.12 - 2025-12-05
// Rich Text Toolbar - Fixed toolbar for TipTap text formatting

import { useState, useCallback } from 'react';
import type { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Link2,
  Link2Off,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  RemoveFormatting,
  Heading1,
  Heading2,
  Heading3,
  Palette,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface RichTextToolbarProps {
  editor: Editor;
  /** Minimal mode - fewer options for headings */
  minimalMode?: boolean;
}

/**
 * Fixed toolbar that appears above the text editor
 */
export function RichTextToolbar({ editor, minimalMode = false }: RichTextToolbarProps) {
  const [showLinkPopover, setShowLinkPopover] = useState(false);
  const [showColorPopover, setShowColorPopover] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  const toggleBold = useCallback(() => {
    editor.chain().focus().toggleBold().run();
  }, [editor]);

  const toggleItalic = useCallback(() => {
    editor.chain().focus().toggleItalic().run();
  }, [editor]);

  const toggleUnderline = useCallback(() => {
    editor.chain().focus().toggleUnderline().run();
  }, [editor]);

  const toggleStrike = useCallback(() => {
    editor.chain().focus().toggleStrike().run();
  }, [editor]);

  const setTextAlign = useCallback(
    (align: 'left' | 'center' | 'right' | 'justify') => {
      editor.chain().focus().setTextAlign(align).run();
    },
    [editor]
  );

  const toggleBulletList = useCallback(() => {
    editor.chain().focus().toggleBulletList().run();
  }, [editor]);

  const toggleOrderedList = useCallback(() => {
    editor.chain().focus().toggleOrderedList().run();
  }, [editor]);

  const clearFormatting = useCallback(() => {
    editor.chain().focus().clearNodes().unsetAllMarks().run();
  }, [editor]);

  const setHeading = useCallback(
    (level: 1 | 2 | 3) => {
      editor.chain().focus().toggleHeading({ level }).run();
    },
    [editor]
  );

  const handleLinkSubmit = useCallback(() => {
    if (linkUrl) {
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: linkUrl, target: '_blank' })
        .run();
    }
    setShowLinkPopover(false);
    setLinkUrl('');
  }, [editor, linkUrl]);

  const removeLink = useCallback(() => {
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
  }, [editor]);

  const setColor = useCallback(
    (color: string) => {
      editor.chain().focus().setColor(color).run();
      setShowColorPopover(false);
    },
    [editor]
  );

  const colors = [
    '#000000', '#374151', '#6B7280', '#9CA3AF',
    '#EF4444', '#F97316', '#F59E0B', '#EAB308',
    '#22C55E', '#14B8A6', '#06B6D4', '#3B82F6',
    '#6366F1', '#8B5CF6', '#A855F7', '#EC4899',
  ];

  return (
    <div
      className="flex items-center gap-0.5 p-1 mb-2 bg-background border rounded-lg shadow-md flex-wrap"
      onMouseDown={(e) => {
        // Prevent blur when clicking toolbar buttons
        e.preventDefault();
      }}
    >
      <TooltipProvider delayDuration={300}>
        {/* Basic formatting */}
        <ToolbarButton
          icon={Bold}
          tooltip="Bold (Ctrl+B)"
          isActive={editor.isActive('bold')}
          onClick={toggleBold}
        />
        <ToolbarButton
          icon={Italic}
          tooltip="Italic (Ctrl+I)"
          isActive={editor.isActive('italic')}
          onClick={toggleItalic}
        />
        <ToolbarButton
          icon={Underline}
          tooltip="Underline (Ctrl+U)"
          isActive={editor.isActive('underline')}
          onClick={toggleUnderline}
        />
        <ToolbarButton
          icon={Strikethrough}
          tooltip="Strikethrough"
          isActive={editor.isActive('strike')}
          onClick={toggleStrike}
        />

        <Separator />

        {/* Text Color */}
        <Popover open={showColorPopover} onOpenChange={setShowColorPopover}>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                >
                  <Palette className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              Text Color
            </TooltipContent>
          </Tooltip>
          <PopoverContent className="w-auto p-2" align="start">
            <div className="grid grid-cols-4 gap-1">
              {colors.map((color) => (
                <button
                  key={color}
                  className="w-6 h-6 rounded border border-gray-200 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  onClick={() => setColor(color)}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Link */}
        <Popover open={showLinkPopover} onOpenChange={setShowLinkPopover}>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'h-7 w-7 p-0',
                    editor.isActive('link') && 'bg-muted text-foreground'
                  )}
                >
                  <Link2 className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              Add Link
            </TooltipContent>
          </Tooltip>
          <PopoverContent className="w-72 p-3" align="start">
            <div className="space-y-2">
              <Label htmlFor="link-url" className="text-xs">URL</Label>
              <Input
                id="link-url"
                type="url"
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleLinkSubmit();
                  }
                }}
                className="h-8 text-sm"
              />
              <div className="flex gap-2">
                <Button size="sm" className="h-7 text-xs" onClick={handleLinkSubmit}>
                  Apply
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={() => {
                    setShowLinkPopover(false);
                    setLinkUrl('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {editor.isActive('link') && (
          <ToolbarButton
            icon={Link2Off}
            tooltip="Remove Link"
            onClick={removeLink}
          />
        )}

        {!minimalMode && (
          <>
            <Separator />

            {/* Text alignment */}
            <ToolbarButton
              icon={AlignLeft}
              tooltip="Align Left"
              isActive={editor.isActive({ textAlign: 'left' })}
              onClick={() => setTextAlign('left')}
            />
            <ToolbarButton
              icon={AlignCenter}
              tooltip="Align Center"
              isActive={editor.isActive({ textAlign: 'center' })}
              onClick={() => setTextAlign('center')}
            />
            <ToolbarButton
              icon={AlignRight}
              tooltip="Align Right"
              isActive={editor.isActive({ textAlign: 'right' })}
              onClick={() => setTextAlign('right')}
            />
            <ToolbarButton
              icon={AlignJustify}
              tooltip="Justify"
              isActive={editor.isActive({ textAlign: 'justify' })}
              onClick={() => setTextAlign('justify')}
            />

            <Separator />

            {/* Lists */}
            <ToolbarButton
              icon={List}
              tooltip="Bullet List"
              isActive={editor.isActive('bulletList')}
              onClick={toggleBulletList}
            />
            <ToolbarButton
              icon={ListOrdered}
              tooltip="Numbered List"
              isActive={editor.isActive('orderedList')}
              onClick={toggleOrderedList}
            />

            <Separator />

            {/* Headings */}
            <ToolbarButton
              icon={Heading1}
              tooltip="Heading 1"
              isActive={editor.isActive('heading', { level: 1 })}
              onClick={() => setHeading(1)}
            />
            <ToolbarButton
              icon={Heading2}
              tooltip="Heading 2"
              isActive={editor.isActive('heading', { level: 2 })}
              onClick={() => setHeading(2)}
            />
            <ToolbarButton
              icon={Heading3}
              tooltip="Heading 3"
              isActive={editor.isActive('heading', { level: 3 })}
              onClick={() => setHeading(3)}
            />
          </>
        )}

        <Separator />

        {/* Clear formatting */}
        <ToolbarButton
          icon={RemoveFormatting}
          tooltip="Clear Formatting"
          onClick={clearFormatting}
        />
      </TooltipProvider>
    </div>
  );
}

interface ToolbarButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  tooltip: string;
  isActive?: boolean;
  onClick: () => void;
  disabled?: boolean;
}

function ToolbarButton({
  icon: Icon,
  tooltip,
  isActive,
  onClick,
  disabled,
}: ToolbarButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'h-7 w-7 p-0',
            isActive && 'bg-muted text-foreground'
          )}
          onClick={onClick}
          disabled={disabled}
        >
          <Icon className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
}

function Separator() {
  return <div className="w-px h-5 bg-border mx-0.5" />;
}

export default RichTextToolbar;
