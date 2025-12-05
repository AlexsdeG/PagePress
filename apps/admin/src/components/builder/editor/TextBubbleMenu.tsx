// PagePress v0.0.11 - 2025-12-04
// Text Bubble Menu - Floating toolbar for TipTap text formatting

import { useState, useCallback } from 'react';
import { BubbleMenu } from '@tiptap/react/menus';
import type { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Link2,
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
import { cn } from '@/lib/utils';
import { LinkDialog } from './LinkDialog';

interface TextBubbleMenuProps {
  editor: Editor;
  /** Minimal mode - fewer options for headings */
  minimalMode?: boolean;
}

/**
 * Floating toolbar that appears when text is selected
 */
export function TextBubbleMenu({ editor, minimalMode = false }: TextBubbleMenuProps) {
  const [showLinkDialog, setShowLinkDialog] = useState(false);

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

  const handleLinkSubmit = useCallback(
    (url: string, target: '_self' | '_blank') => {
      if (url) {
        editor
          .chain()
          .focus()
          .extendMarkRange('link')
          .setLink({ href: url, target })
          .run();
      } else {
        editor.chain().focus().extendMarkRange('link').unsetLink().run();
      }
      setShowLinkDialog(false);
    },
    [editor]
  );

  const currentLink = editor.getAttributes('link').href || '';

  return (
    <BubbleMenu
      editor={editor}
      options={{
        placement: 'top',
      }}
      className="flex items-center gap-0.5 p-1 bg-background border rounded-lg shadow-lg"
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

        {/* Link */}
        <Popover open={showLinkDialog} onOpenChange={setShowLinkDialog}>
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
          <PopoverContent className="w-80 p-0" align="start">
            <LinkDialog
              initialUrl={currentLink}
              initialTarget={editor.getAttributes('link').target || '_self'}
              onSubmit={handleLinkSubmit}
              onCancel={() => setShowLinkDialog(false)}
            />
          </PopoverContent>
        </Popover>

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
    </BubbleMenu>
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

export default TextBubbleMenu;
