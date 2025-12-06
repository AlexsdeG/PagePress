// PagePress v0.0.12 - 2025-12-05
// Rich Text Editor - TipTap wrapper for inline text editing with fixed toolbar

import { useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import { cn } from '@/lib/utils';
import { RichTextToolbar } from './RichTextToolbar';

export interface RichTextEditorProps {
  /** HTML content */
  content: string;
  /** Called when content changes */
  onChange: (html: string) => void;
  /** Whether the editor is editable */
  editable?: boolean;
  /** Placeholder text when empty */
  placeholder?: string;
  /** Additional CSS classes */
  className?: string;
  /** Whether to show the toolbar */
  showToolbar?: boolean;
  /** Minimal mode - fewer formatting options (for headings) */
  minimalMode?: boolean;
  /** Called when editor is focused */
  onFocus?: () => void;
  /** Called when editor is blurred */
  onBlur?: () => void;
  /** Called when Escape is pressed to exit editing */
  onEscape?: () => void;
}

/**
 * Rich Text Editor component using TipTap
 * Provides inline editing with a fixed toolbar above the content
 */
export function RichTextEditor({
  content,
  onChange,
  editable = true,
  placeholder = 'Start typing...',
  className,
  showToolbar = true,
  minimalMode = false,
  onFocus,
  onBlur,
  onEscape,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable heading in minimal mode (Heading component manages its own level)
        heading: minimalMode ? false : undefined,
        // Configure bullet and ordered lists
        bulletList: minimalMode ? false : undefined,
        orderedList: minimalMode ? false : undefined,
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
        emptyEditorClass: 'is-editor-empty',
      }),
      TextStyle,
      Color,
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    onFocus: () => {
      onFocus?.();
    },
    onBlur: ({ event }) => {
      // Check if the blur target is within the toolbar or editor wrapper
      const relatedTarget = event?.relatedTarget as HTMLElement | null;
      if (relatedTarget && editorRef.current?.contains(relatedTarget)) {
        // Don't trigger onBlur if focus moved to toolbar
        return;
      }
      onBlur?.();
    },
    editorProps: {
      attributes: {
        class: cn(
          'outline-none min-h-[1em]',
          'prose prose-sm max-w-none',
          // Style the placeholder
          '[&_.is-editor-empty:first-child::before]:text-muted-foreground',
          '[&_.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]',
          '[&_.is-editor-empty:first-child::before]:float-left',
          '[&_.is-editor-empty:first-child::before]:h-0',
          '[&_.is-editor-empty:first-child::before]:pointer-events-none',
          className
        ),
      },
      // Handle events to prevent Craft.js from interfering
      handleDOMEvents: {
        mousedown: () => {
          // Allow the event to proceed normally for cursor positioning
          // Return false means "do not prevent default behavior"
          return false;
        },
        click: () => {
          // Allow click events to proceed normally
          return false;
        },
        keydown: (view, event) => {
          // Handle Escape key to exit editing
          if (event.key === 'Escape') {
            onEscape?.();
            return true; // Prevent TipTap from handling Escape
          }
          // Let other keys proceed normally
          return false;
        },
      },
    },
    // Auto-focus when created
    autofocus: 'end',
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
  }, [editor, editable]);

  if (!editor) {
    return null;
  }

  return (
    <div
      ref={editorRef}
      className="relative"
      // We need to allow mousedown to propagate so the editor can receive focus
      // But we handle drag prevention in the editor extensions or parent
      onClick={(e) => e.stopPropagation()}
    >
      {/* Fixed toolbar above the editor */}
      {showToolbar && editable && (
        <RichTextToolbar editor={editor} minimalMode={minimalMode} />
      )}
      <EditorContent editor={editor} />
    </div>
  );
}

export default RichTextEditor;
