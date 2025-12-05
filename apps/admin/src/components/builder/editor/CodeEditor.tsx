// PagePress v0.0.11 - 2025-12-04
// Code Editor - Monaco Editor wrapper for code editing in builder

import { lazy, Suspense, useCallback, useRef, useState } from 'react';
import type { editor } from 'monaco-editor';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

// Lazy load Monaco to reduce initial bundle size
const MonacoEditorComponent = lazy(() =>
  import('@monaco-editor/react').then((mod) => ({ default: mod.default }))
);

export interface CodeEditorProps {
  /** Code content */
  value: string;
  /** Called when content changes */
  onChange: (value: string) => void;
  /** Programming language (html, css, javascript, json, etc.) */
  language?: string;
  /** Editor height */
  height?: string | number;
  /** Editor theme */
  theme?: 'vs-dark' | 'light' | 'vs';
  /** Read-only mode */
  readOnly?: boolean;
  /** Additional CSS classes for wrapper */
  className?: string;
  /** Show line numbers */
  lineNumbers?: 'on' | 'off' | 'relative' | 'interval';
  /** Show minimap */
  minimap?: boolean;
  /** Word wrap */
  wordWrap?: 'on' | 'off' | 'wordWrapColumn' | 'bounded';
  /** Tab size */
  tabSize?: number;
  /** Called when editor mounts */
  onMount?: (editor: editor.IStandaloneCodeEditor) => void;
  /** Placeholder text when empty */
  placeholder?: string;
}

/**
 * Monaco-based code editor for HTML blocks and script editing
 * Lazy-loaded to improve initial page performance
 */
export function CodeEditor({
  value,
  onChange,
  language = 'html',
  height = 300,
  theme = 'vs-dark',
  readOnly = false,
  className,
  lineNumbers = 'on',
  minimap = false,
  wordWrap = 'on',
  tabSize = 2,
  onMount,
  placeholder,
}: CodeEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleEditorMount = useCallback(
    (editor: editor.IStandaloneCodeEditor) => {
      editorRef.current = editor;
      setIsLoading(false);
      onMount?.(editor);

      // Set up placeholder functionality
      if (placeholder && !value) {
        // Monaco doesn't have native placeholder support
        // We handle it via the empty state display
      }
    },
    [onMount, placeholder, value]
  );

  const handleChange = useCallback(
    (newValue: string | undefined) => {
      if (newValue !== undefined) {
        onChange(newValue);
      }
    },
    [onChange]
  );

  // Prevent event propagation to Craft.js during editing
  const handleContainerClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    e.stopPropagation();
  }, []);

  // Monaco editor options
  const options: editor.IStandaloneEditorConstructionOptions = {
    readOnly,
    lineNumbers,
    minimap: { enabled: minimap },
    wordWrap,
    tabSize,
    fontSize: 13,
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
    fontLigatures: true,
    automaticLayout: true,
    scrollBeyondLastLine: false,
    padding: { top: 8, bottom: 8 },
    renderLineHighlight: 'line',
    scrollbar: {
      verticalScrollbarSize: 10,
      horizontalScrollbarSize: 10,
    },
    // Improve UX
    cursorBlinking: 'smooth',
    cursorSmoothCaretAnimation: 'on',
    smoothScrolling: true,
    // Bracket pair colorization
    bracketPairColorization: { enabled: true },
    // Suggestions
    quickSuggestions: true,
    suggestOnTriggerCharacters: true,
    // Format on paste for HTML
    formatOnPaste: language === 'html' || language === 'json',
  };

  return (
    <div
      className={cn(
        'relative rounded-md overflow-hidden border',
        'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
        className
      )}
      onClick={handleContainerClick}
      onKeyDown={handleKeyDown}
    >
      {/* Loading state */}
      {isLoading && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-muted/50 z-10"
          style={{ height }}
        >
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Placeholder when empty */}
      {!value && placeholder && !isLoading && (
        <div
          className="absolute top-2 left-4 text-muted-foreground text-sm pointer-events-none z-10"
          style={{ fontFamily: 'monospace' }}
        >
          {placeholder}
        </div>
      )}

      <Suspense
        fallback={
          <div
            className="flex items-center justify-center bg-muted"
            style={{ height }}
          >
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        }
      >
        <MonacoEditorComponent
          height={height}
          language={language}
          value={value}
          theme={theme}
          onChange={handleChange}
          onMount={handleEditorMount}
          options={options}
          loading={
            <div
              className="flex items-center justify-center bg-muted"
              style={{ height }}
            >
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          }
        />
      </Suspense>
    </div>
  );
}

export default CodeEditor;
