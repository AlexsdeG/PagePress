// PagePress v0.0.6 - 2025-12-03
// Top bar for the page builder

import { useEditor } from '@craftjs/core';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useBuilderStore, VIEWPORT_DIMENSIONS, type ViewportMode } from '@/stores/builder';
import { useBuilderContext } from '../context';

interface TopBarProps {
  pageTitle: string;
  isSaving: boolean;
}

/**
 * Top bar with save, undo/redo, viewport, and preview controls
 */
export function TopBar({ pageTitle, isSaving }: TopBarProps) {
  const navigate = useNavigate();
  const { save } = useBuilderContext();
  
  const {
    viewport,
    setViewport,
    isPreviewMode,
    togglePreviewMode,
    saveStatus,
    hasUnsavedChanges,
    autoSaveEnabled,
    setAutoSaveEnabled,
    lastSavedAt,
  } = useBuilderStore();

  const { canUndo, canRedo, actions } = useEditor((state, query) => ({
    canUndo: query.history.canUndo(),
    canRedo: query.history.canRedo(),
  }));

  // Format last saved time
  const formatLastSaved = () => {
    if (!lastSavedAt) return null;
    const now = new Date();
    const diff = now.getTime() - lastSavedAt.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes === 1) return '1 min ago';
    return `${minutes} mins ago`;
  };

  // Save status indicator
  const getSaveStatusDisplay = () => {
    switch (saveStatus) {
      case 'saving':
        return { text: 'Saving...', color: 'text-yellow-500' };
      case 'saved':
        return { text: 'Saved', color: 'text-green-500' };
      case 'error':
        return { text: 'Error saving', color: 'text-red-500' };
      default:
        return hasUnsavedChanges
          ? { text: 'Unsaved changes', color: 'text-orange-500' }
          : { text: formatLastSaved() || 'No changes', color: 'text-muted-foreground' };
    }
  };

  const statusDisplay = getSaveStatusDisplay();

  return (
    <div className="h-14 border-b bg-background flex items-center justify-between px-4">
      {/* Left section - Back & Title */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/pages')}>
          ← Back
        </Button>
        <div className="flex items-center gap-2">
          <h1 className="font-semibold truncate max-w-[200px]">{pageTitle}</h1>
          {hasUnsavedChanges && (
            <span className="text-xs text-orange-500">●</span>
          )}
        </div>
      </div>

      {/* Center section - Undo/Redo & Viewport */}
      <div className="flex items-center gap-2">
        {/* Undo/Redo */}
        <div className="flex items-center gap-1 border-r pr-4 mr-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => actions.history.undo()}
                disabled={!canUndo}
              >
                ↶
              </Button>
            </TooltipTrigger>
            <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => actions.history.redo()}
                disabled={!canRedo}
              >
                ↷
              </Button>
            </TooltipTrigger>
            <TooltipContent>Redo (Ctrl+Y)</TooltipContent>
          </Tooltip>
        </div>

        {/* Viewport selector */}
        <Select
          value={viewport}
          onValueChange={(value) => setViewport(value as ViewportMode)}
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(VIEWPORT_DIMENSIONS).map(([key, { label, width }]) => (
              <SelectItem key={key} value={key}>
                {label} ({width}px)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Preview toggle */}
        <Button
          variant={isPreviewMode ? 'secondary' : 'outline'}
          size="sm"
          onClick={togglePreviewMode}
        >
          {isPreviewMode ? '✎ Edit' : '👁 Preview'}
        </Button>
      </div>

      {/* Right section - Save status & actions */}
      <div className="flex items-center gap-4">
        {/* Auto-save toggle */}
        <div className="flex items-center gap-2 text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={autoSaveEnabled}
              onChange={(e) => setAutoSaveEnabled(e.target.checked)}
              className="rounded"
            />
            <span className="text-xs text-muted-foreground">Auto-save</span>
          </label>
        </div>

        {/* Save status */}
        <span className={`text-xs ${statusDisplay.color}`}>
          {statusDisplay.text}
        </span>

        {/* Save button */}
        <Button 
          onClick={save} 
          disabled={isSaving || saveStatus === 'saving' || !hasUnsavedChanges}
        >
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </div>
  );
}
