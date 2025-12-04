// PagePress v0.0.11 - 2025-12-04
// RichTextEditor - TipTap-based rich text editor for inline editing

import { useCallback, useEffect } from 'react';
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  RemoveFormatting,
  Unlink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export interface RichTextEditorProps {
  /** Initial HTML content */
  content: string;
  /** Called when content changes */
  onChange: (html: string) => void;
  /** Whether the editor is editable */
  editable?: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Additional CSS classes */
  className?: string;
  /** Whether to show the bubble menu */
  showBubbleMenu?: boolean;
  /** Restrict to basic formatting only (no lists, headings) */
  basicOnly?: boolean;
  /** Called when editor is focused */
  onFocus?: () => void;
  /** Called when editor is blurred */
  onBlur?: () => void;
}

/**
 * RichTextEditor - TipTap-based rich text editor
 * Used for inline editing of Text, Heading, and List components
 */
export function RichTextEditor({
  content,
  onChange,
  editable = true,
  placeholder = 'Start typing...',
  className,
  showBubbleMenu = true,
  basicOnly = false,
  onFocus,
  onBlur,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable heading in StarterKit if basicOnly
        heading: basicOnly ? false : undefined,
        bulletList: basicOnly ? false : undefined,
        orderedList: basicOnly ? false : undefined,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      Placeholder.configure({
        placeholder,
      }),
      TextStyle,
      Color,
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    onFocus: () => {
      onFocus?.();
    },
    onBlur: () => {
      onBlur?.();
    },
    editorProps: {
      attributes: {
        class: cn(
          'outline-none min-h-[1em] focus:outline-none',
          className
        ),
      },
      // Prevent Craft.js from capturing events when typing
      handleDOMEvents: {
        mousedown: (_, event) => {
          event.stopPropagation();
          return false;
        },
        click: (_, event) => {
          event.stopPropagation();
          return false;
        },
        keydown: (_, event) => {
          event.stopPropagation();
          return false;
        },
      },
    },
  });

  // Update content when prop changes externally
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  // Update editable state
  useEffect(() => {
    if (editor) {
      editor.setEditable(editable);
    }
  }, [editable, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="relative">
      {showBubbleMenu && editable && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{
            duration: 100,
            placement: 'top',
          }}
          className="flex items-center gap-0.5 p-1 bg-popover border rounded-lg shadow-lg"
        >
          <BubbleMenuContent editor={editor} basicOnly={basicOnly} />
        </BubbleMenu>
      )}
      <EditorContent editor={editor} />
    </div>
  );
}

/**
 * Bubble menu content with formatting buttons
 */
function BubbleMenuContent({
  editor,
  basicOnly,
}: {
  editor: ReturnType<typeof useEditor>;
  basicOnly: boolean;
}) {
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);

  const setLink = useCallback(() => {
    if (!editor) return;
    
    if (linkUrl === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: linkUrl })
        .run();
    }
    setShowLinkInput(false);
    setLinkUrl('');
  }, [editor, linkUrl]);

  const openLinkInput = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    setLinkUrl(previousUrl || '');
    setShowLinkInput(true);
  }, [editor]);

  if (!editor) return null;

  return (
    <>
      {/* Bold */}
      <Button
        variant="ghost"
        size="sm"
        className={cn('h-7 w-7 p-0', editor.isActive('bold') && 'bg-muted')}
        onClick={() => editor.chain().focus().toggleBold().run()}
        title="Bold (Ctrl+B)"
      >
        <Bold className="h-3.5 w-3.5" />
      </Button>

      {/* Italic */}
      <Button
        variant="ghost"
        size="sm"
        className={cn('h-7 w-7 p-0', editor.isActive('italic') && 'bg-muted')}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        title="Italic (Ctrl+I)"
      >
        <Italic className="h-3.5 w-3.5" />
      </Button>

      {/* Underline */}
      <Button
        variant="ghost"
        size="sm"
        className={cn('h-7 w-7 p-0', editor.isActive('underline') && 'bg-muted')}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        title="Underline (Ctrl+U)"
      >
        <UnderlineIcon className="h-3.5 w-3.5" />
      </Button>

      {/* Strikethrough */}
      <Button
        variant="ghost"
        size="sm"
        className={cn('h-7 w-7 p-0', editor.isActive('strike') && 'bg-muted')}
        onClick={() => editor.chain().focus().toggleStrike().run()}
        title="Strikethrough"
      >
        <Strikethrough className="h-3.5 w-3.5" />
      </Button>

      <div className="w-px h-4 bg-border mx-0.5" />

      {/* Link */}
      <Popover open={showLinkInput} onOpenChange={setShowLinkInput}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn('h-7 w-7 p-0', editor.isActive('link') && 'bg-muted')}
            onClick={openLinkInput}
            title="Add Link"
          >
            <LinkIcon className="h-3.5 w-3.5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-2" side="top">
          <div className="flex gap-2">
            <Input
              placeholder="https://example.com"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  setLink();
                }
              }}
              className="h-8 text-sm"
            />
            <Button size="sm" className="h-8" onClick={setLink}>
              Apply
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Unlink */}
      {editor.isActive('link') && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={() => editor.chain().focus().unsetLink().run()}
          title="Remove Link"
        >
          <Unlink className="h-3.5 w-3.5" />
        </Button>
      )}

      {!basicOnly && (
        <>
          <div className="w-px h-4 bg-border mx-0.5" />

          {/* Text Align */}
          <Button
            variant="ghost"
            size="sm"
            className={cn('h-7 w-7 p-0', editor.isActive({ textAlign: 'left' }) && 'bg-muted')}
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            title="Align Left"
          >
            <AlignLeft className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn('h-7 w-7 p-0', editor.isActive({ textAlign: 'center' }) && 'bg-muted')}
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            title="Align Center"
          >
            <AlignCenter className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn('h-7 w-7 p-0', editor.isActive({ textAlign: 'right' }) && 'bg-muted')}
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            title="Align Right"
          >
            <AlignRight className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn('h-7 w-7 p-0', editor.isActive({ textAlign: 'justify' }) && 'bg-muted')}
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            title="Justify"
          >
            <AlignJustify className="h-3.5 w-3.5" />
          </Button>

          <div className="w-px h-4 bg-border mx-0.5" />

          {/* Lists */}
          <Button
            variant="ghost"
            size="sm"
            className={cn('h-7 w-7 p-0', editor.isActive('bulletList') && 'bg-muted')}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            title="Bullet List"
          >
            <List className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn('h-7 w-7 p-0', editor.isActive('orderedList') && 'bg-muted')}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            title="Numbered List"
          >
            <ListOrdered className="h-3.5 w-3.5" />
          </Button>
        </>
      )}

      <div className="w-px h-4 bg-border mx-0.5" />

      {/* Clear Formatting */}
      <Button
        variant="ghost"
        size="sm"
        className="h-7 w-7 p-0"
        onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
        title="Clear Formatting"
      >
        <RemoveFormatting className="h-3.5 w-3.5" />
      </Button>
    </>
  );
}

export default RichTextEditor;
