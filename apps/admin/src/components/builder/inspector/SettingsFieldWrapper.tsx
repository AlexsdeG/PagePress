// PagePress v0.0.12 - 2025-12-05
// Settings field wrapper with context menu for reset-to-default functionality

import React, { useCallback, useState } from 'react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { RotateCcw, Copy, ClipboardPaste } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import { StyleIndicator } from './inputs/StyleIndicator';

interface SettingsFieldWrapperProps {
  /** The field name (used for tracking modifications) */
  fieldName: string;
  /** Whether this field has been modified from its default */
  isModified?: boolean;
  /** Whether inherited from class */
  isClassInherited?: boolean;
  /** Whether inherited from global settings */
  isGlobalInherited?: boolean;
  /** Whether it is a responsive override */
  isResponsiveOverride?: boolean;
  /** The default value to reset to */
  defaultValue: unknown;
  /** Current value (for copy functionality) */
  currentValue: unknown;
  /** Callback when reset is triggered */
  onReset: (fieldName: string, defaultValue: unknown) => void;
  /** Callback when paste is triggered (optional) */
  onPaste?: (value: string) => void;
  /** Child elements (the actual input/select) */
  children: React.ReactNode;
  /** Optional label */
  label?: string;
  /** Additional wrapper class */
  className?: string;
  /** Whether to show the modified indicator dot */
  showModifiedIndicator?: boolean;
  /** Orientation of the style indicators */
  orientation?: 'horizontal' | 'vertical';
}

/**
 * Wrapper component for settings fields that provides:
 * - Right-click context menu with Reset to Default
 * - Visual indicator for modified fields
 * - Copy/Paste functionality for values
 */
export function SettingsFieldWrapper({
  fieldName,
  isModified = false,
  isClassInherited = false,
  isGlobalInherited = false,
  isResponsiveOverride = false,
  defaultValue,
  currentValue,
  onReset,
  onPaste,
  children,
  label,
  className,
  showModifiedIndicator = true,
  orientation = 'horizontal',
}: SettingsFieldWrapperProps) {
  const [isPasting, setIsPasting] = useState(false);

  /**
   * Handle reset to default
   */
  const handleReset = useCallback(() => {
    onReset(fieldName, defaultValue);
    toast.success(`Reset ${label || fieldName} to default`);
  }, [fieldName, defaultValue, onReset, label]);

  /**
   * Handle copy value
   */
  const handleCopy = useCallback(async () => {
    try {
      const value = typeof currentValue === 'object'
        ? JSON.stringify(currentValue)
        : String(currentValue);
      await navigator.clipboard.writeText(value);
      toast.success('Value copied to clipboard');
    } catch {
      toast.error('Failed to copy value');
    }
  }, [currentValue]);

  /**
   * Handle paste value
   */
  const handlePaste = useCallback(async () => {
    if (!onPaste) return;

    try {
      setIsPasting(true);
      const text = await navigator.clipboard.readText();
      onPaste(text);
      toast.success('Value pasted');
    } catch {
      toast.error('Failed to paste value');
    } finally {
      setIsPasting(false);
    }
  }, [onPaste]);

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          className={cn(
            'relative group pl-6',
            className
          )}
        >
          {/* Modified indicator */}
          {showModifiedIndicator && (
            <StyleIndicator
              isModified={isModified}
              isClassInherited={isClassInherited}
              isGlobalInherited={isGlobalInherited}
              isResponsiveOverride={isResponsiveOverride}
              orientation={orientation}
            />
          )}
          {children}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem
          onClick={handleReset}
          disabled={!isModified}
          className={!isModified ? 'text-muted-foreground' : ''}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset to Default
        </ContextMenuItem>
        <ContextMenuItem onClick={handleCopy}>
          <Copy className="mr-2 h-4 w-4" />
          Copy Value
        </ContextMenuItem>
        {onPaste && (
          <ContextMenuItem onClick={handlePaste} disabled={isPasting}>
            <ClipboardPaste className="mr-2 h-4 w-4" />
            Paste Value
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}

/**
 * Hook-integrated wrapper that works with useModifiedProps
 */
interface IntegratedSettingsFieldProps {
  /** The field name */
  fieldName: string;
  /** Default value for this field */
  defaultValue: unknown;
  /** Current value */
  currentValue: unknown;
  /** Whether the field is modified (from useModifiedProps.isModified) */
  isModified: boolean;
  /** Reset function (from useModifiedProps.resetProp) */
  resetProp: (propName: string, defaultValue: unknown) => void;
  /** Child elements */
  children: React.ReactNode;
  /** Optional label */
  label?: string;
  /** Additional class */
  className?: string;
}

/**
 * Integrated wrapper that works directly with useModifiedProps hook
 */
export function IntegratedSettingsField({
  fieldName,
  defaultValue,
  currentValue,
  isModified,
  resetProp,
  children,
  label,
  className,
}: IntegratedSettingsFieldProps) {
  return (
    <SettingsFieldWrapper
      fieldName={fieldName}
      isModified={isModified}
      defaultValue={defaultValue}
      currentValue={currentValue}
      onReset={resetProp}
      label={label}
      className={className}
    >
      {children}
    </SettingsFieldWrapper>
  );
}

export default SettingsFieldWrapper;
