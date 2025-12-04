// PagePress v0.0.10 - 2025-12-04
// Top bar for the page builder

import { useState } from 'react';
import { useEditor } from '@craftjs/core';
import { useNavigate } from 'react-router-dom';
import { 
  Undo2, 
  Redo2, 
  Eye, 
  Pencil, 
  Save,
  Grid3X3,
  Maximize2,
  ArrowLeft,
  Settings,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useBuilderStore } from '@/stores/builder';
import { useBuilderContext } from '../context';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { BreakpointSelector } from '../responsive/BreakpointSelector';
import { GlobalSettingsPanel } from '../global/GlobalSettingsPanel';
import { PageSettingsPanel } from '../page/PageSettingsPanel';

interface TopBarProps {
  pageId: string;
  pageTitle: string;
  isSaving: boolean;
  onTitleChange?: (newTitle: string) => void;
}

/**
 * Top bar with save, undo/redo, viewport, and preview controls
 */
export function TopBar({ pageId, pageTitle, isSaving, onTitleChange }: TopBarProps) {
  const navigate = useNavigate();
  const { save } = useBuilderContext();
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState(pageTitle);
  const [isRenaming, setIsRenaming] = useState(false);
  const [globalSettingsOpen, setGlobalSettingsOpen] = useState(false);
  const [pageSettingsOpen, setPageSettingsOpen] = useState(false);
  
  const {
    isPreviewMode,
    setPreviewMode,
    isWireframeMode,
    toggleWireframeMode,
    showSpacingVisualizer,
    toggleSpacingVisualizer,
    saveStatus,
    hasUnsavedChanges,
    autoSaveEnabled,
    setAutoSaveEnabled,
    lastSavedAt,
  } = useBuilderStore();

  const { canUndo, canRedo, actions } = useEditor((_, query) => ({
    canUndo: query.history.canUndo(),
    canRedo: query.history.canRedo(),
  }));

  // Handle preview mode toggle with auto-save
  const handlePreviewToggle = async () => {
    // If switching TO preview mode and there are unsaved changes, save first
    if (!isPreviewMode && hasUnsavedChanges) {
      await save();
    }
    setPreviewMode(!isPreviewMode);
  };

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

  // Handle rename
  const handleRename = async () => {
    if (!newTitle.trim() || newTitle.trim() === pageTitle) {
      setRenameDialogOpen(false);
      return;
    }

    try {
      setIsRenaming(true);
      await api.pages.update(pageId, { title: newTitle.trim() });
      onTitleChange?.(newTitle.trim());
      toast.success('Page renamed');
      setRenameDialogOpen(false);
    } catch (error) {
      toast.error('Failed to rename page');
      console.error('Rename error:', error);
    } finally {
      setIsRenaming(false);
    }
  };

  // Open rename dialog
  const openRenameDialog = () => {
    setNewTitle(pageTitle);
    setRenameDialogOpen(true);
  };

  return (
    <div className="h-12 border-b bg-background flex items-center justify-between px-3">
      {/* Left section - Back & Title */}
      <div className="flex items-center gap-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate('/pages')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Back to Pages</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={openRenameDialog}
              className="flex items-center gap-2 hover:bg-muted px-2 py-1 rounded transition-colors"
            >
              <h1 className="font-semibold text-sm truncate max-w-[180px]">{pageTitle}</h1>
              {hasUnsavedChanges && (
                <span className="w-2 h-2 bg-orange-500 rounded-full" />
              )}
              <Pencil className="h-3 w-3 text-muted-foreground" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Click to rename</TooltipContent>
        </Tooltip>
      </div>

      {/* Center section - Undo/Redo, Viewport, View Options */}
      <div className="flex items-center gap-1">
        {/* Undo/Redo */}
        <div className="flex items-center gap-0.5 border-r pr-2 mr-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => actions.history.undo()}
                disabled={!canUndo}
              >
                <Undo2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => actions.history.redo()}
                disabled={!canRedo}
              >
                <Redo2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Redo (Ctrl+Y)</TooltipContent>
          </Tooltip>
        </div>

        {/* Viewport selector - Breakpoint Selector */}
        <div className="flex items-center gap-0.5 border-r pr-2 mr-2">
          <BreakpointSelector />
        </div>

        {/* Page & Global Settings */}
        <div className="flex items-center gap-0.5 border-r pr-2 mr-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={pageSettingsOpen ? 'secondary' : 'ghost'}
                size="icon"
                className="h-8 w-8"
                onClick={() => setPageSettingsOpen(true)}
              >
                <FileText className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Page Settings</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={globalSettingsOpen ? 'secondary' : 'ghost'}
                size="icon"
                className="h-8 w-8"
                onClick={() => setGlobalSettingsOpen(true)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Global Settings</TooltipContent>
          </Tooltip>
        </div>

        {/* View options dropdown */}
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant={isWireframeMode || showSpacingVisualizer ? 'secondary' : 'ghost'} 
                  size="icon" 
                  className="h-8 w-8"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>View Options</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="center">
            <DropdownMenuLabel>View Options</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={isWireframeMode}
              onCheckedChange={toggleWireframeMode}
            >
              <Grid3X3 className="h-4 w-4 mr-2" />
              Wireframe Mode
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={showSpacingVisualizer}
              onCheckedChange={toggleSpacingVisualizer}
            >
              <Maximize2 className="h-4 w-4 mr-2" />
              Show Spacing
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Preview toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isPreviewMode ? 'secondary' : 'ghost'}
              size="sm"
              className="h-8 gap-1.5"
              onClick={handlePreviewToggle}
            >
              {isPreviewMode ? (
                <>
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </>
              ) : (
                <>
                  <Eye className="h-3.5 w-3.5" />
                  Preview
                </>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{isPreviewMode ? 'Exit Preview' : 'Preview Page'}</TooltipContent>
        </Tooltip>
      </div>

      {/* Right section - Save status & actions */}
      <div className="flex items-center gap-3">
        {/* Auto-save toggle */}
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={autoSaveEnabled}
            onChange={(e) => setAutoSaveEnabled(e.target.checked)}
            className="rounded h-3.5 w-3.5"
          />
          <span className="text-xs text-muted-foreground">Auto</span>
        </label>

        {/* Save status */}
        <span className={cn('text-xs', statusDisplay.color)}>
          {statusDisplay.text}
        </span>

        {/* Save button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              size="sm"
              className="h-8 gap-1.5"
              onClick={save} 
              disabled={isSaving || saveStatus === 'saving' || !hasUnsavedChanges}
            >
              <Save className="h-3.5 w-3.5" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Save (Ctrl+S)</TooltipContent>
        </Tooltip>
      </div>

      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Rename Page</DialogTitle>
            <DialogDescription>
              Enter a new title for this page.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Page title"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleRename();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRenameDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRename}
              disabled={isRenaming || !newTitle.trim()}
            >
              {isRenaming ? 'Renaming...' : 'Rename'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Global Settings Panel */}
      <GlobalSettingsPanel
        isOpen={globalSettingsOpen}
        onClose={() => setGlobalSettingsOpen(false)}
      />

      {/* Page Settings Panel */}
      <PageSettingsPanel
        isOpen={pageSettingsOpen}
        onClose={() => setPageSettingsOpen(false)}
        pageId={pageId}
      />
    </div>
  );
}
